import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TDX_TOKEN_URL,
  buildTdxCctvEndpoints,
  getTdxAccessToken,
  inferTdxFeedType,
  loadTdxTaiwanCctvSources,
  tdxCameraToSource,
} from '../../server/providers/cctv/tdx.js';

const sample = {
  CCTVID: 'N1-S-1-M',
  AuthorityCode: 'NFB',
  VideoStreamURL:
    'https://cctvs.freeway.gov.tw/live-view/mjpg/video.cgi?camera=1096',
  PositionLon: 121.5654,
  PositionLat: 25.033,
  RoadName: '國道一號',
  RoadDirection: 'S',
  LocationMile: '1K+105',
};

test('TDX feed type detection recognizes Taiwan MJPEG/HLS/image URLs', () => {
  assert.equal(inferTdxFeedType(sample.VideoStreamURL), 'mjpeg');
  assert.equal(inferTdxFeedType('https://example.test/live/cam.m3u8'), 'hls');
  assert.equal(inferTdxFeedType('https://example.test/cam.jpg?v=1'), 'image');
});

test('TDX CCTV row maps to a God\'s Eye View source', () => {
  const source = tdxCameraToSource(sample, { scope: 'Freeway' });
  assert.ok(source);
  assert.equal(source.provider, 'TDX / MOTC Taiwan');
  assert.equal(source.feedType, 'mjpeg');
  assert.equal(source.lat, 25.033);
  assert.equal(source.lon, 121.5654);
  assert.equal(source.headingDeg, 180);
  assert.match(source.id, /^tw-tdx-freeway-/);
  assert.match(source.name, /國道一號/);
});

test('TDX endpoint builder supports freeway/highway and selected cities', () => {
  const endpoints = buildTdxCctvEndpoints({
    TDX_CCTV_INCLUDE_FREEWAY: '1',
    TDX_CCTV_INCLUDE_HIGHWAY: '0',
    TDX_CCTV_CITIES: 'Taipei,NewTaipei',
  });
  assert.deepEqual(
    endpoints.map((entry) => entry.scope),
    ['Freeway', 'City/Taipei', 'City/NewTaipei'],
  );
  assert.ok(endpoints.every((entry) => entry.url.includes('/Road/Traffic/CCTV/')));
});

test('TDX OAuth uses client credentials and the CCTV loader maps results', async () => {
  const env = {
    CCTV_TDX_ENABLED: '1',
    TDX_CLIENT_ID: 'client-test',
    TDX_CLIENT_SECRET: 'secret-test',
    TDX_CCTV_INCLUDE_FREEWAY: '1',
    TDX_CCTV_INCLUDE_HIGHWAY: '0',
    TDX_CCTV_CITIES: '',
    TDX_CCTV_MAX_SOURCES: '20',
  };
  const seen = [];
  const fetchImpl = async (url, init = {}) => {
    const text = String(url);
    seen.push({ url: text, init });
    if (text === TDX_TOKEN_URL) {
      assert.equal(init.method, 'POST');
      assert.match(String(init.body), /grant_type=client_credentials/);
      assert.match(String(init.body), /client_id=client-test/);
      return Response.json({
        access_token: 'token-test',
        expires_in: 3600,
        token_type: 'Bearer',
      });
    }
    assert.match(text, /\/Road\/Traffic\/CCTV\/Freeway/);
    assert.equal(init.headers.Authorization, 'Bearer token-test');
    return Response.json([sample]);
  };

  const token = await getTdxAccessToken({ env, fetchImpl });
  assert.equal(token, 'token-test');

  const cameras = await loadTdxTaiwanCctvSources({ env, fetchImpl });
  assert.equal(cameras.length, 1);
  assert.equal(cameras[0].sourceKind, 'tdx-taiwan-cctv');
  assert.equal(cameras[0].code, 'N1-S-1-M');
  assert.ok(seen.some((entry) => entry.url.includes('$format=JSON')));
});
