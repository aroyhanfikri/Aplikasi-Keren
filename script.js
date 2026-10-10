const scare = document.getElementById("scare");
const video = document.getElementById("scareVideo");
const mainBox = document.getElementById("mainBox");
const skipBtn = document.getElementById("skipBtn");
const claimBtn = document.getElementById("claimBtn");
const manpusOverlay = document.getElementById("manpusOverlay");

let errorShown = false;
let isPlaying = false;
let manpusTimeout = null;

function safeReset() {
  try {
    if (video.readyState >= 1) {
      video.currentTime = 0;
    }
  } catch (e) {
    console.warn("Reset currentTime gagal:", e.message);
  }
}

function clearManpusTimeout() {
  if (manpusTimeout) {
    clearTimeout(manpusTimeout);
    manpusTimeout = null;
  }
}

function showVideoError() {
  if (errorShown) return;
  errorShown = true;

  alert(
    "⚠️ Video tidak bisa diputar!\n\n" +
      "Cek:\n" +
      '1. File bernama "video.mp4"\n' +
      "2. Berada di folder yang sama\n" +
      "3. Format MP4 (H.264 + AAC)\n" +
      "4. Codec audio: AAC, bukan Opus/AC3",
  );

  stopScare();

  setTimeout(() => {
    errorShown = false;
  }, 1500);
}

function playWithSound() {
  safeReset();

  video.muted = false;
  video.volume = 1.0;

  const p1 = video.play();

  if (p1 === undefined) return;

  p1.catch((err) => {
    console.warn("Play dengan suara gagal, coba trik muted:", err.message);

    video.muted = true;

    const p2 = video.play();

    if (p2 === undefined) return;

    p2.then(() => {
      video.muted = false;
      video.volume = 1.0;

      setTimeout(() => {
        if (video.muted) {
          video.muted = false;
          video.volume = 1.0;
        }
      }, 100);

      console.log("✅ Trik muted→unmute berhasil");
    }).catch((err2) => {
      console.error("❌ Video gagal play:", err2.message);
      showVideoError();
    });
  });
}

function startScare() {
  if (isPlaying) return;
  isPlaying = true;

  clearManpusTimeout();
  manpusOverlay.classList.remove("show");
  scare.classList.remove("manpus-mode");

  mainBox.style.display = "none";
  scare.classList.add("active");
  skipBtn.classList.add("show");

  playWithSound();

  if (navigator.vibrate) {
    navigator.vibrate([300, 100, 300, 100, 600, 100, 300]);
  }
}

function stopScare() {
  isPlaying = false;

  clearManpusTimeout();

  scare.classList.remove("active");
  scare.classList.remove("manpus-mode");
  skipBtn.classList.remove("show");
  manpusOverlay.classList.remove("show");

  try {
    video.pause();
    video.currentTime = 0;
  } catch (e) {
    console.warn("Stop video gagal:", e.message);
  }

  mainBox.style.display = "block";
}

function showManpus() {
  scare.classList.add("manpus-mode");
  manpusOverlay.classList.add("show");

  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100, 50, 200]);
  }
}

function handleVideoEnded() {
  showManpus();

  clearManpusTimeout();
  manpusTimeout = setTimeout(() => {
    manpusTimeout = null;
    stopScare();
  }, 2500);
}

claimBtn.addEventListener("click", startScare);
skipBtn.addEventListener("click", stopScare);

video.addEventListener("ended", handleVideoEnded);
video.addEventListener("error", showVideoError);

manpusOverlay.addEventListener("click", () => {
  clearManpusTimeout();
  stopScare();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && scare.classList.contains("active")) {
    stopScare();
  }
});

document.addEventListener("gesturestart", (e) => e.preventDefault());
document.addEventListener("dblclick", (e) => e.preventDefault(), {
  passive: false,
});

window.addEventListener("load", () => {
  video.load();
});

window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    video.style.display = "none";
    void video.offsetHeight;
    video.style.display = "";
  }, 150);
});
