const API_URL = "/api";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const finalScoreEl = document.getElementById("finalScore");

const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const GROUND_HEIGHT = 92;

const player = {
  x: 92,
  y: GAME_HEIGHT / 2,
  width: 34,
  height: 34,
  velocityY: 0,
  gravity: 0.25,
  jumpForce: -7,
  rotation: 0
};

let pipes = [];
let particles = [];
let score = 0;
let bestScore = Number(localStorage.getItem("flappyDevopsBest") || 0);
let gameStarted = false;
let gameOver = false;
let animationId = null;
let pipeSpawnTimer = 0;

bestEl.textContent = bestScore;

function resetGame() {
  player.y = GAME_HEIGHT / 2;
  player.velocityY = 0;
  player.rotation = 0;

  pipes = [];
  particles = [];
  score = 0;
  pipeSpawnTimer = 0;
  gameStarted = false;
  gameOver = false;

  scoreEl.textContent = "0";
  finalScoreEl.textContent = "0";

  startOverlay.classList.add("visible");
  gameOverOverlay.classList.remove("visible");

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  draw();
}

function startGame() {
  if (gameStarted && !gameOver) return;

  startOverlay.classList.remove("visible");
  gameOverOverlay.classList.remove("visible");

  if (gameOver) {
    player.y = GAME_HEIGHT / 2;
    player.velocityY = 0;
    player.rotation = 0;
    pipes = [];
    particles = [];
    score = 0;
    pipeSpawnTimer = 0;
    scoreEl.textContent = "0";
    gameOver = false;
  }

  gameStarted = true;
  flap();

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  loop();
}

function flap() {
  if (!gameStarted || gameOver) return;
  player.velocityY = player.jumpForce;
  spawnParticles(player.x + player.width / 2, player.y + player.height / 2, 6);
}

function spawnParticles(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      radius: Math.random() * 3 + 1,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
      alpha: 1
    });
  }
}

function createPipe() {
  const gap = 210;
  const topMin = 70;
  const topMax = GAME_HEIGHT - GROUND_HEIGHT - gap - 70;
  const topHeight = Math.random() * (topMax - topMin) + topMin;

  pipes.push({
    x: GAME_WIDTH + 80,
    width: 60,
    topHeight,
    gap,
    passed: false
  });
}

function updatePlayer() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  if (player.velocityY < 0) {
    player.rotation = -0.35;
  } else {
    player.rotation = Math.min(1.15, player.rotation + 0.05);
  }

  if (player.y < 0) {
    player.y = 0;
    player.velocityY = 0;
  }

  const groundTop = GAME_HEIGHT - GROUND_HEIGHT;
  if (player.y + player.height >= groundTop) {
    player.y = groundTop - player.height;
    triggerGameOver();
  }
}

function updatePipes() {
  pipeSpawnTimer++;

  if (pipeSpawnTimer >= 190) {
    createPipe();
    pipeSpawnTimer = 0;
  }

  const speed = 2 + Math.min(score * 0.04, 1.8);

  pipes.forEach((pipe) => {
    pipe.x -= speed;

    if (!pipe.passed && pipe.x + pipe.width < player.x) {
      pipe.passed = true;
      score++;
      scoreEl.textContent = String(score);
    }
  });

  pipes = pipes.filter((pipe) => pipe.x + pipe.width > -10);
}

function updateParticles() {
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.03;
  });

  particles = particles.filter((p) => p.alpha > 0);
}

function checkCollision() {
  for (const pipe of pipes) {
    const inPipeX =
      player.x + player.width > pipe.x && player.x < pipe.x + pipe.width;

    const hitsTopPipe = player.y < pipe.topHeight;
    const hitsBottomPipe =
      player.y + player.height > pipe.topHeight + pipe.gap;

    if (inPipeX && (hitsTopPipe || hitsBottomPipe)) {
      triggerGameOver();
      return;
    }
  }
}

function triggerGameOver() {
  if (gameOver) return;

  gameOver = true;
  gameStarted = false;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("flappyDevopsBest", String(bestScore));
    bestEl.textContent = String(bestScore);
  }

  finalScoreEl.textContent = String(score);
  gameOverOverlay.classList.add("visible");
}

function drawBackground() {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  skyGradient.addColorStop(0, "#1d4ed8");
  skyGradient.addColorStop(0.5, "#0f172a");
  skyGradient.addColorStop(1, "#020617");

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  for (let i = 0; i < 22; i++) {
    const x = (i * 97 + Date.now() * 0.01) % (GAME_WIDTH + 120) - 60;
    const y = 60 + (i % 6) * 64;
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect((i * 120) % GAME_WIDTH, 120 + i * 70, 70, 3);
  }
}

function drawGround() {
  const groundY = GAME_HEIGHT - GROUND_HEIGHT;

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, groundY, GAME_WIDTH, GROUND_HEIGHT);

  ctx.fillStyle = "#1e293b";
  for (let x = 0; x < GAME_WIDTH; x += 24) {
    ctx.fillRect(x, groundY + 18, 12, 12);
    ctx.fillRect(x + 12, groundY + 42, 12, 12);
  }

  ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 2);
  ctx.lineTo(GAME_WIDTH, groundY + 2);
  ctx.stroke();
}

function drawPipes() {
  pipes.forEach((pipe) => {
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    gradient.addColorStop(0, "#0ea5e9");
    gradient.addColorStop(1, "#7c3aed");

    ctx.fillStyle = gradient;

    ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
    ctx.fillRect(
      pipe.x,
      pipe.topHeight + pipe.gap,
      pipe.width,
      GAME_HEIGHT - GROUND_HEIGHT - (pipe.topHeight + pipe.gap)
    );

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(pipe.x + 8, 0, 6, pipe.topHeight);
    ctx.fillRect(
      pipe.x + 8,
      pipe.topHeight + pipe.gap,
      6,
      GAME_HEIGHT - GROUND_HEIGHT - (pipe.topHeight + pipe.gap)
    );

    ctx.fillStyle = "#111827";
    ctx.fillRect(pipe.x - 4, pipe.topHeight - 18, pipe.width + 8, 18);
    ctx.fillRect(pipe.x - 4, pipe.topHeight + pipe.gap, pipe.width + 8, 18);
  });
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
  ctx.rotate(player.rotation);

  const gradient = ctx.createLinearGradient(-18, -18, 18, 18);
  gradient.addColorStop(0, "#22d3ee");
  gradient.addColorStop(1, "#7c3aed");

  ctx.fillStyle = gradient;
  ctx.shadowColor = "rgba(34, 211, 238, 0.45)";
  ctx.shadowBlur = 18;
  roundRect(ctx, -player.width / 2, -player.height / 2, player.width, player.height, 10);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(6, -5, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(7, -5, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(-12, 3, 24, 4);

  ctx.restore();
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.fillStyle = `rgba(34, 211, 238, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCenterHint() {
  if (gameStarted || gameOver) return;

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.font = "600 20px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Нажми старт и держи ритм", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130);
}

function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  drawBackground();
  drawPipes();
  drawGround();
  drawParticles();
  drawPlayer();
  drawCenterHint();
}

function loop() {
  updatePlayer();
  updatePipes();
  updateParticles();
  checkCollision();
  draw();

  if (!gameOver) {
    animationId = requestAnimationFrame(loop);
  }
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function handleAction() {
  if (!gameStarted && !gameOver) {
    startGame();
    return;
  }

  if (!gameOver) {
    flap();
  }
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    handleAction();
  }

  if (event.code === "Enter" && gameOver) {
    startGame();
  }
});

canvas.addEventListener("pointerdown", handleAction);
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

resetGame();

async function submitScore() {
  const nameInput = document.getElementById("playerName");
  const rawName = nameInput.value.trim();
  const name = rawName ? rawName.slice(0, 16) : "anon";

  await fetch(`${API_URL}/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      score: score
    })
  });

  await loadLeaderboard();
}

async function loadLeaderboard() {
  const res = await fetch(`${API_URL}/leaderboard`);
  const data = await res.json();

  const list = document.getElementById("leaderboard");
  list.innerHTML = "";

  data.forEach((item, index) => {
    const li = document.createElement("li");

    const name = document.createElement("span");
    name.textContent = `${index + 1}. ${item.name}`;

    const scoreValue = document.createElement("span");
    scoreValue.textContent = item.score;

    li.appendChild(name);
    li.appendChild(scoreValue);
    list.appendChild(li);
  });
}

document
  .getElementById("submitScore")
  .addEventListener("click", submitScore);