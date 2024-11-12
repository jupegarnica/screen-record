const $buttonStart = document.querySelector('#start');
const $buttonStop = document.querySelector('#stop');
const $videoPreview = document.querySelector('#video');
$videoPreview.style.display = 'none';
$videoPreview.autoplay = true;
$videoPreview.muted = true; // Mute the video player

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

  const combinedStream = new MediaStream([
    ...screenMedia.getVideoTracks(),
    ...audioMedia.getAudioTracks()
  ]);

  $videoPreview.srcObject = combinedStream;
  $videoPreview.style.display = 'block';
  console.log('Combined stream set to video preview');

  const mediarecorder = new MediaRecorder(combinedStream, {
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
    $videoPreview.style.display = 'none';
    console.log('Recording stopped');
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
