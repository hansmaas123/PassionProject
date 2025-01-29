const $expressionText = document.querySelector('.expression-text');
const $video = document.querySelector('.video');

let canvas = null;
lastExpression = null;

const videoPlayer = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  $video.srcObject = stream;
  $video.play();
};

const updateExpressionText = (expression) => {
  $expressionText.innerText = expression;
};

const trackExpressions = async () => {
  if (!canvas) {
    canvas = faceapi.createCanvasFromMedia($video);
    document.body.append(canvas);
  }
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  const displaySize = { width: $video.videoWidth, height: $video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);

  const detections = await faceapi.detectAllFaces($video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions();

  const resizedDetections = faceapi.resizeResults(detections, displaySize);

  if (resizedDetections.length > 0) {
    const expressions = resizedDetections[0].expressions;

    let maxExpression = "";
    let maxValue = 0;

    Object.entries(expressions).forEach(([expression, value]) => {
      if (value > maxValue) {
        maxExpression = expression;
        maxValue = value;
      }
    });

    if (maxValue > 0.5 && maxExpression !== lastExpression) {
      lastExpression = maxExpression;
      updateExpressionText(maxExpression);

      
    }
  }
};

let host = location.hostname;
let ws = new WebSocket('ws://' + host + ':8080');

const setupWebSocket = () => {
  ws.onopen = () => console.log("WebSocket Connected");
  ws.onerror = (error) => console.error("Error:", error);
  ws.onclose = () => {
    console.warn("WebSocket Closed");
    setTimeout(() => setupWebSocket(), 2000);
  };
};


const init = async () => {
  setupWebSocket();

  await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri('./models'), faceapi.nets.faceLandmark68Net.loadFromUri('./models'), faceapi.nets.faceRecognitionNet.loadFromUri('./models'), faceapi.nets.faceExpressionNet.loadFromUri('./models')]);

  videoPlayer();

$video.addEventListener('playing', () => {
    setInterval(trackExpressions, 200)
  });

};

init();