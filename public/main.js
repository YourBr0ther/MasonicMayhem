const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

let paddleWidth = 150;
let paddleHeight = 10;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

let ball = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  dx: 4,
  dy: -4,
  radius: 10
};

let brickRowCount = 10;  // Number of rows of bricks
let brickColumnCount = 20;  // Number of columns of bricks
let brickWidth = 30;
let brickHeight = 30;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };  // Initialize status to 1 (unbroken)
  }
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) { // Only draw unbroken bricks
        let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        context.beginPath();
        context.rect(brickX, brickY, brickWidth, brickHeight);
        context.fillStyle = "#0095DD";
        context.fill();
        context.closePath();
      }
    }
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  }
  else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  }
  else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
}

function drawPaddle() {
  context.beginPath();
  context.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  context.fillStyle = "gray";
  context.fill();
  context.closePath();
}

function drawBall() {
  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  context.fillStyle = "#0095DD";
  context.fill();
  context.closePath();
}

function updateBallPosition() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Bounce off the left and right walls
  if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
    ball.dx = -ball.dx;
  }

  // Bounce off the top wall
  if (ball.y + ball.dy < ball.radius) {
    ball.dy = -ball.dy;
  } else if (ball.y + ball.dy > canvas.height - ball.radius) {
    // Check if the ball hits the paddle
    if (
      ball.x > paddleX - ball.radius &&
      ball.x < paddleX + paddleWidth + ball.radius &&
      ball.y + ball.dy > canvas.height - paddleHeight - ball.radius
    ) {
      // Calculate the horizontal distance between the ball and the center of the paddle
      let paddleCenterX = paddleX + paddleWidth / 2;
      let distanceFromPaddleCenter = ball.x - paddleCenterX;

      // Adjust the direction based on the distance from the center
      ball.dx = distanceFromPaddleCenter * 0.2 + (Math.random() - 0.5) * 2;

      ball.dy = -Math.abs(ball.dy); // Reverse the vertical direction with absolute value to ensure upward motion
    } else {
      // Game over logic
      console.log("GAME OVER");
      document.location.reload();
      clearInterval(interval);
    }
  }

  // Check for collisions with bricks
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let brick = bricks[c][r];
      if (brick.status === 1) {
        if (
          ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + brickWidth &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brickHeight
        ) {
          ball.dy = -ball.dy;
          brick.status = 0;
        }
      }
    }
  }
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  updateBallPosition();

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  requestAnimationFrame(draw);
}

draw();
