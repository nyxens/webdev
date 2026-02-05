let mediaRecorder;
let audioChunks = [];
let isRecording = false;
const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("recStatus");
micBtn.addEventListener("click", toggleRecording);
async function toggleRecording() {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
}
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstart = () => {
      isRecording = true;
      micBtn.src = "images/recording.svg";
      statusText.textContent = "Listening…";
      micBtn.classList.add("recording");
    };
    mediaRecorder.start();
    setTimeout(() => {
      if (mediaRecorder.state === "recording") 
        stopRecording();
    }, 7000);
  } catch (err) {
    console.error(err);
    statusText.textContent = "Microphone access denied";
  }
}
function stopRecording() {
  if (!mediaRecorder) 
    return;
  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    isRecording = false;
    micBtn.src = "images/mic-outline.svg";
    statusText.textContent = "Audio captured";
    micBtn.classList.remove("recording");
    console.log("Audio blob:", audioBlob);
    playBack(audioBlob);
  };
  mediaRecorder.stop();
}
function playBack(blob) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.volume = 1;
  audio.play();
}