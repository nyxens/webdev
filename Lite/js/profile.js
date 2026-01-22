const PLAYLISTS = "humit_playlists";
const LIKES = "humit_likes";
const CACHE = "humit_songCache";
const playlistWrap = document.getElementById("playlistCards");
const likedWrap = document.getElementById("likedCards");
function readLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function getCache() {
  return readLS(CACHE, {});
}
function getPlaylists() {
  return readLS(PLAYLISTS, []);
}
function getLikes() {
  return readLS(LIKES, []);
}
function getLikedSongs() {
  const cache = getCache();
  return getLikes().map(id => cache[id]).filter(Boolean);
}
function getPlaylistSongs(playlistId) {
  const cache = getCache();
  const pls = getPlaylists();
  const pl = pls.find(p => p.id === playlistId);
  if (!pl) return [];
  return pl.songIds.map(id => cache[id]).filter(Boolean);
}
renderLibrary();
function renderLibrary() {
  renderPlaylists();
  renderLikedSongs();
}
function renderPlaylists() {
  if (!playlistWrap) return;
  const pls = getPlaylists();
  playlistWrap.innerHTML = "";
  if (pls.length === 0) {
    playlistWrap.innerHTML = `<p style="color:#b5b5b5; padding:10px;">No playlists yet.</p>`;
    return;
  }
  pls.forEach(pl => {
    const songs = getPlaylistSongs(pl.id);
    const card = document.createElement("div");
    card.className = "playlist-card";
    card.innerHTML = `
      <div class="playlist-top">
        <div class="playlist-name" title="${escapeHtml(pl.name)}">${escapeHtml(pl.name)}</div>
        <div class="playlist-count">${songs.length}</div>
      </div>
      <div class="playlist-preview">
        ${songs.slice(0, 3).map(s => escapeHtml(s.title)).join(" • ") || "No songs in this playlist"}
      </div>
      <div class="playlist-songs"></div>
    `;
    card.addEventListener("click", () => {
      const box = card.querySelector(".playlist-songs");
      const isOpen = box.style.display === "block";
      document.querySelectorAll(".playlist-songs").forEach(b => {
        if (b !== box) b.style.display = "none";
      });
      if (isOpen) {
        box.style.display = "none";
        box.innerHTML = "";
        return;
      }
      box.style.display = "block";
      box.innerHTML = "";
      if (songs.length === 0) {
        box.innerHTML = `<div style="color:#b5b5b5; font-size:13px;">Empty playlist</div>`;
        return;
      }
      songs.forEach(s => {
        const row = document.createElement("div");
        row.className = "playlist-song-row";
        row.innerHTML = `
          <img src="${s.image || ""}" alt="">
          <div class="playlist-song-meta">
            <div class="playlist-song-title" title="${escapeHtml(s.title)}">${escapeHtml(s.title)}</div>
            <div class="playlist-song-artist" title="${escapeHtml(s.artist || "")}">${escapeHtml(s.artist || "")}</div>
          </div>
        `;
        box.appendChild(row);
      });
    });
    playlistWrap.appendChild(card);
  });
}
function renderLikedSongs() {
  if (!likedWrap) return;
  const songs = getLikedSongs();
  likedWrap.innerHTML = "";
  if (songs.length === 0) {
    likedWrap.innerHTML = `<p style="color:#b5b5b5; padding:10px;">No liked songs yet.</p>`;
    return;
  }
  songs.forEach(s => {
    const card = document.createElement("div");
    card.className = "songcard";
    card.innerHTML = `
      <img class="songimage" src="${s.image || ""}" alt="">
      <div class="songrank">
        <a class="song" title="${escapeHtml(s.title)}">${escapeHtml(s.title)}</a>
        <span class="artist" title="${escapeHtml(s.artist || "")}">${escapeHtml(s.artist || "")}</span>
      </div>
      ${s.previewUrl ? `<audio class="preview-audio" controls preload="none" src="${s.previewUrl}"></audio>` : ""}
    `;
    const a = card.querySelector("audio");
    if (a) a.volume = 0.5;
    likedWrap.appendChild(card);
  });
}