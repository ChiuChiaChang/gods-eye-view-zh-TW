import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TAIWAN_CCTV_ARCGIS_SERVICE,
  loadTaiwanOpenDataCctvSources,
  taiwanArcgisFeatureToSource,
} from '../../server/providers/cctv/taiwanOpenData.js';

const FEATURE = {
  attributes: {
    cctvid: 'CCTV-N1-N-001.000-M',
    city: '臺北市',
    videostreamurl:
      'https://cctvn.freeway.gov.tw/abs2mjpg/bmjpg?camera=1096',
    videoimageurl:
      'https://cctvn.freeway.gov.tw/snapshots/camera1096.jpg',
    positionlon: '121.5654',
    positionlat: '25.0330',
    roadname: '國道1號',
    roaddirection: 'N',
    locationmile: '1K+000',
  },
  geometry: { x: 121.5654, y: 25.033 },
};

test('Taiwan ArcGIS feature maps to a keyless live CCTV source', () => {
  const camera = taiwanArcgisFeatureToSource(FEATURE, { layerName: '臺北市' });
  assert.ok(camera);
  assert.equal(camera.sourceKind, 'taiwan-open-data');
  assert.equal(camera.provider, 'Taiwan MOTC Open Data');
  assert.equal(camera.feedType, 'mjpeg');
  assert.equal(camera.headingDeg, 0);
  assert.equal(camera.lat, 25.033);
  assert.equal(camera.lon, 121.5654);
  assert.equal(
    camera.snapshotUrl,
    'https://cctvn.freeway.gov.tw/snapshots/camera1096.jpg',
  );
  assert.match(camera.id, /^tw-open-/);
});

test('Taiwan ArcGIS loader needs no TDX credentials', async () => {
  const seen = [];
  const fetchImpl = async (url) => {
    const text = String(url);
    seen.push(text);
    if (text.startsWith(TAIWAN_CCTV_ARCGIS_SERVICE + '?')) {
      return Response.json({
        layers: [{ id: 8, name: '臺北市' }],
      });
    }
    if (text.includes('/8/query?')) {
      return Response.json({
        features: [FEATURE],
        exceededTransferLimit: false,
      });
    }
    throw new Error('unexpected URL: ' + text);
  };

  const cameras = await loadTaiwanOpenDataCctvSources({
    env: {
      CCTV_TAIWAN_OPEN_DATA_ENABLED: '1',
      CCTV_TAIWAN_MAX_SOURCES: '100',
    },
    fetchImpl,
  });

  assert.equal(cameras.length, 1);
  assert.equal(cameras[0].city, '臺北市');
  assert.ok(
    seen.some((url) => url.includes('/8/query?')),
    'layer query should run',
  );
});
