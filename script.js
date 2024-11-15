const $buttonStart = document.querySelector('#start');
const $buttonStop = document.querySelector('#stop');
const $videoPreview = document.querySelector('#video');
$videoPreview.style.display = 'none';
$videoPreview.autoplay = true;
$videoPreview.muted = true; // Mute the video player

const palettes = [
  {
    color1: 'rgba(255, 105, 180, 0.9)', // Hot pink
    color2: 'rgba(75, 0, 130, 0.9)', // Indigo
    color3: 'rgba(0, 255, 127, 0.9)' // Spring green
  },
  {
    color1: 'rgba(255, 165, 0, 0.9)', // Orange
    color2: 'rgba(34, 139, 34, 0.9)', // Forest green
    color3: 'rgba(70, 130, 180, 0.9)' // Steel blue
  },
  {
    color1: 'rgba(135, 206, 235, 0.9)', // Light blue
    color2: 'rgba(255, 182, 193, 0.9)', // Light pink
    color3: 'rgba(144, 238, 144, 0.9)' // Light green
  },
  {
    color1: 'rgba(255, 99, 71, 0.9)', // Tomato
    color2: 'rgba(60, 179, 113, 0.9)', // Medium sea green
    color3: 'rgba(123, 104, 238, 0.9)' // Medium slate blue
  },
  {
    color1: 'rgba(255, 228, 181, 0.9)', // Moccasin
    color2: 'rgba(32, 178, 170, 0.9)', // Light sea green
    color3: 'rgba(147, 112, 219, 0.9)' // Medium purple
  },
  {
    color1: 'rgba(255, 240, 245, 0.9)', // Lavender blush
    color2: 'rgba(72, 61, 139, 0.9)', // Dark slate blue
    color3: 'rgba(0, 191, 255, 0.9)' // Deep sky blue
  }
];

let currentPaletteIndex = Math.floor(Math.random() * palettes.length);

function changePalette() {
  currentPaletteIndex = (currentPaletteIndex + 1) % palettes.length;
  const palette = palettes[currentPaletteIndex];
  document.body.style.setProperty('--color-1', palette.color1);
  document.body.style.setProperty('--color-2', palette.color2);
  document.body.style.setProperty('--color-3', palette.color3);
  console.log('Palette changed', palette);
}

// Set initial random palette
changePalette();

$buttonStart.addEventListener('click', async () => {
  console.log('Start button clicked');
  const screenMedia = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 30 } }
  });
  console.log('Screen media obtained');
  const audioMedia = await navigator.mediaDevices.getUserMedia({
    audio: true
  });
  console.log('Audio media obtained');
  const camMedia = await navigator.mediaDevices.getUserMedia({
    video: true
  });
  console.log('Camera media obtained');

  // Create video elements for the screen and webcam streams
  const screenVideo = document.createElement('video');
  screenVideo.srcObject = screenMedia;
  await screenVideo.play();

  const camVideo = document.createElement('video');
  camVideo.srcObject = camMedia;
  await camVideo.play();

  // Create a canvas to combine the videos
  const canvas = document.createElement('canvas');
  canvas.width = 1280; // Set canvas width
  canvas.height = 720; // Set canvas height
  const ctx = canvas.getContext('2d');

  // Function to draw videos onto the canvas
  function drawToCanvas() {
    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

    if (camVideo.videoWidth > 0 && camVideo.videoHeight > 0) {
      const videoAspectRatio = camVideo.videoWidth / camVideo.videoHeight;
      const maxCamWidth = canvas.width * 0.2; // 20% of canvas width
      const maxCamHeight = canvas.height * 0.2; // 20% of canvas height

      let camWidth = maxCamWidth;
      let camHeight = camWidth / videoAspectRatio;

      if (camHeight > maxCamHeight) {
        camHeight = maxCamHeight;
        camWidth = camHeight * videoAspectRatio;
      }

      ctx.drawImage(
        camVideo,
        canvas.width - camWidth - 10,
        canvas.height - camHeight - 10,
        camWidth,
        camHeight
      );
    }

    requestAnimationFrame(drawToCanvas);
  }

  drawToCanvas();

  // Capture the canvas stream
  const canvasStream = canvas.captureStream(30); // 30 FPS

  // Combine audio tracks with canvas stream
  const finalStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioMedia.getAudioTracks()
  ]);

  $videoPreview.srcObject = finalStream;
  $videoPreview.style.display = 'block';
  setTimeout(() => {
    $videoPreview.style.height = '88vh';
  }, 10); // Allow time for display change to take effect
  console.log('Combined stream set to video preview');

  const mediarecorder = new MediaRecorder(finalStream, {
    mimeType: 'video/webm;codecs=vp8,opus'
  });
  console.log('MediaRecorder created');

  function startRecording() {
    mediarecorder.start();
    document.title = 'Recording...';
    $buttonStart.style.display = 'none';
    $buttonStop.style.display = 'initial';
    console.log('Recording started');
  }

  function stopRecording() {
    mediarecorder.stop();
    document.title = 'Stopped';
    $buttonStart.style.display = 'initial';
    $buttonStop.style.display = 'none';
    $videoPreview.style.height = '0';
    setTimeout(() => {
      $videoPreview.style.display = 'none';
      document.body.removeChild($camPreview); // Remove the webcam preview
    }, 500); // Match the transition duration
    console.log('Recording stopped');

    // Stop all media tracks
    finalStream.getTracks().forEach(track => track.stop());
    screenMedia.getTracks().forEach(track => track.stop());
    camMedia.getTracks().forEach(track => track.stop());
    console.log('All media tracks stopped');

    // Change the palette after recording
    changePalette();
  }

  const [video] = screenMedia.getVideoTracks();
  video.addEventListener("ended", () => {
    stopRecording();
    console.log('Video track ended');
  });

  mediarecorder.addEventListener("dataavailable", (e) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(e.data);
    const now = new Date().toISOString().replace('T', '_').replace(/\/|:|\s/g, "").split(".")[0];
    link.download = `screen-record-${now}.webm`;
    link.click();
    console.log('Data available, file downloaded');
  });

  mediarecorder.addEventListener("stop", () => {
    mediarecorder.requestData();
    console.log('MediaRecorder stopped');
  });

  $buttonStop.addEventListener('click', () => {
    stopRecording();
    console.log('Stop button clicked');
  });

  startRecording();
});
