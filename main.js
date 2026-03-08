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

//DOM Element References 
const audio = document.getElementById('pupAudio'); // finds the hidden audio element in the HTML and assigns it to the variable "audio" for control and event handling
const playBtn = document.getElementById('playPauseBtn'); // finds the play/pause button element in the HTML and assigns it to the variable "playBtn" for toggling playback and updating the icon
const speedBtn = document.getElementById('speedBtn'); // finds the speed adjustment button in the HTML and assigns it to the variable "speedBtn" for showing the speed selection dropdown
const speedDropdown = document.getElementById('speedDropdown'); // finds the speed selection dropdown element in the HTML and assigns it to the variable "speedDropdown" for showing/hiding and updating active speed options
const speedOptions = document.querySelectorAll('.speed-option'); // selects all elements with the class "speed-option" in the HTML and assigns them to the variable "speedOptions" for binding click events to change playback speed
const volumeSlider = document.getElementById('volumeSlider'); // finds the volume slider element in the HTML and assigns it to the variable "volumeSlider" for controlling audio volume and updating the displayed volume percentage
const volValue = document.getElementById('volValue'); // finds the element that displays the current volume percentage in the HTML and assigns it to the variable "volValue" for updating the text content when the volume slider is adjusted
const lyricsPanel = document.getElementById('lyricsPanel'); // finds the container element for the lyrics in the HTML and assigns it to the variable "lyricsPanel" for dynamically injecting lyric lines and updating their styles based on the current playback time
const seekSlider = document.getElementById('seekSlider'); // finds the seek bar slider element in the HTML and assigns it to the variable "seekSlider" for controlling audio playback position and visually representing progress
const currentTimeDisplay = document.getElementById('currentTime'); // finds the element that displays the current playback time in the HTML and assigns it to the variable "currentTimeDisplay" for updating the text content as the audio plays or when the user seeks
const durationTimeDisplay = document.getElementById('durationTime'); // finds the element that displays the total duration of the audio in the HTML and assigns it to the variable "durationTimeDisplay" for updating the text content once the audio metadata is loaded

//Dynamically create lyric <div> elements and inject them into the page
function showLyrics() { //declares a function named "showLyrics" that will generate the HTML for each lyric line based on the "lyrics" array and insert it into the "lyricsPanel" element in the DOM
  let html = ''; // initializes an empty string variable "html" that will be used to build the HTML content for the lyrics
  lyrics.forEach((item, i) => { // processes each item in the "lyrics" array using the forEach method, where "item" represents the current lyric object and "i" is its index in the array
    let classes = 'lyric-line'; // all lyric lines share the same base styling defined in css
    html += `<div class="${classes}" data-index="${i}" data-time="${item.time}">${item.line}</div>`;
  }); 
  lyricsPanel.innerHTML = html; // takes the complete HTML string i built and sets it as the innerHTML of the "lyricsPanel" element, effectively rendering all the lyric lines on the page with their respective data attributes for time and index
}
showLyrics();

//Select all newly created lyric lines and initialize tracking variables
const lines = document.querySelectorAll('.lyric-line'); //nodelist type variable "lines" that contains references to all the lyric line elements in the DOM, allowing for easy manipulation of their styles and attributes based on the current playback time
let activeLine = -1 // keeps track of the currently highlighted lyric line index, starting at -1 to indicate no line is active at the beginning
let isSeeking = false; // creates a flag variable (boolean type) "isSeeking" that will be used to track whether the user is currently dragging the seek slider, which helps prevent conflicts between automatic time updates and user interactions with the slider

//Time formatting 
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00'; // checks if the input "seconds" is not a number (which can happen if the audio metadata hasn't loaded yet) and returns a default time string of "0:00" to prevent displaying "NaN:NaN" or similar invalid formats
  const mins = Math.floor(seconds / 60); //ito ung nag ccalculate ng minutes
  const secs = Math.floor(seconds % 60); // ito naman nag calculate ng remaining seconds
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`; 
}

//Sync the seek bar and time labels with the current audio progress
function updateSeekBar() { // defines a function named "updateSeekBar" that will be responsible for updating the position of the seek slider, the current time display, and the total duration display based on the current playback time of the audio. This function is called during the "timeupdate" event of the audio element to keep the UI in sync with the audio progress.
  if (!isSeeking && audio.duration) { // checks if the user is not currently dragging the seek slider (isSeeking is false) and if the audio duration is available (audio.duration is truthy) before proceeding to update the UI. This prevents conflicts between automatic updates and user interactions with the slider, and also ensures that the duration is known before trying to display it.
    const current = audio.currentTime;
    const duration = audio.duration;
    seekSlider.value = current; 
    currentTimeDisplay.textContent = formatTime(current);
    durationTimeDisplay.textContent = formatTime(duration);
    const progress = (current / duration) * 100;
    //Update CSS variable for custom track coloring
    seekSlider.style.setProperty('--seek-value', `${progress}%`); //yung white na nag fifill ng progress
  }
}

//Initialize slider max value once the audio file metadata is ready
audio.addEventListener('loadedmetadata', () => {
  seekSlider.max = audio.duration; 
  durationTimeDisplay.textContent = formatTime(audio.duration);
  updateSeekBar();
});

//Primary logic: Update seek bar and highlight current lyric based on time
audio.addEventListener('timeupdate', () => { 
  updateSeekBar();
  const currentTime = audio.currentTime; 
  let current = -1;
  
  //Find the last lyric line that matches the current playback time
  if (currentTime >= 12) {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        current = i;
        break;
      }
    }
  }
  
  //Trigger animations and scrolling only when the active line changes
  if (current !== activeLine) {
    lines.forEach(l => l.classList.remove('highlight'));
    if (current >= 0) {
      lines[current].classList.add('highlight');
      lines[current].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    activeLine = current;
  }
});

//Update time display visually while the user is dragging the slider
seekSlider.addEventListener('input', (e) => {
  isSeeking = true;
  const seekTime = parseFloat(e.target.value);
  currentTimeDisplay.textContent = formatTime(seekTime);
  const progress = (seekTime / audio.duration) * 100;
  seekSlider.style.setProperty('--seek-value', `${progress}%`);
});

//Update actual audio position and resume playback when slider is released
seekSlider.addEventListener('change', (e) => { 
  const seekTime = parseFloat(e.target.value);
  audio.currentTime = seekTime;
  isSeeking = false;
  //Note: play() only triggers if the user has already initiated interaction
  if (audio.paused && audio.currentTime > 0) {
    audio.play().catch(() => {});
  }
});

//Main play/pause toggle functionality with SVG icon switching
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playBtn.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>`;
  } else {
    audio.pause();
    playBtn.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20"><polygon points="5,3 19,12 5,21 5,3" fill="currentColor"/></svg>`;
  }
});

//Ensure UI reflects the "Paused" state if triggered externally
audio.addEventListener('pause', () => {
  playBtn.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20"><polygon points="5,3 19,12 5,21 5,3" fill="currentColor"/></svg>`;
});

//Ensure UI reflects the "Playing" state if triggered externally
audio.addEventListener('play', () => {
  playBtn.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>`;
});

//Map the volume slider value (0.0 to 1.0) to the audio object
volumeSlider.addEventListener('input', (e) => {
  audio.volume = parseFloat(e.target.value);
  volValue.textContent = Math.round(audio.volume * 100);
});

//Show/Hide the custom speed selection dropdown
speedBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  speedDropdown.classList.toggle('show');
});

//Close dropdown menu when clicking anywhere else on the document
document.addEventListener('click', (e) => {
  if (!speedBtn.contains(e.target) && !speedDropdown.contains(e.target)) {
    speedDropdown.classList.remove('show');
  }
});

//Change the playback rate and update UI to show active speed
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

//Bind speed adjustment function to each dropdown option
speedOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    setSpeed(btn.dataset.speed);
  });
});

//Allow user to click a lyric line to skip the song to that timestamp
lines.forEach(line => {
  line.addEventListener('click', () => {
    audio.currentTime = parseFloat(line.dataset.time);
    if (audio.paused) {
      audio.play().catch(() => {});
    }
  });
});

//Reset the UI and position when the song reaches the end
audio.addEventListener('ended', () => {
  playBtn.innerHTML = `<svg class="play-icon" viewBox="0 0 24 24" width="20" height="20"><polygon points="5,3 19,12 5,21 5,3" fill="currentColor"/></svg>`;
  lines.forEach(l => l.classList.remove('highlight'));
  activeLine = -1;
  seekSlider.value = 0;
  currentTimeDisplay.textContent = '0:00';
  seekSlider.style.setProperty('--seek-value', '0%');
});

//Shortcut: Use spacebar to play or pause without clicking
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    playBtn.click();
  }
});

//Final check to sync UI once audio data is fully loaded
audio.addEventListener('loadeddata', () => {
  durationTimeDisplay.textContent = formatTime(audio.duration);
  seekSlider.max = audio.duration || 0;
  updateSeekBar();
});

//Initialize the player with a default 1.0x speed
setSpeed('1.0');