const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

let rightPressed = false;
let leftPressed = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//karakteristike platforme
//let platformHeight = canvas.height / 45;
//let platformWidth = canvas.width / 10;
//let platformX = (canvas.width - platformWidth) / 2;
//platformY = canvas.height - platformHeight * 2;

let platformHeight = 139;
let platformWidth = 328;
let platformX = (canvas.width - platformWidth) / 2;
platformY = canvas.height - platformHeight;

//karakteristike lopte
const ballRadius = canvas.width * 0.005;
let ballSpeedY = - Math.floor(Math.random() * 9 + 1);
let leftOrRight = Math.floor(Math.random() * 2);
if (leftOrRight == 0) leftOrRight = -1;
else leftOrRight = 1;
let ballSpeedX = leftOrRight * Math.sqrt(81 - ballSpeedY ** 2);
let ballX = canvas.width / 2;
let ballY = canvas.height - platformHeight * 2 - ballRadius;

//karakteristike cigli
const brickRowNo = 3;
const brickColumnNo = 10;
let brickPadding = canvas.width * 0.01;
let brickWidth = (canvas.width - brickPadding * 2 - brickPadding * (brickColumnNo - 1)) / brickColumnNo;
let brickHeight = canvas.height * 0.05;
let brickOffsetTop = 100;

let bricks = [];
for (let i = 0; i < brickColumnNo; i++) {
    bricks[i] = [];

    for (let j = 0; j < brickRowNo; j++) {
        bricks[i][j] = { x: 0, y: 0, status: 1};
    }
}

let currentScore = 0;
let highScore = localStorage.getItem("highScore") ? parseInt(localStorage.getItem("highScore")) : 0;

let gameOver = false;
let message = "_";

function keyDownHandler(event) {
    if (event.key === "Right" || event.key === "ArrowRight") {
        rightPressed = true;
    } else if (event.key === "Left" || event.key === "ArrowLeft") {
        leftPressed = true;
    } else if (event.key === " ") {
      reset();
    }
}

function keyUpHandler(event) {
    if (event.key === "Right" || event.key === "ArrowRight") {
      rightPressed = false;
    } else if (event.key === "Left" || event.key === "ArrowLeft") {
      leftPressed = false;
    }
  }

function drawPlatform() {
    ctx.beginPath();
    ctx.rect(platformX, platformY, platformWidth, platformHeight);
    ctx.fillStyle = "red";
    ctx.shadowColor = "red";
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0099dd";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let i = 0; i < brickColumnNo; i++) {
        for (let j = 0; j < brickRowNo; j++) {
            if (bricks[i][j].status === 1) {
                let brickX = i * (brickWidth + brickPadding) + brickPadding;
                let brickyY = j * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[i][j].x = brickX;
                bricks[i][j].y = brickyY;
                ctx.beginPath();
                ctx.rect(brickX, brickyY, brickWidth, brickHeight);
                ctx.fillStyle = "red";
                ctx.shadowColor = "green";
                ctx.shadowBlur = 5;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScores() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "right";
  ctx.fillText(`Score: ${currentScore}`, canvas.width - 10, 20);
  ctx.fillText(`High Score: ${highScore}`, canvas.width - 10, 40);
}

function updateScore() {
  currentScore++;
  
  if (currentScore > highScore) {
    highScore = currentScore;
    localStorage.setItem("highScore", highScore);
  }
  
  if (currentScore == brickColumnNo * brickRowNo) {

  }
}

function drawMessage() {
  ctx.font = "70px Arial"; 
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  ctx.font = "20px Arial"; 
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Press Spacebar to play again", canvas.width / 2, canvas.height / 2 + 60);
  message = "_";
}

function lose() {
  gameOver = true;
  message = "GAME OVER";
}

function win() {
  gameOver = true;
  message = "YOU WIN";
}

function canvasCollision() {
  if (ballX + ballRadius >= canvas.width || ballX - ballRadius <= 0) {
    ballSpeedX = -ballSpeedX;
  }
  if (ballY - ballRadius < 0) {
    ballSpeedY = -ballSpeedY;
  }
}

function platformCollision() {
    if (ballY + ballRadius > platformY && ballY + ballRadius < platformY + Math.abs(ballSpeedY) + 1 &&
        ballX > platformX && ballX < platformX + platformWidth) {
          if (ballX < platformX + platformWidth / 2) {
            ballSpeedX = -Math.floor(Math.random() * 8);
          }
          else {
            ballSpeedX = Math.floor(Math.random() * 8);
          }  
          ballSpeedY = -Math.floor(Math.sqrt(81 - ballSpeedX ** 2));
        }
    else if (ballY > platformY && ballY < platformY + platformHeight && (
      ((ballX + ballRadius > platformX) && (ballX < platformX)) || ((ballX - ballRadius < platformX + platformWidth) && (ballX > platformX + platformWidth)))){
        ballSpeedX = -ballSpeedX;
    }
}

function brickCollision() {
  for (let i = 0; i < brickColumnNo; i++) {
    for (let j = 0; j < brickRowNo; j++) {
      let brick = bricks[i][j];
      
      if (brick.status === 1) {
        if (ballX + ballRadius > brick.x &&
          ballX - ballRadius < brick.x + brickWidth &&
          ballY + ballRadius > brick.y &&
          ballY - ballRadius < brick.y + brickHeight) {      
            
            let ballPositionTop = Math.abs(ballY + ballRadius - brick.y);
            let ballPostionBottom = Math.abs(ballY - ballRadius - brick.y - brickHeight);
            let ballPositionLeft = Math.abs(ballX + ballRadius - brick.x);
            let ballPositionRight = Math.abs(ballX - ballRadius - brick.x - brickWidth);
            
            if(ballPositionTop < ballPositionLeft && ballPositionTop < ballPositionRight) {
              ballSpeedY = -ballSpeedY;
            } else if (ballPostionBottom < ballPositionLeft && ballPostionBottom < ballPositionRight) {
              ballSpeedY = -ballSpeedY;
            } else {
              ballSpeedX = -ballSpeedX;
            }
            
            brick.status = 0; 
            updateScore(); 
        }
      }
    }
  }
}

function movement() {
    if(rightPressed && platformX < canvas.width - platformWidth) {
        platformX += 15;
    } else if (leftPressed && platformX > 0) {
        platformX -= 15;
    }

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY >= canvas.height) {

    }
}

function reset() {
  gameOver = false;
  currentScore = 0;
  message = "";

  platformX = (canvas.width - platformWidth) / 2;
  platformY = canvas.height - platformHeight * 2;

  ballSpeedY = - Math.floor(Math.random() * 9 + 1);
  leftOrRight = Math.floor(Math.random() * 2);
  if (leftOrRight == 0) leftOrRight = -1;
  else leftOrRight = 1;
  ballSpeedX = leftOrRight * Math.sqrt(81 - ballSpeedY ** 2);
  ballX = canvas.width / 2;
  ballY = canvas.height - platformHeight * 2 - ballRadius;

  brickPadding = canvas.width * 0.01;
  brickWidth = (canvas.width - brickPadding * 2 - brickPadding * (brickColumnNo - 1)) / brickColumnNo;  
  brickHeight = canvas.height * 0.05;
  brickOffsetTop = 100;

  bricks = [];
  for (let i = 0; i < brickColumnNo; i++) {
    bricks[i] = [];

    for (let j = 0; j < brickRowNo; j++) {
        bricks[i][j] = { x: 0, y: 0, status: 1};
    }
  }
}


const platformImage = new Image();
platformImage.src = "trump.png";

const brickImage = new Image();
brickImage.src = "kamala.png";


function draw() {
  if(!gameOver) {
    if (ballY > canvas.height) {
      lose();
    } 
    else if (currentScore == brickColumnNo * brickRowNo) {
      win();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPlatform();

    ctx.drawImage(platformImage, platformX, platformY, platformWidth, platformHeight);
    for (let i = 0; i < brickColumnNo; i++) {
      for (let j = 0; j < brickRowNo; j++) {
          let brick = bricks[i][j];
          if (brick.status === 1) { // Prikaz cigle samo ako nije uništena
              let brickX = brickPadding + i * (brickWidth + brickPadding);
              let brickY = brickOffsetTop + j * (brickHeight + brickPadding);
              brick.x = brickX;
              brick.y = brickY;
              ctx.drawImage(brickImage, brickX, brickY, brickWidth, brickHeight);
          }
      }
  }

    drawScores();
    movement();
    canvasCollision();
    platformCollision();
    brickCollision();

  } else if (gameOver && message != "_"){
    drawMessage();

  } 
  requestAnimationFrame(draw);
}

draw();
