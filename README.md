# Mehfil — Bollywood Radio

[Open Mehfil](https://sourabh9692.github.io/mehfil-web/)

A handpicked Bollywood listening website built with React, TypeScript, and Vite. Search by song, movie, or artist, browse by mood, and save personal playlists in your browser.

## Run locally

Requires Node.js 22.13 or later. Use Node 24+ for the catalogue check script.

```sh
npm ci
npm run dev
```

## Build and verify

```sh
npm run build
npx tsc --noEmit
node --experimental-strip-types scripts/check-catalog.mjs
node --experimental-strip-types scripts/check-catalog.mjs --online
```

The production output is `dist/client`. Upload that directory to any static HTTPS host. No backend or account system is required.

## Features

- 30 curated Bollywood songs, searchable by song, movie, and artist.
- Decade and mood browsing; featured romantic, classic, and party collections.
- Visible embedded YouTube player with play/pause, previous/next, seek, volume, shuffle, and repeat controls.
- Editable queue and custom playlists; favourites and playlists persist in localStorage on each visitor's browser.
- Song details and responsive desktop/mobile layouts. No login, backend, PWA manifest, or service worker.

## Catalogue and playback

Edit `lib/catalog.ts` to change songs. Each record includes the original movie release year, singers, YouTube video ID, and moods. Source videos are linked by those IDs; thumbnails come from YouTube. No lyrics, audio downloads, or audio extraction are provided. Search is over this curated catalogue, not all of YouTube.

YouTube controls playback availability, advertisements, embedding restrictions, and regional restrictions. The app surfaces embed errors and offers skipping to another song. Browsers may require a direct click on the video player to permit playback. The embedded viewport stays at least 200px high and wide; it is not hidden or covered. Mobile devices may require hardware volume controls. An oEmbed metadata check establishes that a source exists, not that it plays in every visitor's country.

Favourites/playlists are device-local and are not synced between visitors. The website source contains no credentials.
