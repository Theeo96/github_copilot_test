// Pong Game Logic
// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const BALL_SPEED = 5;
const MAX_BALL_SPEED = 8;

// Ball object
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: BALL_SIZE,
  height: BALL_SIZE,
  speedX: BALL_SPEED,
  speedY: BALL_SPEED,
  reset: function() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speedX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    this.speedY = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  }
};

// Left paddle (Player 1)
const paddleLeft = {
  x: 10,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speedY: 0,
  move: function() {
    this.y += this.speedY;
    
    // Boundary checking
    if (this.y < 0) {
      this.y = 0;
    }
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
    }
  },
  draw: function() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};

// Right paddle (Player 2 / AI)
const paddleRight = {
  x: canvas.width - PADDLE_WIDTH - 10,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speedY: 0,
  isAI: true,
  difficulty: 0.08,
  move: function() {
    if (this.isAI) {
      // Simple AI - follows the ball
      const paddleCenter = this.y + this.height / 2;
      const ballCenter = ball.y + ball.height / 2;
      
      if (paddleCenter < ballCenter - 35) {
        this.speedY = PADDLE_SPEED;
      } else if (paddleCenter > ballCenter + 35) {
        this.speedY = -PADDLE_SPEED;
      } else {
        this.speedY = 0;
      }
      
      // Add difficulty variation
      if (Math.random() > this.difficulty) {
        this.speedY *= 0.7;
      }
    }
    
    this.y += this.speedY;
    
    // Boundary checking
    if (this.y < 0) {
      this.y = 0;
    }
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
    }
  },
  draw: function() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};

// Score tracking
const score = {
  left: 0,
  right: 0,
  draw: function() {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.left, canvas.width / 4, 50);
    ctx.fillText(this.right, (3 * canvas.width) / 4, 50);
  }
};

// Keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Handle player input
function handleInput() {
  if (keys['w'] || keys['W'] || keys['ArrowUp']) {
    paddleLeft.speedY = -PADDLE_SPEED;
  } else if (keys['s'] || keys['S'] || keys['ArrowDown']) {
    paddleLeft.speedY = PADDLE_SPEED;
  } else {
    paddleLeft.speedY = 0;
  }
}

// Update ball position
function updateBall() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;
  
  // Ball collision with top and bottom walls
  if (ball.y < 0 || ball.y + ball.height > canvas.height) {
    ball.speedY = -ball.speedY;
    ball.y = Math.max(0, Math.min(canvas.height - ball.height, ball.y));
  }
  
  // Ball collision with paddles
  if (
    ball.x < paddleLeft.x + paddleLeft.width &&
    ball.y < paddleLeft.y + paddleLeft.height &&
    ball.y + ball.height > paddleLeft.y
  ) {
    ball.speedX = -ball.speedX;
    ball.x = paddleLeft.x + paddleLeft.width;
    
    // Add spin based on paddle movement
    ball.speedY += paddleLeft.speedY * 0.2;
  }
  
  if (
    ball.x + ball.width > paddleRight.x &&
    ball.y < paddleRight.y + paddleRight.height &&
    ball.y + ball.height > paddleRight.y
  ) {
    ball.speedX = -ball.speedX;
    ball.x = paddleRight.x - ball.width;
    
    // Add spin based on paddle movement
    ball.speedY += paddleRight.speedY * 0.2;
  }
  
  // Ball out of bounds - scoring
  if (ball.x < 0) {
    score.right++;
    ball.reset();
  }
  if (ball.x > canvas.width) {
    score.left++;
    ball.reset();
  }
  
  // Limit ball speed to prevent it from getting too fast
  const maxSpeed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
  if (maxSpeed > MAX_BALL_SPEED) {
    ball.speedX = (ball.speedX / maxSpeed) * MAX_BALL_SPEED;
    ball.speedY = (ball.speedY / maxSpeed) * MAX_BALL_SPEED;
  }
}

// Draw ball
function drawBall() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
}

// Draw center line
function drawCenterLine() {
  ctx.strokeStyle = '#ffffff';
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

// Main game loop
function gameLoop() {
  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Handle input
  handleInput();
  
  // Update game state
  paddleLeft.move();
  paddleRight.move();
  updateBall();
  
  // Draw everything
  drawCenterLine();
  paddleLeft.draw();
  paddleRight.draw();
  drawBall();
  score.draw();
  
  // Continue game loop
  requestAnimationFrame(gameLoop);
}

// Initialize and start the game
function initGame() {
  ball.reset();
  gameLoop();
}

// Start the game when window loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
