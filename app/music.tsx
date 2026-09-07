'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Search,
  Heart,
  Plus,
  ListMusic,
  X,
  Volume2,
  Music2,
  ArrowUp,
  ArrowDown,
  Disc3,
  ArrowUpRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { songs, thumbnail, moods, type Song } from '@/lib/catalog';
type Playlist = { id: string; name: string; songs: string[] };
type Player = {
  loadVideoById(id: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(n: number, allow: boolean): void;
  setVolume(n: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
};
declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, options: Record<string, unknown>) => Player;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
const clock = (n: number) =>
  `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
const findSong = (id: string) => songs.find((s) => s.id === id)!;
export default function Music() {
  const [search, setSearch] = useState(''),
    [decade, setDecade] = useState('All years'),
    [mood, setMood] = useState('All moods'),
    [view, setView] = useState('discover');
  const [favorites, setFavorites] = useState<string[]>([]),
    [playlists, setPlaylists] = useState<Playlist[]>([]),
    [hydrated, setHydrated] = useState(false);
  const [current, setCurrent] = useState<Song | null>(null),
    [playing, setPlaying] = useState(false),
    [ready, setReady] = useState(false);
  const [queue, setQueue] = useState<string[]>([]),
    [history, setHistory] = useState<string[]>([]),
    [shuffle, setShuffle] = useState(false),
    [repeat, setRepeat] = useState(0);
  const [time, setTime] = useState(0),
    [duration, setDuration] = useState(0),
    [volume, setVolume] = useState(70),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [detail, setDetail] = useState<Song | null>(null),
    [queueOpen, setQueueOpen] = useState(false),
    [playlistOpen, setPlaylistOpen] = useState(false),
    [playlistName, setPlaylistName] = useState(''),
    [addSong, setAddSong] = useState<Song | null>(null);
  const player = useRef<Player | null>(null),
    playerHost = useRef<HTMLDivElement>(null),
    advanceRef = useRef<() => void>(() => {}),
    currentRef = useRef<Song | null>(null),
    cycle = useRef<string[]>([]);
  const readyRef = useRef(false),
    volumeRef = useRef(70);
  useEffect(() => {
    try {
      const f: unknown = JSON.parse(
        localStorage.getItem('mehfil:favorites') || '[]',
      );
      const p: unknown = JSON.parse(
        localStorage.getItem('mehfil:playlists') || '[]',
      );
      if (Array.isArray(f))
        setFavorites(
          f.filter(
            (id): id is string =>
              typeof id === 'string' && songs.some((s) => s.id === id),
          ),
        );
      if (Array.isArray(p))
        setPlaylists(
          p
            .filter(
              (x) =>
                x &&
                typeof x.id === 'string' &&
                typeof x.name === 'string' &&
                Array.isArray(x.songs),
            )
            .map((x) => ({
              id: x.id,
              name: x.name,
              songs: x.songs.filter(
                (id: unknown) =>
                  typeof id === 'string' && songs.some((s) => s.id === id),
              ),
            })),
        );
    } catch {
      setNotice(
        'Saved playlists could not be read. You can create a new playlist.',
      );
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('mehfil:favorites', JSON.stringify(favorites));
      localStorage.setItem('mehfil:playlists', JSON.stringify(playlists));
    } catch {
      setNotice(
        'Browser storage is unavailable. Changes will last for this visit only.',
      );
    }
  }, [favorites, playlists, hydrated]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(''), 4500);
      return () => clearTimeout(t);
    }
  }, [notice]);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!readyRef.current)
        setError(
          'YouTube could not connect. Check your connection and reload this page.',
        );
    }, 20000);
    function init() {
      if (cancelled || !window.YT || !playerHost.current || player.current)
        return;
      const mount = document.createElement('div');
      playerHost.current.appendChild(mount);
      player.current = new window.YT.Player(mount, {
        width: '100%',
        height: '100%',
        playerVars: {
          playsinline: 1,
          controls: 1,
          origin: window.location.origin,
          rel: 0,
        },
        events: {
          onReady: () => {
            clearTimeout(timer);
            readyRef.current = true;
            setReady(true);
            setError('');
            player.current?.setVolume(volumeRef.current);
            if (currentRef.current)
              player.current?.loadVideoById(currentRef.current.youtubeId);
          },
          onStateChange: (event: { data: number }) => {
            setPlaying(event.data === 1);
            if (event.data === 1) setError('');
            if (event.data === 0) advanceRef.current();
          },
          onAutoplayBlocked: () => {
            setPlaying(false);
            setError('Tap play in the YouTube panel to start listening.');
          },
          onError: (event: { data: number }) => {
            setPlaying(false);
            setError(
              event.data === 153
                ? 'YouTube could not verify this page. Try your regular browser or select another song.'
                : 'This video is unavailable or restricted here. Select another song or skip to the next one.',
            );
          },
        },
      });
    }
    window.onYouTubeIframeAPIReady = init;
    if (window.YT?.Player) init();
    else if (!document.querySelector('script[data-youtube-api]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.dataset.youtubeApi = 'true';
      script.onerror = () =>
        setError(
          'YouTube could not load. Check your connection and reload this page.',
        );
      document.head.appendChild(script);
    }
    const poll = setInterval(() => {
      if (readyRef.current && player.current?.getCurrentTime) {
        setTime(player.current.getCurrentTime() || 0);
        setDuration(player.current.getDuration() || 0);
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(poll);
      readyRef.current = false;
      player.current?.destroy();
      player.current = null;
    };
  }, []);
  const selectedPlaylist = playlists.find((p) => p.id === view);
  const source = selectedPlaylist
    ? selectedPlaylist.songs.map(findSong)
    : songs;
  const filtered = source.filter(
    (s) =>
      (view !== 'favorites' || favorites.includes(s.id)) &&
      (decade === 'All years' || s.decade === decade) &&
      (mood === 'All moods' || s.moods.includes(mood)) &&
      `${s.title} ${s.movie} ${s.artist}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  const heading = search
    ? `Results for “${search}”`
    : view === 'favorites'
      ? 'Your favourites'
      : selectedPlaylist
        ? selectedPlaylist.name
        : mood !== 'All moods'
          ? `${mood} essentials`
          : decade !== 'All years'
            ? `The ${decade} collection`
            : 'The songs that stayed';
  function start(s: Song, remember = true) {
    const previousId = currentRef.current?.id;
    if (remember && previousId) setHistory((h) => [...h, previousId]);
    currentRef.current = s;
    setCurrent(s);
    setTime(0);
    setDuration(0);
    setError('');
    setPlaying(false);
    if (readyRef.current) player.current?.loadVideoById(s.youtubeId);
  }
  function playCollection(list: Song[], first = 0) {
    if (!list.length) return;
    cycle.current = list.map((s) => s.id);
    setHistory([]);
    setQueue(list.slice(first + 1).map((s) => s.id));
    start(list[first], false);
  }
  function next(ended = false) {
    if (ended && repeat === 2 && current) {
      player.current?.seekTo(0, true);
      player.current?.playVideo();
      return;
    }
    let pending = queue;
    if (!pending.length && repeat === 1) pending = cycle.current;
    if (!pending.length) {
      if (ended) setPlaying(false);
      if (!ended) setNotice('End of queue. Choose another collection.');
      return;
    }
    const index = shuffle ? Math.floor(Math.random() * pending.length) : 0;
    setQueue(pending.filter((_, i) => i !== index));
    start(findSong(pending[index]));
  }
  advanceRef.current = () => next(true);
  function previous() {
    if (time > 3 || !history.length) {
      player.current?.seekTo(0, true);
      return;
    }
    const id = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    if (current) setQueue((q) => [current.id, ...q]);
    start(findSong(id), false);
  }
  function toggle() {
    if (!current) {
      playCollection(filtered.length ? filtered : songs);
      return;
    }
    if (!ready) {
      setNotice('Connecting to YouTube…');
      return;
    }
    playing ? player.current?.pauseVideo() : player.current?.playVideo();
  }
  function favorite(id: string) {
    setFavorites((f) =>
      f.includes(id) ? f.filter((x) => x !== id) : [...f, id],
    );
  }
  function browse(v: string) {
    setView(v);
    setDecade('All years');
    setMood('All moods');
    setSearch('');
  }
  function createPlaylist() {
    const name = playlistName.trim();
    if (!name) return;
    setPlaylists((ps) => [
      ...ps,
      {
        id: crypto.randomUUID(),
        name: name.slice(0, 60),
        songs: addSong ? [addSong.id] : [],
      },
    ]);
    setPlaylistName('');
    setPlaylistOpen(false);
    setAddSong(null);
    setNotice(`“${name}” saved on this browser.`);
  }
  function addToPlaylist(p: Playlist) {
    if (!addSong) return;
    setPlaylists((ps) =>
      ps.map((x) =>
        x.id === p.id
          ? { ...x, songs: [...new Set([...x.songs, addSong.id])] }
          : x,
      ),
    );
    setAddSong(null);
    setNotice(`Added to ${p.name}`);
  }
  function moveQueue(i: number, direction: number) {
    setQueue((q) => {
      const copy = [...q],
        j = i + direction;
      if (j < 0 || j >= copy.length) return q;
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }
  const featured = [
    {
      title: 'Pyaar, on repeat.',
      subtitle: 'THE ROMANCE REEL',
      mood: 'Romantic',
      song: songs[0],
      color: 'rose',
    },
    {
      title: 'Picture abhi baaki hai.',
      subtitle: 'TIMELESS CLASSICS',
      mood: 'Classics',
      song: songs[2],
      color: 'teal',
    },
    {
      title: 'Aaj ki party.',
      subtitle: 'TURN IT ALL THE WAY UP',
      mood: 'Party',
      song: songs.find((s) => s.title === 'Badtameez Dil') || songs[3],
      color: 'saffron',
    },
  ];
  return (
    <div className="site-shell">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => browse('discover')}
          aria-label="Mehfil home"
        >
          <Disc3 />
          <span>
            mehfil<span className="brand-dot">.</span>
          </span>
          <small>महफ़िल</small>
        </button>
        <label className="search">
          <Search size={19} />
          <input
            aria-label="Search songs, movies or artists"
            placeholder="A song, a film, a familiar voice…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button aria-label="Clear search" onClick={() => setSearch('')}>
              <X size={16} />
            </button>
          )}
        </label>
        <span className="era-stamp">
          BOLLYWOOD ONLY
          <br />
          <b>1990 — 2020</b>
        </span>
      </header>
      <nav className="navigation" aria-label="Main navigation">
        <button
          className={view === 'discover' ? 'active' : ''}
          onClick={() => browse('discover')}
        >
          Discover
        </button>
        <button
          className={view === 'favorites' ? 'active' : ''}
          onClick={() => browse('favorites')}
        >
          <Heart size={16} /> Favourites <span>{favorites.length}</span>
        </button>
        <button onClick={() => setPlaylistOpen(true)}>
          <Plus size={16} /> New playlist
        </button>
        {playlists.map((p) => (
          <button
            className={view === p.id ? 'active' : ''}
            key={p.id}
            onClick={() => browse(p.id)}
          >
            <ListMusic size={16} />
            {p.name}
          </button>
        ))}
      </nav>
      <main className="main-layout">
        <section className="library">
          {view === 'discover' &&
            !search &&
            mood === 'All moods' &&
            decade === 'All years' && (
              <>
                <div className="section-intro">
                  <div>
                    <p className="eyebrow">
                      THREE DECADES. A THOUSAND MEMORIES.
                    </p>
                    <h1>
                      Every song, <em>a scene.</em>
                    </h1>
                  </div>
                  <span className="curation-note">
                    Handpicked.
                    <br />
                    Always filmy.
                  </span>
                </div>
                <div className="featured-grid">
                  {featured.map((f) => (
                    <article className={`poster ${f.color}`} key={f.title}>
                      <img
                        src={thumbnail(f.song)}
                        alt={`${f.song.movie} song still`}
                      />
                      <div className="poster-shade" />
                      <div className="poster-copy">
                        <span className="eyebrow">{f.subtitle}</span>
                        <h2>{f.title}</h2>
                        <div>
                          <button
                            className="poster-browse"
                            onClick={() => setMood(f.mood)}
                          >
                            Explore collection <ArrowUpRight size={16} />
                          </button>
                          <button
                            className="round gold"
                            aria-label={`Play ${f.mood} collection`}
                            onClick={() =>
                              playCollection(
                                songs.filter((s) => s.moods.includes(f.mood)),
                              )
                            }
                          >
                            <Play size={20} fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          <div className="decades" aria-label="Browse by release period">
            {['All years', '90s', '2000s', '2010s', '2020'].map((d) => (
              <button
                key={d}
                className={decade === d ? 'selected' : ''}
                onClick={() => setDecade(d)}
                aria-pressed={decade === d}
              >
                <span>
                  {d === 'All years' || d === '2020' ? d : `The ${d}`}
                </span>
                <small>
                  {d === '90s'
                    ? 'Cassette-era magic'
                    : d === '2000s'
                      ? 'The mixtape years'
                      : d === '2010s'
                        ? 'A new nostalgia'
                        : d === '2020'
                          ? 'One last encore'
                          : 'The complete collection'}
                </small>
              </button>
            ))}
          </div>
          <div className="collection-heading">
            <div>
              <p className="eyebrow">
                {selectedPlaylist
                  ? 'YOUR OWN SOUNDTRACK'
                  : 'THE MEHFIL COLLECTION'}
              </p>
              <h2>{heading}</h2>
              <p className="subtle">
                {filtered.length} songs · Familiar voices. Unforgettable films.
              </p>
            </div>
            <button
              className="primary-button"
              disabled={!filtered.length}
              onClick={() => playCollection(filtered)}
            >
              <Play size={16} fill="currentColor" /> Play all
            </button>
          </div>
          <div className="moods" aria-label="Filter by mood">
            {moods.map((m) => (
              <button
                key={m}
                className={m === mood ? 'selected' : ''}
                onClick={() => setMood(m)}
                aria-pressed={m === mood}
              >
                {m}
              </button>
            ))}
          </div>
          {selectedPlaylist && (
            <p className="storage-note">
              Saved in this browser. Use × beside a song to remove it.
            </p>
          )}
          <div className="song-list">
            <div className="song-list-labels">
              <span>#</span>
              <span>SONG / ARTIST</span>
              <span>FILM</span>
              <span>YEAR</span>
              <span />
            </div>
            {filtered.map((s, i) => (
              <article
                key={s.id}
                className={`song-row ${s.id === current?.id ? 'is-current' : ''}`}
              >
                <button
                  className="row-play"
                  aria-label={`Play ${s.title}`}
                  onClick={() => playCollection(filtered, i)}
                >
                  {s.id === current?.id && playing ? (
                    <span className="equalizer">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    <>
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      <Play size={16} />
                    </>
                  )}
                </button>
                <button
                  className="song-info"
                  onClick={() => playCollection(filtered, i)}
                >
                  <img loading="lazy" src={thumbnail(s)} alt="" />
                  <span>
                    <b>{s.title}</b>
                    <small>{s.artist}</small>
                  </span>
                </button>
                <button
                  className="film-name"
                  onClick={() => setDetail(s)}
                  aria-label={`Details for ${s.title}`}
                >
                  {s.movie}
                </button>
                <span className="year">{s.year}</span>
                <div className="row-actions">
                  <button
                    aria-label={`${favorites.includes(s.id) ? 'Unfavourite' : 'Favourite'} ${s.title}`}
                    aria-pressed={favorites.includes(s.id)}
                    onClick={() => favorite(s.id)}
                  >
                    <Heart
                      size={17}
                      fill={favorites.includes(s.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button
                    aria-label={`Add ${s.title} to queue`}
                    onClick={() => {
                      setQueue((q) => [...q, s.id]);
                      setNotice(`Queued ${s.title}`);
                    }}
                  >
                    <ListMusic size={17} />
                  </button>
                  <button
                    aria-label={`Add ${s.title} to playlist`}
                    onClick={() => setAddSong(s)}
                  >
                    <Plus size={18} />
                  </button>
                  {selectedPlaylist && (
                    <button
                      aria-label={`Remove ${s.title} from playlist`}
                      onClick={() =>
                        setPlaylists((ps) =>
                          ps.map((p) =>
                            p.id === selectedPlaylist.id
                              ? {
                                  ...p,
                                  songs: p.songs.filter((id) => id !== s.id),
                                }
                              : p,
                          ),
                        )
                      }
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && (
            <div className="empty">
              <Music2 />
              <h3>
                {view === 'favorites'
                  ? 'Your favourites begin here.'
                  : selectedPlaylist
                    ? 'A soundtrack waiting to happen.'
                    : 'No songs found.'}
              </h3>
              <p>
                {view === 'favorites'
                  ? 'Tap a heart beside any song to keep it close.'
                  : selectedPlaylist
                    ? 'Use the + beside a song to add it to this playlist.'
                    : 'Try another title, artist, or movie, or reset your filters.'}
              </p>
              <button onClick={() => browse('discover')}>
                Browse all songs
              </button>
            </div>
          )}
          <footer>
            Made for the love of Hindi cinema.
            <span>
              Music and videos provided by YouTube. Availability varies by
              region. Favourites and playlists stay in this browser.
            </span>
          </footer>
        </section>
        <aside className="listening-room">
          <div className="room-title">
            <span className="eyebrow">NOW SHOWING · YOUTUBE</span>
            <span className={`live-dot ${playing ? 'on' : ''}`} />
          </div>
          <div
            className="youtube-host"
            ref={playerHost}
            aria-label="YouTube music player"
          />
          <div className="now-card">
            <span className="eyebrow">
              {current
                ? `${current.movie} · ${current.year}`
                : 'YOUR FRONT-ROW SEAT'}
            </span>
            <h2>{current?.title || 'Let the music begin.'}</h2>
            <p>{current?.artist || 'Choose a song and settle in.'}</p>
            {current && (
              <button
                className="text-button"
                onClick={() => setDetail(current)}
              >
                Song details <ArrowUpRight size={16} />
              </button>
            )}
          </div>
          {error && (
            <div role="alert" className="error-message">
              {error}
              <button onClick={() => next()}>
                Skip song <SkipForward size={15} />
              </button>
            </div>
          )}
          <div className="queue-preview">
            <div>
              <h3>Up next</h3>
              <button onClick={() => setQueueOpen(true)}>
                View queue <ArrowUpRight size={15} />
              </button>
            </div>
            {queue.slice(0, 3).map((id, i) => {
              const s = findSong(id);
              return (
                <button
                  key={`${id}-${i}`}
                  className="mini-song"
                  onClick={() => {
                    setQueue((q) => q.filter((_, j) => j !== i));
                    start(s);
                  }}
                >
                  <img src={thumbnail(s)} alt="" />
                  <span>
                    <b>{s.title}</b>
                    <small>{s.artist}</small>
                  </span>
                  <Play size={15} />
                </button>
              );
            })}
            {!queue.length && (
              <p className="subtle">
                Play a collection or add a song to your queue.
              </p>
            )}
          </div>
          <div className="ticket">
            <span>THE MEHFIL PROMISE</span>
            <p>
              No algorithms.
              <br />
              <em>Just good cinema.</em>
            </p>
            <small>CURATED 1990—2020</small>
          </div>
        </aside>
      </main>
      <div className="player-bar">
        <div className="player-song">
          {current ? (
            <img src={thumbnail(current)} alt="" />
          ) : (
            <div className="record-icon">
              <Disc3 />
            </div>
          )}
          <button
            disabled={!current}
            onClick={() => current && setDetail(current)}
          >
            <b>{current?.title || 'Your next favourite awaits'}</b>
            <small>{current?.artist || 'Pick a song to start listening'}</small>
          </button>
          {current && (
            <button
              className="player-heart"
              aria-label="Favourite current song"
              aria-pressed={favorites.includes(current.id)}
              onClick={() => favorite(current.id)}
            >
              <Heart
                size={18}
                fill={favorites.includes(current.id) ? 'currentColor' : 'none'}
              />
            </button>
          )}
        </div>
        <div className="transport">
          <div className="transport-buttons">
            <button
              aria-label="Shuffle"
              aria-pressed={shuffle}
              className={shuffle ? 'enabled' : ''}
              onClick={() => setShuffle(!shuffle)}
            >
              <Shuffle size={18} />
            </button>
            <button
              aria-label="Previous song"
              disabled={!current}
              onClick={previous}
            >
              <SkipBack size={21} />
            </button>
            <button
              className="round gold main-play"
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={toggle}
            >
              {playing ? (
                <Pause size={21} fill="currentColor" />
              ) : (
                <Play size={21} fill="currentColor" />
              )}
            </button>
            <button
              aria-label="Next song"
              disabled={!current}
              onClick={() => next()}
            >
              <SkipForward size={21} />
            </button>
            <button
              aria-label={`Repeat: ${['off', 'queue', 'song'][repeat]}`}
              className={repeat ? 'enabled' : ''}
              onClick={() => setRepeat((repeat + 1) % 3)}
            >
              {repeat === 2 ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>
          <div className="seek">
            <span>{clock(time)}</span>
            <Slider
              aria-label="Seek within song"
              min={0}
              max={duration || 1}
              value={[Math.min(time, duration || 1)]}
              disabled={!current || !duration}
              onValueChange={(v) => {
                const n = Array.isArray(v) ? v[0] : v;
                setTime(n);
                player.current?.seekTo(n, true);
              }}
            />
            <span>{clock(duration)}</span>
          </div>
        </div>
        <div className="player-options">
          <Volume2 size={19} />
          <Slider
            aria-label="Volume"
            min={0}
            max={100}
            value={[volume]}
            onValueChange={(v) => {
              const n = Array.isArray(v) ? v[0] : v;
              setVolume(n);
              volumeRef.current = n;
              if (readyRef.current) player.current?.setVolume(n);
            }}
          />
          <button aria-label="Open queue" onClick={() => setQueueOpen(true)}>
            <ListMusic size={21} />
          </button>
        </div>
      </div>
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="detail-sheet">
          {detail && (
            <>
              <img
                className="detail-art"
                src={thumbnail(detail)}
                alt={`${detail.movie} video thumbnail`}
              />
              <SheetTitle className="detail-title">{detail.title}</SheetTitle>
              <SheetDescription>
                {detail.movie} · {detail.year}
              </SheetDescription>
              <p>{detail.artist}</p>
              <div className="moods">
                {detail.moods.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
              <button
                className="primary-button"
                onClick={() => {
                  playCollection([detail]);
                  setDetail(null);
                }}
              >
                <Play size={18} /> Play song
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  setQueue((q) => [...q, detail.id]);
                  setNotice('Added to queue');
                }}
              >
                Add to queue
              </button>
              <small>
                Video streamed from YouTube. Year refers to the original film
                release, not the video upload.
              </small>
            </>
          )}
        </SheetContent>
      </Sheet>
      <Sheet open={queueOpen} onOpenChange={setQueueOpen}>
        <SheetContent className="detail-sheet queue-sheet">
          <SheetTitle>Tonight’s queue</SheetTitle>
          <SheetDescription>
            {queue.length} songs coming up · Reorder your soundtrack.
          </SheetDescription>
          {queue.map((id, i) => {
            const s = findSong(id);
            return (
              <div className="queue-item" key={`${id}-${i}`}>
                <button
                  onClick={() => {
                    setQueue((q) => q.filter((_, j) => i !== j));
                    start(s);
                  }}
                >
                  <b>{s.title}</b>
                  <small>{s.movie}</small>
                </button>
                <button
                  disabled={i === 0}
                  aria-label={`Move ${s.title} up`}
                  onClick={() => moveQueue(i, -1)}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  disabled={i === queue.length - 1}
                  aria-label={`Move ${s.title} down`}
                  onClick={() => moveQueue(i, 1)}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  aria-label={`Remove ${s.title} from queue`}
                  onClick={() => setQueue((q) => q.filter((_, j) => j !== i))}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
          {!queue.length && (
            <p>
              Your queue is empty. Add songs with the queue button beside each
              title.
            </p>
          )}
          {queue.length > 0 && (
            <button className="secondary-button" onClick={() => setQueue([])}>
              Clear queue
            </button>
          )}
        </SheetContent>
      </Sheet>
      <Dialog
        open={playlistOpen || !!addSong}
        onOpenChange={(open) => {
          if (!open) {
            setPlaylistOpen(false);
            setAddSong(null);
            setPlaylistName('');
          }
        }}
      >
        <DialogContent className="playlist-dialog">
          <DialogTitle>
            {addSong ? 'Save to a playlist' : 'Make it your mehfil.'}
          </DialogTitle>
          <DialogDescription>
            {addSong
              ? addSong.title
              : 'Playlists are saved on this browser. No account needed.'}
          </DialogDescription>
          {addSong &&
            playlists.map((p) => (
              <button
                className="secondary-button"
                key={p.id}
                onClick={() => addToPlaylist(p)}
              >
                <ListMusic size={18} />
                {p.name}
              </button>
            ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createPlaylist();
            }}
          >
            <label htmlFor="playlist-name">New playlist name</label>
            <input
              id="playlist-name"
              maxLength={60}
              placeholder="Late-night train rides"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
            <button
              type="submit"
              className="primary-button"
              disabled={!playlistName.trim()}
            >
              <Plus size={18} /> Create {addSong ? '& add song' : 'playlist'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
