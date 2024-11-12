const $buttonStart = document.querySelector('#start');
const $buttonStop = document.querySelector('#stop');
const $videoPreview = document.querySelector('#video');
$videoPreview.style.display = 'none';
$videoPreview.autoplay = true;

$buttonStart.addEventListener('click', async () => {
  const screenMedia = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 30 } }
  });
  const audioMedia = await navigator.mediaDevices.getUserMedia({
    audio: true
  });

  const combinedStream = new MediaStream([
    ...screenMedia.getVideoTracks(),
    ...audioMedia.getAudioTracks()
  ]);

  $videoPreview.srcObject = combinedStream;
  $videoPreview.style.display = 'block';

  const mediarecorder = new MediaRecorder(combinedStream, {
    mimeType: 'video/webm;codecs=vp8,opus'
  });

  function startRecording() {
    mediarecorder.start();
    document.title = 'Recording...';
    $buttonStart.style.display = 'none';
    $buttonStop.style.display = 'initial';
  }

  function stopRecording() {
    mediarecorder.stop();
    document.title = 'Stopped';
    $buttonStart.style.display = 'initial';
    $buttonStop.style.display = 'none';
    $videoPreview.style.display = 'none';
  }

  const [video] = screenMedia.getVideoTracks();
  video.addEventListener("ended", () => {
    stopRecording();
  });

  mediarecorder.addEventListener("dataavailable", (e) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(e.data);
    const now = new Date().toISOString().replace('T', '_').replace(/\/|:|\s/g, "").split(".")[0];
    link.download = `screen-record-${now}.webm`;
    link.click();
  });

  $buttonStop.addEventListener('click', () => {
    stopRecording();
  });

  startRecording();
});
