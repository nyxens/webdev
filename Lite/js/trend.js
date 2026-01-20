const resultsWrap = document.getElementById("searchresults");
const navSearchInput = document.getElementById("navsearchinput");
const navSearchBtn = document.getElementById("navsearchbtn");
const grid = document.getElementById("grid");
async function fetchTrendingSongs() {
  try {
    const response = await fetch("https://itunes.apple.com/us/rss/topsongs/limit=80/json");
    const data = await response.json();
    const songs = data.feed.entry.map((item, index) => ({
      title: item["im:name"].label,
      artist: item["im:artist"].label,
      rank: index + 1,
      image: item["im:image"][2].label
    }));
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
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img class="songimage" src="${song.image}">
          <div class="songrank">
            <a class="song">${song.title}</a>
            <a class="rank">${song.rank}</a>
          </div>
        </div>
        <div class="card-back">
          <h3>${song.title}</h3>
          <p><strong>Artist:</strong> ${song.artist}</p>
          <p><strong>Rank:</strong>  ${song.rank}</p>
          <p><strong>Chart:</strong> iTunes Top 100</p>
          <p class="hint">Tap to flip back</p>
        </div>
      </div>
    `;
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
    grid.appendChild(card);
  });
}
wireNavSearch();
function wireNavSearch() {
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
    // a.addEventListener("loadedmetadata", () => (a.volume = v), { once: true });
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
    const release = track.releaseDate ? formatDate(track.releaseDate) : "N/A";
    const genre = track.primaryGenreName || "N/A";
    const album = track.collectionName || "N/A";
    const card = document.createElement("div");
    card.className = "search-card";
    card.innerHTML = `
      <img src="${artwork}" alt="">
      <div class="search-meta">
        <div class="search-title" title="${escapeHtml(track.trackName)}">${escapeHtml(track.trackName)}</div>
        <div class="search-artist" title="${escapeHtml(track.artistName)}">${escapeHtml(track.artistName)}</div>
        <div class="search-extra">
          <span><strong>Album:</strong> ${escapeHtml(album)}</span>
          <span><strong>Genre:</strong> ${escapeHtml(genre)}</span>
          <span><strong>Release:</strong> ${escapeHtml(release)}</span>
        </div>
      </div>
      <div class="search-actions">
        ${track.previewUrl ? `<audio class="preview-audio" controls preload="none" src="${track.previewUrl}"></audio>` : ""}
        ${track.trackViewUrl ? `<a class="open-itune" href="${track.trackViewUrl}" target="_blank" rel="noopener noreferrer">Open iTunes</a>` : ""}
      </div>
    `;
    searchGrid.appendChild(card);
    wireSingleAudioPlayback(searchGrid);
    setDefaultPreviewVolume(searchGrid, 0.5);
  });
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


