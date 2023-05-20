const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const startButton = document.getElementById('startButton');
const startScreen = document.getElementById('startScreen');
const gameContainer = document.getElementById('gameContainer');
const spaceBarTitle = document.getElementById('spaceBarTitle');

startButton.addEventListener('click', startGame);

function startGame() {
  startScreen.style.display = 'none'; // Hide the start screen
  gameContainer.style.display = 'block'; // Show the game container
  spaceBarTitle.style.display = 'block'; // Show the space bar title

  document.addEventListener('keydown', handleKeyDown);
  // Start your game logic here
  blockImage.onload = function () {
    ballImage.onload = function () {
      draw();
    };
  };
}

let wallSound = new Audio('wall_sound_effect.mp3');
let blockSound = new Audio('wall_sound_effect.mp3');
let paddleSound = new Audio('wall_sound_effect.mp3');

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
  width: 50, // Update to the actual width of the ball image
  height: 50 // Update to the actual height of the ball image
};

let blockImage = new Image(); // Create an image object
blockImage.src = 'block.png'; // Set the path to your block image file

let ballImage = new Image(); // Create an image object
ballImage.src = 'ball.png'; // Set the path to your ball image file

let gameStarted = false; // Track if the game has started

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
        context.drawImage(blockImage, brickX, brickY, brickWidth, brickHeight); // Draw the block image
      }
    }
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  } else if (e.key == " ") { // Check for spacebar press
    if (!gameStarted) { // Start the game if not already started
      gameStarted = true;
      spaceBarTitle.style.display = 'none'; // Hide the space bar title
      draw(); // Start the game loop
    }
  }
}

function handleKeyDown(e) {
  if (e.key == ' ') { // Check for spacebar press
    if (!gameStarted) { // Start the game if not already started
      gameStarted = true;
      spaceBarTitle.style.display = 'none'; // Hide the space bar title
      draw(); // Start the game loop
    }
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
  context.drawImage(ballImage, ball.x, ball.y, ball.width, ball.height); // Draw the ball image
}

function updateBallPosition() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Bounce off the left and right walls
  if (ball.x + ball.dx > canvas.width - ball.width || ball.x + ball.dx < ball.width) {
    ball.dx = -ball.dx;
    wallSound.play(); // Play wall sound effect
  }

  // Bounce off the top wall
  if (ball.y + ball.dy < ball.width) {
    ball.dy = -ball.dy;
    wallSound.play();
  } else if (ball.y + ball.dy > canvas.height - ball.width) {
    // Check if the ball hits the paddle
    if (
      ball.x > paddleX - ball.width &&
      ball.x < paddleX + paddleWidth &&
      ball.y + ball.dy > canvas.height - paddleHeight - ball.width
    ) {

      // Calculate the horizontal distance between the ball and the center of the paddle
      let paddleCenterX = paddleX + paddleWidth / 2;
      let distanceFromPaddleCenter = ball.x - paddleCenterX;

      // Keep the speed of the ball constant, but change the direction based on which side of the paddle it hits
      ball.dx = Math.sign(distanceFromPaddleCenter) * Math.abs(ball.dx);

      ball.dy = -Math.abs(ball.dy); // Reverse the vertical direction with absolute value to ensure upward motion
      paddleSound.play();
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
          ball.x + ball.width > brick.x &&
          ball.x < brick.x + brickWidth &&
          ball.y + ball.width > brick.y &&
          ball.y < brick.y + brickHeight
        ) {
          let brickCenterX = brick.x + brickWidth / 2;
          let distanceFromBrickCenter = ball.x - brickCenterX;

          ball.dy = -ball.dy; // Reverse the vertical direction

          // Adjust the horizontal direction based on the distance from the center of the brick
          ball.dx = distanceFromBrickCenter * 0.05;

          brick.status = 0;
          blockSound.play();
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

// Start the game loop when the page loads
window.addEventListener("load", function () {
  blockImage.onload = function () {
    ballImage.onload = function () {
      startGame();
    };
  };
});