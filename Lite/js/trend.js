const resultsWrap = document.getElementById("searchresults");
const navSearchInput = document.getElementById("navsearchinput");
const navSearchBtn = document.getElementById("navsearchbtn");
const grid = document.getElementById("grid");
const LIKES = "humit_likes";
const PLAYLISTS = "humit_playlists";
const CACHE = "humit_songCache";
function readLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function writeLS(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function ensureDefaultPlaylist() {
  const pls = readLS(PLAYLISTS, []);
  if (pls.length === 0) {
    pls.push({ id: "pl_favorites", name: "Favorites", songIds: [] });
    writeLS(PLAYLISTS, pls);
  }
}
function saveSongToCache(song) {
  const cache = readLS(CACHE, {});
  cache[song.id] = song;
  writeLS(CACHE,cache);
}
function isLiked(songId) {
  const likes = readLS(LIKES, []);
  return likes.includes(songId);
}
function toggleLike(songId) {
  const likes = readLS(LIKES, []);
  const i = likes.indexOf(songId);
  if (i >= 0) likes.splice(i, 1);
  else likes.unshift(songId);
  writeLS(LIKES, likes);
  return i < 0;
}
function getPlaylists() {
  return readLS(PLAYLISTS, []);
}
function addSongToPlaylist(playlistId, songId) {
  const pls = readLS(PLAYLISTS, []);
  const pl = pls.find(p => p.id === playlistId);
  if (!pl) return;
  if (!pl.songIds.includes(songId)) pl.songIds.unshift(songId);
  writeLS(PLAYLISTS, pls);
}
ensureDefaultPlaylist();
async function fetchTrendingSongs() {
  try {
    const response = await fetch("https://itunes.apple.com/in/rss/topsongs/limit=90/json");
    const data = await response.json();
    const songs = data.feed.entry.map((item, index) => ({
      id: extractRssSongId(item),
      title: item["im:name"].label,
      artist: item["im:artist"].label,
      rank: index + 1,
      image: item["im:image"][2].label,
    }));
    songs.forEach(saveSongToCache);
    starttop(songs);
  } catch (error) {
    console.error("Failed to fetch songs", error);
  }
}
if (grid) {
  fetchTrendingSongs();
}
function starttop(songs) {
  grid.innerHTML = "";
  songs.forEach(song => {
    const card = document.createElement("div");
    card.className = "songcard";
    const likedNow = isLiked(song.id);
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img class="songimage" src="${song.image}">
          <div class="buttons">
            <button class="likebtn ${likedNow ? "liked" : ""}" data-id="${song.id}" type="button">♥</button>
            <button class="playbtn" data-id="${song.id}" type="button" title="Play preview">▶</button>
            <div class="plwrap">
              <button class="plbtn" data-id="${song.id}" type="button">+</button>
              <div class="plmenu"></div>
            </div>
          </div>
          <div class="songrank">
            <a class="song">${escapeHtml(song.title)}</a>
            <a class="rank">${song.rank}</a>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  wireLikeButtons(grid);
  wirePlaylistButtons(grid);
  wirePlayButtons(grid); 
}
NavSearch();
function NavSearch() {
  if (!navSearchInput || !navSearchBtn)
    return;
  navSearchBtn.addEventListener("click", runSearch);
  navSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
}
let currentAudio = null;
function wireSingleAudioPlayback(scopeEl) {
  scopeEl.querySelectorAll("audio").forEach(a => {
    a.addEventListener("play", () => {
      if (currentAudio && currentAudio !== a) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      currentAudio = a;
    });
  });
}
async function runSearch() {
  const q = navSearchInput.value.trim();
  if (!q) return;
  showSearchLoading(q);
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=5`;
    const res = await fetch(url);
    if (!res.ok)
      throw new Error("Search request failed");
    const data = await res.json();
    const tracks = data.results || [];
    showSearchCards(tracks, q);
  } catch (err) {
    console.error(err);
    showSearchError();
  }
}
function showSearchLoading(q) {
  if (!resultsWrap) return;
  resultsWrap.innerHTML = `
    <div class="search-card">
      <div class="search-meta">
        <div class="search-title">Searching for "${escapeHtml(q)}"…</div>
        <div class="search-artist">Please wait</div>
        <div class="search-extra">iTunes Search API</div>
      </div>
    </div>
  `;
}
function showSearchEmpty(q) {
  if (!resultsWrap) return;
  resultsWrap.innerHTML = `
    <div class="search-card">
      <div class="search-meta">
        <div class="search-title">No results for "${escapeHtml(q)}"</div>
        <div class="search-artist">Try a different song or artist name.</div>
      </div>
    </div>
  `;
}
function showSearchError() {
  if (!resultsWrap) return;
  resultsWrap.innerHTML = `
    <div class="search-card">
      <div class="search-meta">
        <div class="search-title">Search failed</div>
        <div class="search-artist">Check your connection and try again.</div>
      </div>
    </div>
  `;
}
function setDefaultPreviewVolume(scopeEl, v = 0.5) {
  scopeEl.querySelectorAll("audio").forEach(a => {
    a.volume = v;
    a.addEventListener("play", () => { a.volume = 0.5; });
  });
}
function showSearchCards(tracks, q) {
  if (!resultsWrap) return;
  if (!tracks || tracks.length === 0) {
    showSearchEmpty(q);
    return;
  }
  resultsWrap.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:0 10px 10px 10px;">
      <div style="color:#b5b5b5;">Top results for "<span style="color:#fff;">${escapeHtml(q)}</span>"</div>
      <a href="#" id="clearResult" style="color:#e10600; text-decoration:none;">Clear</a>
    </div>
    <div id="searchGrid" style="display:flex; flex-direction:column; gap:14px;"></div>
  `;
  document.getElementById("clearResult")?.addEventListener("click", (e) => {
    e.preventDefault();
    resultsWrap.innerHTML = "";
    navSearchInput.value = "";
    navSearchInput.focus();
  });
  const searchGrid = document.getElementById("searchGrid");
  tracks.forEach(track => {
  const artwork = track.artworkUrl100 || track.artworkUrl60 || "";
  const songId = `itunes-${track.trackId}`;
  saveSongToCache({
    id: songId,
    title: track.trackName,
    artist: track.artistName,
    image: artwork,
    previewUrl: track.previewUrl || null
  });
  const release = track.releaseDate ? formatDate(track.releaseDate) : "N/A";
  const genre = track.primaryGenreName || "N/A";
  const album = track.collectionName || "N/A";
  const card = document.createElement("div");
  card.className = "search-card";
  const likedNow = isLiked(songId);
  card.innerHTML = `
    <img src="${artwork}" alt="">
    <div class="search-meta">
      <div class="search-title">${escapeHtml(track.trackName)}</div>
      <div class="search-artist">${escapeHtml(track.artistName)}</div>
      <div class="search-extra">
        <span><strong>Album:</strong> ${escapeHtml(album)}</span>
        <span><strong>Genre:</strong> ${escapeHtml(genre)}</span>
        <span><strong>Release:</strong> ${escapeHtml(release)}</span>
      </div>
    
      </div>
      <div class="search-actions">
        ${track.previewUrl ? `<audio class="preview-audio" controls preload="none" src="${track.previewUrl}"></audio>` : ""}
        <div class="buttons" style="margin-top:10px;">
          <button class="likebtn ${likedNow ? "liked" : ""}" data-id="${songId}" type="button">♥</button>
          <div class="plwrap">
            <button class="plbtn" data-id="${songId}" type="button">+</button>
            <div class="plmenu"></div>
          </div>
          ${track.trackViewUrl ? `<a class="open-itune" href="${track.trackViewUrl}" target="_blank">Open iTunes</a>` : ""}
        </div>
      </div>
  `;
  searchGrid.appendChild(card);
  });
  wireLikeButtons(resultsWrap);
  wirePlaylistButtons(resultsWrap);
  wireSingleAudioPlayback(resultsWrap);
  setDefaultPreviewVolume(resultsWrap, 0.5);
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function formatDate(iso) {
  const d = new Date(iso);
  return isNaN(d) ? "N/A" : d.toLocaleDateString();
}
function extractRssSongId(item) {
  const idUrl = item?.id?.label || "";
  const m = String(idUrl).match(/i=(\d+)/);
  if (m) return `itunes-${m[1]}`;
  return `rss-${escapeKey(item["im:name"]?.label)}-${escapeKey(item["im:artist"]?.label)}`;
}
function escapeKey(s){
  return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}
function wireLikeButtons(scopeEl) {
  scopeEl.querySelectorAll(".likebtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const songId = btn.dataset.id;
      const liked = toggleLike(songId);
      btn.classList.toggle("liked", liked);
    });
  });
}
function wirePlaylistButtons(scopeEl) {
  scopeEl.querySelectorAll(".plbtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const songId = btn.dataset.id;
      const wrap = btn.closest(".plwrap");
      const menu = wrap.querySelector(".plmenu");
      scopeEl.querySelectorAll(".plmenu.open")
        .forEach(m => m.classList.remove("open"));
      fillPlaylistMenu(menu, songId);
      menu.classList.toggle("open");
    });
  });
}
document.addEventListener("click", () => {
  document.querySelectorAll(".plmenu.open")
    .forEach(m => m.classList.remove("open"));
});
function fillPlaylistMenu(menuEl, songId) {
  const pls = getPlaylists();
  menuEl.innerHTML = "";
  pls.forEach(pl => {
    const item = document.createElement("div");
    item.className = "plitem";
    item.textContent = pl.name;
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      addSongToPlaylist(pl.id, songId);
      menuEl.classList.remove("open");
    });
    menuEl.appendChild(item);
  });
}
function printLikedSongsTable() {
  const likes = readLS(LIKES, []);
  const cache = readLS(CACHE, {});
  console.table(likes.map(id => ({
    id,
    title: cache[id]?.title || null,
    artist: cache[id]?.artist || null
  })));
}
function printPlaylistsTable() {
  const playlists = readLS(PLAYLISTS, []);
  console.table(playlists.map(pl => ({
    id: pl.id,
    name: pl.name,
    songs: pl.songIds.length
  })));
}
let currentPreview = null;
function wirePlayButtons(scopeEl) {
  scopeEl.querySelectorAll(".playbtn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const songId = btn.dataset.id;
      const card = btn.closest(".songcard");
      let audio = card.querySelector("audio.preview-audio");
      if (!audio) {
        const details = await fetchItunesLookup(songId);
        if (!details || !details.previewUrl) {
          btn.textContent = "×";
          btn.title = "No preview available";
          return;
        }
        const cached = readLS(CACHE, {});
        if (cached[songId]) {
          cached[songId].previewUrl = details.previewUrl;
          cached[songId].image = cached[songId].image || details.artworkUrl100 || details.artworkUrl60 || "";
          writeLS(CACHE, cached);
        }
        audio = document.createElement("audio");
        audio.className = "preview-audio";
        audio.preload = "none";
        audio.src = details.previewUrl;
        audio.volume = 0.5;
        card.appendChild(audio);
      }
      if (currentPreview && currentPreview !== audio) {
        currentPreview.pause();
        currentPreview.currentTime = 0;
      }
      currentPreview = audio;
      if (audio.paused) {
        try { await audio.play(); } catch {}
        btn.textContent = "⏸";
      } else {
        audio.pause();
        btn.textContent = "▶";
      }
      audio.onended = () => { btn.textContent = "▶"; };
      audio.onpause = () => { if (!audio.ended) btn.textContent = "▶"; };
    });
  });
}
async function fetchItunesLookup(songId) {
  const id = String(songId).replace("itunes-", "");
  if (!/^\d+$/.test(id)) return null;
  const res = await fetch(`https://itunes.apple.com/lookup?id=${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] || null;
}
