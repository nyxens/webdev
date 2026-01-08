const grid = document.getElementById("grid");
async function fetchTrendingSongs() {
  try {
    const response = await fetch("https://itunes.apple.com/us/rss/topsongs/limit=80/json");
    const data = await response.json();
    const songs = data.feed.entry.map((item,index) => ({
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
if(grid){
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

