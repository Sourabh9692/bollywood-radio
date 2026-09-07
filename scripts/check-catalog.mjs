import assert from 'node:assert/strict';
import { songs } from '../lib/catalog.ts';

assert.ok(songs.length >= 30, 'At least 30 songs required');
assert.equal(new Set(songs.map((s) => s.id)).size, songs.length, 'Unique IDs');
for (const s of songs) {
  assert.match(s.youtubeId, /^[A-Za-z0-9_-]{11}$/);
  assert.ok(s.year >= 1990 && s.year <= 2020);
  assert.ok(s.title && s.movie && s.artist && s.moods.length);
}
for (const decade of ['90s', '2000s', '2010s', '2020'])
  assert.ok(songs.some((s) => s.decade === decade));
console.log(`Catalogue structure passed: ${songs.length} songs.`);
if (process.argv.includes('--online')) {
  let failed = 0;
  for (let offset = 0; offset < songs.length; offset += 5) {
    await Promise.all(
      songs.slice(offset, offset + 5).map(async (song) => {
        try {
          const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${song.youtubeId}`)}&format=json`;
          const response = await fetch(url, {
            signal: AbortSignal.timeout(20000),
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          console.log(
            `${song.youtubeId} | ${song.title} | ${data.title} | ${data.author_name}`,
          );
        } catch (error) {
          failed++;
          console.error(`${song.title}: ${error.message}`);
        }
      }),
    );
  }
  if (failed) process.exitCode = 1;
}
