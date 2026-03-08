//FEATURE 1: LYRICS DATA STORAGE
const lyrics = [
  { time: 12, line: "Sintang Paaralan", lineStart: true },
  { time: 15, line: "Tanglaw ka ng bayan" },
  { time: 18, line: "Pandayan ng isip ng kabataan" },
  { time: 24, line: "Kami ay dumating nang salat sa yaman" },
  { time: 29.5, line: "Hanap na dunong ay iyong alay" },
  { time: 35, line: "Ang layunin mong makatao" },
  { time: 41, line: "Dinarangal ang Pilipino" },
  { time: 47, line: "Ang iyong aral, diwa, adhikang taglay" },
  { time: 53, line: "PUP, aming gabay" },
  { time: 56, line: "Paaralang dakila" },
  { time: 62, line: "PUP, pinagpala" },
  { time: 68, line: "Gagamitin ang karunungan" },
  { time: 74, line: "Mula sa iyo, para sa bayan" },
  { time: 81, line: "Ang iyong aral, diwa, adhikang taglay" },
  { time: 86, line: "PUP, aming gabay" },
  { time: 89, line: "Paaralang dakila" },
  { time: 95, line: "PUP, pinagpala" }
];
//FEATURE 2: DOM ELEMENT REFERENCES
const audio = document.getElementById('pupAudio'); //si document is built-in js object na kumakatawan sa buong html page. gateway para ma access ung lahat ng elements sa page 
const playBtn = document.getElementById('playPauseBtn'); //si getElementById ung id finder
const speedBtn = document.getElementById('speedBtn');
const speedDropdown = document.getElementById('speedDropdown');
const speedOptions = document.querySelectorAll('.speed-option'); //si queryselector is class finder, hinahanap lhat ng elements na may css
const volumeSlider = document.getElementById('volumeSlider');
const volValue = document.getElementById('volValue');
const lyricsPanel = document.getElementById('lyricsPanel');
const seekSlider = document.getElementById('seekSlider');
const currentTimeDisplay = document.getElementById('currentTime');
const durationTimeDisplay = document.getElementById('durationTime');

//FEATURE 3: LYRICS DISPLAY
function showLyrics() {
  let html = '';
  lyrics.forEach((item, i) => {
    let classes = 'lyric-line';
    html += `<div class="${classes}" data-index="${i}" data-time="${item.time}">${item.line}</div>`;
  });
  lyricsPanel.innerHTML = html;
}
showLyrics();

//Get all lyric line elements after they're created
const lines = document.querySelectorAll('.lyric-line');

//FEATURE 4: STATE MANAGEMENT
let activeLine = -1;      // Tracks which lyric line is currently highlighted
let isSeeking = false;    // Tracks if user is dragging the seek bar

//FEATURE 5: UTILITY FUNCTIONS
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateSeekBar() {
  if (!isSeeking && audio.duration) {
    const current = audio.currentTime;
    const duration = audio.duration;
    seekSlider.value = current;
    currentTimeDisplay.textContent = formatTime(current);
    durationTimeDisplay.textContent = formatTime(duration);
    const progress = (current / duration) * 100;
    seekSlider.style.setProperty('--seek-value', `${progress}%`);
  }
}

//FEATURE 6: AUDIO INITIALIZATION
audio.addEventListener('loadedmetadata', () => {
  seekSlider.max = audio.duration;
  durationTimeDisplay.textContent = formatTime(audio.duration);
  updateSeekBar();
});

audio.addEventListener('loadeddata', () => {
  durationTimeDisplay.textContent = formatTime(audio.duration);
  seekSlider.max = audio.duration || 0;
  updateSeekBar();
});

//FEATURE 7: PLAYBACK & SEEK BAR SYNC
audio.addEventListener('timeupdate', () => {
  updateSeekBar();
  const currentTime = audio.currentTime;
  let current = -1;
  
  if (currentTime >= 12) {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        current = i;
        break;
      }
    }
  }
  
  if (current !== activeLine) {
    lines.forEach(l => l.classList.remove('highlight'));
    if (current >= 0) {
      lines[current].classList.add('highlight');
      lines[current].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    activeLine = current;
  }
});

//FEATURE 8: SEEK BAR CONTROLS (DRAGGING)
seekSlider.addEventListener('input', (e) => {
  isSeeking = true;
  const seekTime = parseFloat(e.target.value);
  currentTimeDisplay.textContent = formatTime(seekTime);
  const progress = (seekTime / audio.duration) * 100;
  seekSlider.style.setProperty('--seek-value', `${progress}%`);
});

seekSlider.addEventListener('change', (e) => {
  const seekTime = parseFloat(e.target.value);
  audio.currentTime = seekTime;
  isSeeking = false;
  if (audio.paused && audio.currentTime > 0) {
    audio.play().catch(() => {});
  }
});

//FEATURE 9: PLAY/PAUSE BUTTON
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playBtn.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>`;
  } else {
    audio.pause();
    playBtn.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20"><polygon points="5,3 19,12 5,21 5,3" fill="currentColor"/></svg>`;
  }
});

audio.addEventListener('pause', () => {
  playBtn.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20"><polygon points="5,3 19,12 5,21 5,3" fill="currentColor"/></svg>`;
});

audio.addEventListener('play', () => {
  playBtn.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>`;
});

//FEATURE 10: VOLUME CONTROL
volumeSlider.addEventListener('input', (e) => {
  audio.volume = parseFloat(e.target.value);
  volValue.textContent = Math.round(audio.volume * 100);
});

//FEATURE 11: PLAYBACK SPEED CONTROL
speedBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  speedDropdown.classList.toggle('show'); 
});

document.addEventListener('click', (e) => {
  if (!speedBtn.contains(e.target) && !speedDropdown.contains(e.target)) {
    speedDropdown.classList.remove('show');
  }
});

function setSpeed(speed) {
  audio.playbackRate = parseFloat(speed);
  speedBtn.textContent = parseFloat(speed).toFixed(2).replace('.00', '') + 'x';
  speedOptions.forEach(btn => {
    const btnSpeed = btn.dataset.speed;
    if (Math.abs(parseFloat(btnSpeed) - parseFloat(speed)) < 0.01) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  speedDropdown.classList.remove('show');
}

speedOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    setSpeed(btn.dataset.speed);
  });
});

setSpeed('1.0');

//FEATURE 12: CLICKABLE LYRICS
lines.forEach(line => {
  line.addEventListener('click', () => {
    audio.currentTime = parseFloat(line.dataset.time);
    if (audio.paused) {
      audio.play().catch(() => {});
    }
  });
});

//FEATURE 13: END OF SONG RESET
audio.addEventListener('ended', () => {
  playBtn.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20"><polygon points="5,3 19,12 5,21 5,3" fill="currentColor"/></svg>`;
  lines.forEach(l => l.classList.remove('highlight'));
  activeLine = -1;
  seekSlider.value = 0;
  currentTimeDisplay.textContent = '0:00';
  seekSlider.style.setProperty('--seek-value', '0%');
});

//FEATURE 14: KEYBOARD SHORTCUTS
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    playBtn.click();
  }
});