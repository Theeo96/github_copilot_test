const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_SPEED = 5 * 1.5; // 1.5x speed increase
const MAX_BALL_SPEED = 8 * 1.5; // 1.5x speed increase
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Particles array for explosion effects
let particles = [];

// Paddle objects
const leftPaddle = {
  x: 10,
  y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0,
  speed: 6
};

const rightPaddle = {
  x: CANVAS_WIDTH - 20,
  y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0,
  speed: 6
};

// Ball object
const ball = {
  x: CANVAS_WIDTH / 2,
  y: CANVAS_HEIGHT / 2,
  radius: 8,
  dx: BALL_SPEED,
  dy: BALL_SPEED,
  speed: BALL_SPEED
};

// Score object
const score = {
  left: 0,
  right: 0
};

// Keyboard input handling
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Create explosion effect when scoring
function createExplosion(x, y) {
  const particleCount = 12;
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const velocity = 3 + Math.random() * 2;
    
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 1,
      color: 'orange'
    });
  }
}

// Update particles (positions and opacity)
function updateParticles() {
  particles = particles.filter(p => p.life > 0);
  
  for (let particle of particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= 0.02;
    particle.vy += 0.1; // gravity effect
  }
}

// Draw particles
function drawParticles() {
  for (let particle of particles) {
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Update game state
function update() {
  // Update paddle positions
  if (keys['w'] && leftPaddle.y > 0) {
    leftPaddle.y -= leftPaddle.speed;
  }
  if (keys['s'] && leftPaddle.y + PADDLE_HEIGHT < CANVAS_HEIGHT) {
    leftPaddle.y += leftPaddle.speed;
  }
  if (keys['ArrowUp'] && rightPaddle.y > 0) {
    rightPaddle.y -= rightPaddle.speed;
  }
  if (keys['ArrowDown'] && rightPaddle.y + PADDLE_HEIGHT < CANVAS_HEIGHT) {
    rightPaddle.y += rightPaddle.speed;
  }

  // Update ball position
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision with top and bottom walls
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > CANVAS_HEIGHT) {
    ball.dy = -ball.dy;
    ball.y = ball.y - ball.radius < 0 ? ball.radius : CANVAS_HEIGHT - ball.radius;
  }

  // Ball collision with paddles
  if (
    ball.x - ball.radius < leftPaddle.x + leftPaddle.width &&
    ball.y > leftPaddle.y &&
    ball.y < leftPaddle.y + PADDLE_HEIGHT
  ) {
    ball.dx = -ball.dx;
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    
    // Add spin based on where ball hits paddle
    let hitPos = (ball.y - (leftPaddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ball.dy += hitPos * 2;
  }

  if (
    ball.x + ball.radius > rightPaddle.x &&
    ball.y > rightPaddle.y &&
    ball.y < rightPaddle.y + PADDLE_HEIGHT
  ) {
    ball.dx = -ball.dx;
    ball.x = rightPaddle.x - ball.radius;
    
    // Add spin based on where ball hits paddle
    let hitPos = (ball.y - (rightPaddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ball.dy += hitPos * 2;
  }

  // Ball out of bounds - scoring
  if (ball.x - ball.radius < 0) {
    score.right++;
    createExplosion(ball.x, ball.y); // Explosion effect when right player scores
    resetBall();
  }
  if (ball.x + ball.radius > CANVAS_WIDTH) {
    score.left++;
    createExplosion(ball.x, ball.y); // Explosion effect when left player scores
    resetBall();
  }

  // Update particles
  updateParticles();
}

// Reset ball to center
function resetBall() {
  ball.x = CANVAS_WIDTH / 2;
  ball.y = CANVAS_HEIGHT / 2;
  ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
}

// Draw game elements
function draw() {
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw center line
  ctx.strokeStyle = '#fff';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw paddles
  ctx.fillStyle = '#fff';
  ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Draw score
  ctx.fillStyle = '#fff';
  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(score.left, CANVAS_WIDTH / 4, 50);
  ctx.fillText(score.right, (CANVAS_WIDTH * 3) / 4, 50);

  // Draw particles
  drawParticles();
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
