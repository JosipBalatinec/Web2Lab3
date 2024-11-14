const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

let rightPressed = false;
let leftPressed = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//karakteristike platforme 
let platformHeight = canvas.height / 45;
let platformWidth = canvas.width / 10;
let platformX = (canvas.width - platformWidth) / 2;
platformY = canvas.height - platformHeight * 2;

//karakteristike lopte, lopta se na početku uvijek kreće prema gore, nasumično lijevo ili desno pod nekim kutem, Y brzina nikad nije 0, brzina je rekao bih poštena
//ako veličina prozora nije premala
const ballRadius = canvas.width * 0.0077;
const diagonalOffset = ballRadius / Math.sqrt(2);
let leftOrRight = Math.floor(Math.random() * 2);
if (leftOrRight == 0) leftOrRight = -1;
else leftOrRight = 1;

let ballSpeedX = leftOrRight * (Math.random() * 8);
let ballSpeedY = - Math.abs((Math.sqrt(81 - ballSpeedX ** 2)));
let ballX = canvas.width / 2;
let ballY = canvas.height - platformHeight * 2 - ballRadius;

//karakteristike cigli 
const brickRowNo = 3;
const brickColumnNo = 10;
let brickPadding = canvas.width * 0.0055;
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

//zastavica za koliziju s ciglom, bio je problem kad bi loptica dotaknula 2 cigle istovremeno pa bi se samo nastavila kretati u istom smjeru jer 
//bi brzina dvaput promijenila predznak  
let collisionFlag = false;

let currentScore = 0;
let highScore = localStorage.getItem("highScore") ? parseInt(localStorage.getItem("highScore")) : 0;

//varijabla za detekciju kraja igre
let gameOver = false;
let message = "_";

//funkcije za događaje s strelicama i spacebarom
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

//crtanje platforme
function drawPlatform() {
    ctx.beginPath();
    ctx.rect(platformX, platformY, platformWidth, platformHeight);
    ctx.fillStyle = "red";
    ctx.shadowColor = "red";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
}

//crtanje lopte
function drawBall() {
    ctx.shadowBlur = 0; 
    ctx.shadowColor = "transparent";

    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0099dd";
    ctx.fill();
    ctx.closePath();
}

//crtanje cigli
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

                if (j == 0) {
                  ctx.fillStyle = "red";
                  ctx.shadowColor = "red";
                } else if (j == 1) {
                  ctx.fillStyle = "yellow";
                  ctx.shadowColor = "yellow";
                } else {
                  ctx.fillStyle = "green";
                  ctx.shadowColor = "green";
                }
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

//crtanje bodova
function drawScores() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "right";
  ctx.fillText(`Score: ${currentScore}`, canvas.width - 10, 20);
  ctx.fillText(`High Score: ${highScore}`, canvas.width - 10, 40);
}

//mijenjanje broja bodova i spremanje u localStorage ako je novi highScore
function updateScore() {
  currentScore++;
  
  if (currentScore > highScore) {
    highScore = currentScore;
    localStorage.setItem("highScore", highScore);
  }
}

//crtanje poruke na kraju
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

//funkcije za gubitak i pobjedu
function lose() {
  gameOver = true;
  message = "GAME OVER";
}

function win() {
  gameOver = true;
  message = "YOU WIN";
}

//funkcija za detektiranje kolizije loptice s rubom platna
function canvasCollision() {
  if (ballX + ballRadius >= canvas.width || ballX - ballRadius <= 0) {
    ballSpeedX = -ballSpeedX;
  }
  if (ballY - ballRadius < 0) {
    ballSpeedY = -ballSpeedY;
  }
  if (ballX - ballRadius < 0) { // znala je loptica proći kroz lijevi ili desni rub pa bi zapela tamo, ovime se izbavi iz ruba
    ballX += ballRadius;
  }
  if (ballX + ballRadius > canvas.width) {
    ballX -= ballRadius;
  }
}

//funkcija za detektiranje kolizije loptice s platformom, ako točke loptice na 135, 180 i 225 stupnjeva udare u platformu, loptica se odbije prema gore,
//ako točke na 0 i 180 stupnjeva udare u platformu loptici se promjeni x brzina i nastavi u dno ekrana
function platformCollision() {
  let leftBotX = ballX - diagonalOffset;
  let leftBotY = ballY - diagonalOffset;
  let rightBotX = ballX + diagonalOffset;
  let rightBotY = ballY + diagonalOffset;

  if ((ballY + ballRadius > platformY &&
    ballY + ballRadius < platformY + Math.abs(ballSpeedY) + 1 &&
    ballX > platformX &&
    ballX < platformX + platformWidth) ||
    (leftBotY > platformY &&
    leftBotY < platformY + Math.abs(ballSpeedY) + 1 &&
    leftBotX > platformX &&
    leftBotX < platformX + platformWidth) || 
    (rightBotY > platformY &&
    rightBotY < platformY + Math.abs(ballSpeedY) + 1 &&
    rightBotX > platformX &&
    rightBotX < platformX + platformWidth)) {
    if (ballX < platformX + platformWidth / 2) {
      ballSpeedX = -(Math.random() * 8);
    }
    else {
      ballSpeedX = (Math.random() * 8);
    }  
    ballSpeedY = -(Math.sqrt(81 - ballSpeedX ** 2));
  }
  else if (ballY > platformY && ballY < platformY + platformHeight && (
    ((ballX + ballRadius > platformX) && (ballX < platformX)) || ((ballX - ballRadius < platformX + platformWidth) && (ballX > platformX + platformWidth)))){
      ballSpeedX = -ballSpeedX;
  }
}
 
//funkcija za detektiranje kolizije loptice s ciglama, za svaku se ciglu koja nije uništena provjerava je li u koliziji s loptom, i ako je s koje strance cigle,
//pa ako je s gornje ili donje, y brzini se mijenja predznak, ako je sa strane, onda x brzini
function brickCollision() {
  for (let i = 0; i < brickColumnNo; i++) {
    for (let j = 0; j < brickRowNo; j++) {
      let brick = bricks[i][j];
      
      if (brick.status === 1) {
        let closestX = Math.max(brick.x, Math.min(ballX, brick.x + brickWidth));
        let closestY = Math.max(brick.y, Math.min(ballY, brick.y + brickHeight));

        let distanceX = ballX - closestX;
        let distanceY = ballY - closestY;
        let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        if (distanceSquared < ballRadius * ballRadius && !collisionFlag) {
          if (Math.abs(distanceX) > Math.abs(distanceY)) {
            ballSpeedX = -ballSpeedX;
          } else {
            ballSpeedY = -ballSpeedY;
          }
            brick.status = 0; 
            updateScore(); 

            collisionFlag = true;
            return;
        }
      }
    }
  }
}

//reset zastavice za koliziju s ciglom
function resetCollisionFlag() {
    collisionFlag = false; 
}

//funkcija za kretanje platforme i mijenjanje pozicije lopte
function movement() {
    if(rightPressed && platformX < canvas.width - platformWidth) {
        platformX += 15;
    } else if (leftPressed && platformX > 0) {
        platformX -= 15;
    }

    ballX += ballSpeedX;
    ballY += ballSpeedY;
}

//funkcija koja postavlja sve na početne pozicije
function reset() {
  gameOver = false;
  currentScore = 0;
  message = "";

  platformX = (canvas.width - platformWidth) / 2;
  platformY = canvas.height - platformHeight * 2;

  leftOrRight = Math.floor(Math.random() * 2);
  if (leftOrRight == 0) leftOrRight = -1;
  else leftOrRight = 1;
  ballSpeedX = leftOrRight * (Math.random() * 8);
  ballSpeedY = - Math.abs((Math.sqrt(81 - ballSpeedX ** 2)));

  ballX = canvas.width / 2;
  ballY = canvas.height - platformHeight * 2 - ballRadius;

  bricks = [];
  for (let i = 0; i < brickColumnNo; i++) {
    bricks[i] = [];

    for (let j = 0; j < brickRowNo; j++) {
        bricks[i][j] = { x: 0, y: 0, status: 1};
    }
  }
}

//funkcija koja poziva sve ostale
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
    drawScores();
    movement();
    canvasCollision();
    platformCollision();
    brickCollision();
    resetCollisionFlag();

  } else if (gameOver && message != "_"){
    drawMessage();
  } 

  requestAnimationFrame(draw);
}

draw();