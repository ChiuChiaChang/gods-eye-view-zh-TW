import {
  fallbackHeadingFromId,
  isPlausibleLatLon,
  prioritizeSources,
} from './normalize.js';
import { directionToHeading } from '../../../src/data/directionText.js';

export const TDX_TOKEN_URL =
  'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
export const TDX_API_BASE = 'https://tdx.transportdata.tw/api/basic/v2';
export const DEFAULT_TDX_CCTV_CITIES = Object.freeze([
  'Taipei',
  'NewTaipei',
  'Taoyuan',
  'Taichung',
  'Tainan',
  'Kaohsiung',
]);

const DEFAULT_TDX_CCTV_MAX_SOURCES = 1200;
const TDX_FETCH_TIMEOUT_MS = 12000;
const TAIWAN_ANCHORS = Object.freeze([
  { lat: 25.033, lon: 121.5654 }, // Taipei
  { lat: 24.9937, lon: 121.301 }, // Taoyuan
  { lat: 24.1477, lon: 120.6736 }, // Taichung
  { lat: 22.9999, lon: 120.227 }, // Tainan
  { lat: 22.6273, lon: 120.3014 }, // Kaohsiung
]);

let tokenCache = {
  credentialKey: '',
  token: '',
  expiresAt: 0,
};

function envEnabled(env, name, defaultValue = '1') {
  return String(env?.[name] ?? defaultValue).trim() !== '0';
}

function positiveInt(value, fallback, min = 1, max = 10000) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function cleanSegment(value) {
  return String(value || '')
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function cityLabel(scope, authorityCode) {
  const authority = String(authorityCode || '').trim().toUpperCase();
  const byAuthority = {
    TPE: 'Taipei',
    NWT: 'New Taipei',
    TAO: 'Taoyuan',
    TXG: 'Taichung',
    TNN: 'Tainan',
    KHH: 'Kaohsiung',
  };
  if (byAuthority[authority]) return byAuthority[authority];
  if (scope === 'Freeway') return 'Taiwan Freeway';
  if (scope === 'Highway') return 'Taiwan Highway';
  if (scope.startsWith('City/')) return scope.slice('City/'.length);
  return 'Taiwan';
}

function unwrapCctvRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  for (const key of ['CCTVs', 'CCTV', 'data', 'Data', 'value']) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  for (const key of ['CCTVList', 'result', 'Result']) {
    const nested = payload[key];
    if (!nested || typeof nested !== 'object') continue;
    for (const childKey of ['CCTVs', 'CCTV', 'data', 'Data', 'value']) {
      if (Array.isArray(nested[childKey])) return nested[childKey];
    }
  }
  return [];
}

export function inferTdxFeedType(url) {
  const text = String(url || '').trim().toLowerCase();
  if (!text) return 'image';
  if (
    text.includes('/mjpg/') ||
    text.includes('mjpeg') ||
    /video\.cgi(?:\?|$)/.test(text)
  )
    return 'mjpeg';
  if (text.includes('.m3u8')) return 'hls';
  if (text.includes('.webm')) return 'webm';
  if (text.includes('.mp4')) return 'mp4';
  if (/\.(?:jpe?g|png|gif)(?:\?|$)/.test(text)) return 'image';
  // Most Taiwan road CCTV feeds are stream endpoints rather than still URLs.
  // Unknown endpoints stay on the image path so the existing frame proxy can
  // probe them and fail over safely instead of forcing a <video> element.
  return 'image';
}

export function buildTdxCctvEndpoints(env = process.env) {
  const base = String(env?.TDX_API_BASE || TDX_API_BASE).replace(/\/+$/, '');
  const endpoints = [];
  if (envEnabled(env, 'TDX_CCTV_INCLUDE_FREEWAY'))
    endpoints.push({ scope: 'Freeway', url: `${base}/Road/Traffic/CCTV/Freeway` });
  if (envEnabled(env, 'TDX_CCTV_INCLUDE_HIGHWAY'))
    endpoints.push({ scope: 'Highway', url: `${base}/Road/Traffic/CCTV/Highway` });

  const cities = String(
    env?.TDX_CCTV_CITIES ?? DEFAULT_TDX_CCTV_CITIES.join(','),
  )
    .split(',')
    .map((city) => city.trim())
    .filter(Boolean);

  for (const city of cities) {
    const safeCity = /^[A-Za-z][A-Za-z0-9_-]*$/.test(city) ? city : '';
    if (!safeCity) continue;
    endpoints.push({
      scope: `City/${safeCity}`,
      url: `${base}/Road/Traffic/CCTV/City/${encodeURIComponent(safeCity)}`,
    });
  }
  return endpoints;
}

export async function getTdxAccessToken({
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  const clientId = String(env?.TDX_CLIENT_ID || '').trim();
  const clientSecret = String(env?.TDX_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) return '';

  const credentialKey = `${clientId}\u0000${clientSecret}`;
  const now = Date.now();
  if (
    tokenCache.credentialKey === credentialKey &&
    tokenCache.token &&
    tokenCache.expiresAt - now > 60000
  ) {
    return tokenCache.token;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetchImpl(
    String(env?.TDX_TOKEN_URL || TDX_TOKEN_URL).trim(),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'gods-eye-view-taiwan-cctv/1.0',
      },
      body,
      signal: AbortSignal.timeout(TDX_FETCH_TIMEOUT_MS),
    },
  );
  if (!response.ok) {
    throw new Error(`TDX token HTTP ${response.status}`);
  }

  const payload = await response.json();
  const token = String(payload?.access_token || '').trim();
  if (!token) throw new Error('TDX token response has no access_token');

  const expiresIn = positiveInt(payload?.expires_in, 3600, 60, 86400 * 7);
  tokenCache = {
    credentialKey,
    token,
    // Refresh slightly before the provider expiry.
    expiresAt: now + Math.max(60000, (expiresIn - 60) * 1000),
  };
  return token;
}

export function tdxCameraToSource(row, { scope = 'Taiwan' } = {}) {
  if (!row || typeof row !== 'object') return null;
  const rawId = String(
    row.CCTVID ?? row.CctvID ?? row.cctvid ?? row.id ?? '',
  ).trim();
  if (!rawId) return null;

  const lat = Number(row.PositionLat ?? row.positionLat ?? row.lat);
  const lon = Number(row.PositionLon ?? row.positionLon ?? row.lon);
  if (!isPlausibleLatLon(lat, lon)) return null;
  // Taiwan main island + offshore-island slack. This mostly catches swapped
  // coordinates and broken upstream rows without excluding legitimate cameras.
  if (lat < 20.5 || lat > 26.8 || lon < 117.5 || lon > 123.8) return null;

  const streamUrl = String(
    row.VideoStreamURL ??
      row.videoStreamURL ??
      row.VideoImageURL ??
      row.videoImageURL ??
      '',
  ).trim();
  if (!/^https?:\/\//i.test(streamUrl)) return null;

  const roadDirection = String(
    row.RoadDirection ?? row.roadDirection ?? '',
  ).trim();
  const parsedHeading = directionToHeading(roadDirection, true);
  const scopeId = cleanSegment(scope).toLowerCase() || 'tw';
  const sourceId = cleanSegment(rawId) || 'camera';
  const id = `tw-tdx-${scopeId}-${sourceId}`;
  const headingDeg = Number.isFinite(parsedHeading)
    ? parsedHeading
    : fallbackHeadingFromId(id);

  const roadName = String(row.RoadName ?? row.roadName ?? '').trim();
  const mile = String(row.LocationMile ?? row.locationMile ?? '').trim();
  const name =
    [roadName, mile, roadDirection].filter(Boolean).join(' · ') ||
    `Taiwan CCTV ${rawId}`;
  const authorityCode = String(
    row.AuthorityCode ?? row.authorityCode ?? '',
  ).trim();

  return {
    id,
    name,
    city: cityLabel(scope, authorityCode),
    cityId: scope.startsWith('City/')
      ? `tw-${scope.slice('City/'.length).toLowerCase()}`
      : 'tw-taiwan',
    provider: 'TDX / MOTC Taiwan',
    lat,
    lon,
    headingDeg,
    headingConfidence: Number.isFinite(parsedHeading) ? 'high' : 'low',
    pitchDeg: -16,
    fovDeg: 58,
    rangeM: 180,
    mountHeightM: 9,
    groundElevationM: 0,
    feedType: inferTdxFeedType(streamUrl),
    url: streamUrl,
    snapshotUrl: streamUrl,
    sourceKind: 'tdx-taiwan-cctv',
    license:
      'Taiwan MOTC / TDX traffic CCTV data; source authority terms and Taiwan Government Open Data License apply where published',
    credit: '交通部 TDX 運輸資料流通服務',
    code: rawId,
  };
}

export async function loadTdxTaiwanCctvSources({
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  if (!envEnabled(env, 'CCTV_TDX_ENABLED')) return [];
  const clientId = String(env?.TDX_CLIENT_ID || '').trim();
  const clientSecret = String(env?.TDX_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) return [];

  let token = '';
  try {
    token = await getTdxAccessToken({ env, fetchImpl });
  } catch (error) {
    console.warn('[CCTV] TDX authentication failed:', error?.message || error);
    return [];
  }
  if (!token) return [];

  const top = positiveInt(env?.TDX_CCTV_TOP, 10000, 30, 10000);
  const endpoints = buildTdxCctvEndpoints(env);
  const settled = await Promise.allSettled(
    endpoints.map(async ({ scope, url }) => {
      const endpoint = new URL(url);
      endpoint.searchParams.set('$top', String(top));
      endpoint.searchParams.set('$format', 'JSON');
      const response = await fetchImpl(endpoint.toString(), {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'gods-eye-view-taiwan-cctv/1.0',
        },
        signal: AbortSignal.timeout(TDX_FETCH_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`${scope} HTTP ${response.status}`);
      return {
        scope,
        rows: unwrapCctvRows(await response.json()),
      };
    }),
  );

  const cameras = [];
  for (const result of settled) {
    if (result.status !== 'fulfilled') {
      console.warn(
        '[CCTV] TDX CCTV endpoint failed:',
        result.reason?.message || result.reason,
      );
      continue;
    }
    for (const row of result.value.rows) {
      const camera = tdxCameraToSource(row, { scope: result.value.scope });
      if (camera) cameras.push(camera);
    }
  }

  const unique = Array.from(
    new Map(cameras.map((camera) => [camera.id, camera])).values(),
  );
  const maxCount = positiveInt(
    env?.TDX_CCTV_MAX_SOURCES,
    DEFAULT_TDX_CCTV_MAX_SOURCES,
    8,
    4000,
  );
  const prioritized = prioritizeSources(unique, maxCount, TAIWAN_ANCHORS);
  console.log(
    `[CCTV] Loaded Taiwan TDX cameras: ${prioritized.length}/${unique.length}`,
  );
  return prioritized;
}
