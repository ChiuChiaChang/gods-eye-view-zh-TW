import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchMjpegFrameFromUpstream } from '../../server/providers/cctv/media.js';

test('MJPEG frame extractor returns the first JPEG from a multipart stream', async () => {
  const boundary = '--frame\r\nContent-Type: image/jpeg\r\n\r\n';
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x01, 0xff, 0xd9]);
  const body = Buffer.concat([
    Buffer.from(boundary, 'utf8'),
    jpeg,
    Buffer.from('\r\n--frame\r\n', 'utf8'),
  ]);

  const result = await fetchMjpegFrameFromUpstream(
    'https://camera.example/live/mjpg/video.cgi?camera=1',
    {
      timeoutMs: 1000,
      fetchImpl: async () =>
        new Response(body, {
          headers: {
            'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
          },
        }),
    },
  );

  assert.equal(result?.ok, true);
  assert.equal(result?.contentType, 'image/jpeg');
  assert.deepEqual(result?.body, jpeg);
});
