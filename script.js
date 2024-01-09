const $buttonStart = document.querySelector('#start');
const $buttonStop = document.querySelector('#stop');

$buttonStart.addEventListener('click', async () => {
  const media = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 30 } }
  })
  const mediarecorder = new MediaRecorder(media, {
    mimeType: 'video/webm;codecs=vp8,opus'
  })
  mediarecorder.start()

  const [video] = media.getVideoTracks()
  video.addEventListener("ended", () => {
    mediarecorder.stop()
  })

  mediarecorder.addEventListener("dataavailable", (e) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(e.data);
    const now = new Date().toISOString().replace('T', '_').replace(/\/|:|\s/g, "").split(".")[0];
    link.download = `screen-record-${now}.webm`
    link.click()
  })

  $buttonStop.addEventListener('click', () => {
    mediarecorder.stop();
    $buttonStart.style.display = 'initial';
    $buttonStop.style.display = 'none';
  });
  $buttonStart.style.display = 'none';
  $buttonStop.style.display = 'initial';

})
