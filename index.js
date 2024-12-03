const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// Load the pose detection model
async function loadModel() {
  const model = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
  return model;
}

// Start the webcam video
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

// Draw keypoints on the canvas
function drawKeypoints(keypoints) {
  keypoints.forEach(point => {
    if (point.score > 0.5) { // Confidence threshold
      const { x, y } = point;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    }
  });
}

// Perform pose detection
async function detectPose(model) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const poses = await model.estimatePoses(video);

  poses.forEach(pose => {
    drawKeypoints(pose.keypoints);
  });

  requestAnimationFrame(() => detectPose(model)); // Loop for continuous detection
}

// Initialize everything
async function init() {
  await setupCamera();
  const model = await loadModel();
  detectPose(model);
}

init();