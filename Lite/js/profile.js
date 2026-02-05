const PLAYLISTS = "playlists";
const LIKES = "likes";
const CACHE = "songCache";
// to clear local storage do this 
//TODO make a reset library button
// localStorage.removeItem("playlists");
// localStorage.removeItem("likes");
// localStorage.removeItem("songCache");
// localStorage.clear();
//local storage 
const playlistWrap = document.getElementById("playlistCards");
const likedWrap = document.getElementById("likedCards");
//make the json to struct(object)
function readLS(key,fallback){
  try{ 
    return JSON.parse(localStorage.getItem(key)) ?? fallback; 
  }
  catch{ 
    return fallback; 
  }
}
//getters
function getLikes(){
  return readLS(LIKES,[]);
}
function getLikedSongs(){
  const cache = getCache();
  return getLikes().map(id => cache[id]).filter(Boolean);
  //filter is fancy filter to remove falsy values 
}
function getCache(){
  return readLS(CACHE,{});
}
function getPlaylists(){
  return readLS(PLAYLISTS,[]);
}
function getPlaylistSongs(playlistId){
  const cache = getCache();
  const pls = getPlaylists();
  const pl = pls.find(p => p.id === playlistId);
  if(!pl) 
    return [];
  return pl.songIds.map(id => cache[id]).filter(Boolean);
  //remove falsy values
}
function renderPlaylists(){
  if(!playlistWrap) 
    return;
  const pls = getPlaylists();
  playlistWrap.innerHTML = "";
  if(pls.length === 0){
    playlistWrap.innerHTML = `<p>No playlists yet.</p>`;
    return;
  }
  pls.forEach(pl =>{
    const songs = getPlaylistSongs(pl.id);
    const card = document.createElement("div");
    card.className = "playlist-card";
    card.innerHTML = `
      <div class="playlist-top">
        <div class="playlist-name" title="${pl.name}">${pl.name}</div>
        <div class="playlist-count">${songs.length}</div>
      </div>
      <div class="playlist-preview">
        ${songs.slice(0, 3).map(s => s.title).join(" • ") || "No songs in this playlist"}
      </div>
      <div class="playlist-songs"></div>
    `;
    card.addEventListener("click",() =>{
      const box = card.querySelector(".playlist-songs");
      const isOpen = box.style.display === "block";
      document.querySelectorAll(".playlist-songs").forEach(b =>{
        if(b !== box) 
          b.style.display = "none";
      });
      if(isOpen){
        box.style.display = "none";
        box.innerHTML = "";
        return;
      }
      box.style.display = "block";
      box.innerHTML = "";
      if(songs.length === 0){
        box.innerHTML = `<div>Empty playlist</div>`;
        return;
      }
      songs.forEach(s =>{
        const row = document.createElement("div");
        row.className = "playlist-song-row";
        row.innerHTML = `
          <img src="${s.image || ""}" alt="idk">
          <div class="playlist-song-meta">
            <div class="playlist-song-title" title="${s.title}">${s.title}</div>
            <div class="playlist-song-artist" title="${s.artist || ""}">${s.artist || ""}</div>
          </div>
        `;
        box.appendChild(row);
      });
    });
    playlistWrap.appendChild(card);
  });
}
function renderLikedSongs(){
  if(!likedWrap) 
    return;
  const songs = getLikedSongs();
  likedWrap.innerHTML = "";
  if(songs.length === 0){
    likedWrap.innerHTML = `<p>No liked songs yet.</p>`;
    return;
  }
  songs.forEach(s =>{
    const card = document.createElement("div");
    card.className = "songcard";
    card.innerHTML = `
      <img class="songimage" src="${s.image || ""}" alt="">
      <div class="songrank">
        <a class="song" title="${s.title}">${s.title}</a>
        <span class="artist" title="${s.artist || ""}">${s.artist || ""}</span>
      </div>
    `;
    likedWrap.appendChild(card);
  });
}
function renderLibrary(){
  renderPlaylists();
  renderLikedSongs();
}
renderLibrary();