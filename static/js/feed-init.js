if (Hls.isSupported()) {
  const video = document.getElementById("video");
  const hls = new Hls();
  hls.loadSource("https://example.com/stream.m3u8");
  hls.attachMedia(video);
}