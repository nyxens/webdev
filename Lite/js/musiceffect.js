const container = document.getElementById("musiceffect");
const notes = ["♪", "♫", "♩", "♬"];
function createMusicNote() {
  if (!container) 
    return;
  const note = document.createElement("div");
  note.className = "musicnote";
  note.textContent = notes[Math.floor(Math.random() * notes.length)];
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;

  note.style.left = `${x}px`;
  note.style.top = `${y}px`;
  note.style.fontSize = `${18 + Math.random() * 14}px`;
  container.appendChild(note);
  setTimeout(() => {
    note.remove();
  }, 2500);
}
setInterval(createMusicNote,100);