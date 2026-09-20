import {
  fallbackHeadingFromId,
  isPlausibleLatLon,
  prioritizeSources,
} from './normalize.js';
import { directionToHeading } from '../../../src/data/directionText.js';
import { inferTdxFeedType } from './tdx.js';
import { readResponseJsonCapped } from '../common/http.js';

export const TAIWAN_CCTV_ARCGIS_SERVICE =
  'https://gist-arcgis.transportdata.tw/server/rest/services/Hosted/CCTV/FeatureServer';

const TAIWAN_OPEN_DATA_TIMEOUT_MS = 15000;
const TAIWAN_OPEN_DATA_MAX_META_BYTES = 2 * 1024 * 1024;
const TAIWAN_OPEN_DATA_MAX_PAGE_BYTES = 12 * 1024 * 1024;
const TAIWAN_OPEN_DATA_PAGE_SIZE = 2000;
const TAIWAN_OPEN_DATA_MAX_PAGES_PER_LAYER = 8;
const DEFAULT_TAIWAN_OPEN_DATA_MAX_SOURCES = 1500;
const TAIWAN_ANCHORS = Object.freeze([
  { lat: 25.1283, lon: 121.7419 }, // Keelung
  { lat: 25.033, lon: 121.5654 }, // Taipei
  { lat: 25.012, lon: 121.4657 }, // New Taipei
  { lat: 24.9937, lon: 121.301 }, // Taoyuan
  { lat: 24.8138, lon: 120.9675 }, // Hsinchu
  { lat: 24.757, lon: 121.753 }, // Yilan
  { lat: 24.1477, lon: 120.6736 }, // Taichung
  { lat: 23.4801, lon: 120.4491 }, // Chiayi
  { lat: 22.9999, lon: 120.227 }, // Tainan
  { lat: 22.6273, lon: 120.3014 }, // Kaohsiung
  { lat: 22.672, lon: 120.488 }, // Pingtung
]);

function positiveInt(value, fallback, min = 1, max = 10000) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function cleanId(value) {
  return String(value || '')
    .trim()
    .replace(/[^A-Za-z0-9_.-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function attrMap(attributes) {
  const out = {};
  for (const [key, value] of Object.entries(attributes || {})) {
    out[String(key).toLowerCase()] = value;
  }
  return out;
}

function directionHeading(value) {
  const text = String(value || '').trim().toUpperCase();
  const compact = {
    N: 0,
    NE: 45,
    E: 90,
    SE: 135,
    S: 180,
    SW: 225,
    W: 270,
    NW: 315,
    '北': 0,
    '東北': 45,
    '東': 90,
    '東南': 135,
    '南': 180,
    '西南': 225,
    '西': 270,
    '西北': 315,
  };
  if (Object.hasOwn(compact, text)) return compact[text];
  return directionToHeading(text, true);
}

function isTaiwanCoordinate(lat, lon) {
  return (
    isPlausibleLatLon(lat, lon) &&
    lat >= 20.5 &&
    lat <= 26.8 &&
    lon >= 117.5 &&
    lon <= 123.8
  );
}

function validHttpUrl(value) {
  const text = String(value || '').trim();
  if (!/^https?:\/\//i.test(text)) return '';
  try {
    const url = new URL(text);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

export function taiwanArcgisFeatureToSource(
  feature,
  { layerId = 'x', layerName = 'Taiwan' } = {},
) {
  const attrs = attrMap(feature?.attributes);
  const cameraCode = String(attrs.cctvid || '').trim();
  const rawId = String(
    attrs.uniqueid || cameraCode || attrs.id || '',
  ).trim();
  if (!rawId) return null;

  const lat = Number(attrs.positionlat ?? feature?.geometry?.y);
  const lon = Number(attrs.positionlon ?? feature?.geometry?.x);
  if (!isTaiwanCoordinate(lat, lon)) return null;

  const streamUrl = validHttpUrl(attrs.videostreamurl);
  const imageUrl = validHttpUrl(attrs.videoimageurl);
  const primaryUrl = streamUrl || imageUrl;
  if (!primaryUrl) return null;

  // CCTVID values such as C000001 are NOT globally unique across the 13
  // authority layers. Layer-scoping prevents Taipei/New Taipei/etc. records
  // from overwriting cameras with the same provider-local code.
  const id = `tw-open-l${cleanId(layerId) || 'x'}-${
    cleanId(rawId) || cleanId(cameraCode) || 'camera'
  }`;
  const roadDirection = String(attrs.roaddirection || '').trim();
  const parsedHeading = directionHeading(roadDirection);
  const hasHeading = Number.isFinite(parsedHeading);
  const roadName = String(attrs.roadname || '').trim();
  const mile = String(attrs.locationmile || '').trim();
  const city = String(attrs.city || layerName || 'Taiwan').trim() || 'Taiwan';
  const name =
    [roadName, mile, roadDirection].filter(Boolean).join(' · ') ||
    `Taiwan CCTV ${rawId}`;

  return {
    id,
    name,
    city,
    cityId: `tw-${cleanId(city).toLowerCase() || 'taiwan'}`,
    provider: 'Taiwan MOTC Open Data',
    lat,
    lon,
    headingDeg: hasHeading ? parsedHeading : fallbackHeadingFromId(id),
    headingConfidence: hasHeading ? 'high' : 'low',
    pitchDeg: hasHeading ? -22 : -17,
    fovDeg: hasHeading ? 58 : 46,
    rangeM: hasHeading ? 190 : 150,
    mountHeightM: hasHeading ? 10 : 8,
    groundElevationM: 30,
    feedType: streamUrl ? inferTdxFeedType(streamUrl) : 'image',
    url: primaryUrl,
    // Prefer the provider's still image for cards when available; otherwise
    // the server extracts the first JPEG from MJPEG.
    snapshotUrl: imageUrl || streamUrl,
    sourceKind: 'taiwan-open-data',
    license: 'Taiwan Government Open Data Licence 1.0 / source-authority terms',
    credit: '交通部 TDX / 運輸資料 GIS 公開服務',
    code: cameraCode || rawId,
  };
}

async function fetchJson(url, maxBytes, fetchImpl) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new DOMException('Taiwan CCTV fetch timed out', 'TimeoutError')),
    TAIWAN_OPEN_DATA_TIMEOUT_MS,
  );
  try {
    const response = await fetchImpl(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'gods-eye-view-taiwan-cctv/1.0',
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await readResponseJsonCapped(response, maxBytes, controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

function selectedLayerIds(layers, env) {
  const requested = String(env?.CCTV_TAIWAN_LAYER_IDS ?? '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter(Number.isInteger);
  if (!requested.length) return layers;
  const allow = new Set(requested);
  return layers.filter((layer) => allow.has(Number(layer.id)));
}

async function fetchLayerFeatures(serviceUrl, layer, fetchImpl) {
  const features = [];
  for (let page = 0; page < TAIWAN_OPEN_DATA_MAX_PAGES_PER_LAYER; page += 1) {
    const query = new URL(`${serviceUrl}/${encodeURIComponent(layer.id)}/query`);
    query.searchParams.set('where', '1=1');
    query.searchParams.set(
      'outFields',
      [
        'id',
        'uniqueid',
        'city',
        'cctvid',
        'subauthoritycode',
        'videostreamurl',
        'videoimageurl',
        'positionlon',
        'positionlat',
        'roadname',
        'roaddirection',
        'locationmile',
      ].join(','),
    );
    query.searchParams.set('returnGeometry', 'true');
    query.searchParams.set('outSR', '4326');
    query.searchParams.set('resultOffset', String(page * TAIWAN_OPEN_DATA_PAGE_SIZE));
    query.searchParams.set('resultRecordCount', String(TAIWAN_OPEN_DATA_PAGE_SIZE));
    query.searchParams.set('f', 'json');

    const payload = await fetchJson(
      query.toString(),
      TAIWAN_OPEN_DATA_MAX_PAGE_BYTES,
      fetchImpl,
    );
    if (payload?.error) {
      throw new Error(
        `Layer ${layer.id} query error: ${payload.error.message || 'unknown'}`,
      );
    }
    const pageFeatures = Array.isArray(payload?.features) ? payload.features : [];
    features.push(...pageFeatures);
    if (!payload?.exceededTransferLimit && pageFeatures.length < TAIWAN_OPEN_DATA_PAGE_SIZE)
      break;
    if (!pageFeatures.length) break;
  }
  return features;
}

function roundRobinLayerCameras(layerCameras, maxCount) {
  const lanes = layerCameras
    .map((entry) => ({
      layer: entry.layer,
      cameras: prioritizeSources(entry.cameras, entry.cameras.length, TAIWAN_ANCHORS),
      index: 0,
    }))
    .filter((entry) => entry.cameras.length > 0);

  const total = lanes.reduce((sum, lane) => sum + lane.cameras.length, 0);
  const limit = Math.min(maxCount, total);
  const out = [];
  const seen = new Set();

  while (out.length < limit) {
    let advanced = false;
    for (const lane of lanes) {
      while (lane.index < lane.cameras.length) {
        const camera = lane.cameras[lane.index++];
        if (!camera?.id || seen.has(camera.id)) continue;
        seen.add(camera.id);
        out.push(camera);
        advanced = true;
        break;
      }
      if (out.length >= limit) break;
    }
    if (!advanced) break;
  }
  return out;
}

export async function loadTaiwanOpenDataCctvSources({
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  if (String(env?.CCTV_TAIWAN_OPEN_DATA_ENABLED ?? '1').trim() === '0') return [];

  const serviceUrl = String(
    env?.CCTV_TAIWAN_ARCGIS_SERVICE || TAIWAN_CCTV_ARCGIS_SERVICE,
  ).replace(/\/+$/, '');

  try {
    const metaUrl = new URL(serviceUrl);
    metaUrl.searchParams.set('f', 'json');
    const metadata = await fetchJson(
      metaUrl.toString(),
      TAIWAN_OPEN_DATA_MAX_META_BYTES,
      fetchImpl,
    );
    const layers = selectedLayerIds(
      (Array.isArray(metadata?.layers) ? metadata.layers : []).filter(
        (layer) => Number.isInteger(Number(layer?.id)),
      ),
      env,
    );
    if (!layers.length) {
      console.warn('[CCTV] Taiwan open-data service returned no layers');
      return [];
    }

    const settled = await Promise.allSettled(
      layers.map(async (layer) => ({
        layer,
        features: await fetchLayerFeatures(serviceUrl, layer, fetchImpl),
      })),
    );

    const layerCameras = [];
    let rawCameraCount = 0;
    for (const result of settled) {
      if (result.status !== 'fulfilled') {
        console.warn(
          '[CCTV] Taiwan open-data layer failed:',
          result.reason?.message || result.reason,
        );
        continue;
      }

      const cameras = [];
      const layerId = String(result.value.layer?.id ?? 'x');
      const layerName = result.value.layer?.name || 'Taiwan';
      for (const feature of result.value.features) {
        const camera = taiwanArcgisFeatureToSource(feature, {
          layerId,
          layerName,
        });
        if (camera) cameras.push(camera);
      }
      rawCameraCount += cameras.length;
      layerCameras.push({
        layer: result.value.layer,
        cameras: Array.from(
          new Map(cameras.map((camera) => [camera.id, camera])).values(),
        ),
      });
    }

    const maxCount = positiveInt(
      env?.CCTV_TAIWAN_MAX_SOURCES,
      DEFAULT_TAIWAN_OPEN_DATA_MAX_SOURCES,
      8,
      3000,
    );
    // Preserve every authority/region under the cap instead of sorting the
    // whole island into one list. One camera is taken from each layer per pass,
    // so 屏東/高雄 can never crowd out 新北/台北/桃園/新竹/宜蘭.
    const distributed = roundRobinLayerCameras(layerCameras, maxCount);
    const layerSummary = layerCameras
      .filter((entry) => entry.cameras.length)
      .map(
        (entry) =>
          `${entry.layer?.name || entry.layer?.id || '?'}:${entry.cameras.length}`,
      )
      .join(', ');
    console.log(
      `[CCTV] Loaded Taiwan open-data cameras: ${distributed.length}/${rawCameraCount} across ${layerCameras.length} layers (${layerSummary})`,
    );
    return distributed;
  } catch (error) {
    console.warn(
      '[CCTV] Taiwan open-data catalog error:',
      error?.message || error,
    );
    return [];
  }
}
