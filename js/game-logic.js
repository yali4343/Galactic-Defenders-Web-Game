/**
 * Game logic for the Galactic Defenders game
 */

// Keyboard state
const keyState = {};
let gamePaused = false;
let lastDirectionChangeTime = 0;
let randomMovementActive = false;
let randomMovementDuration = 0;
/**
 * Pause the game
 */
function pauseGame() {
  if (!gameStarted || gameEnded || gamePaused) return;

  gamePaused = true;

  // Stopping the game loop and timer
  clearInterval(gameLoop);
  clearInterval(gameTimeInterval);

  // Pausing the music
  if (gameMusic && gameMusic.pause) {
    gameMusic.pause();
  }
}

/**
 * Resume the game
 */
function resumeGame() {
  if (!gameStarted || gameEnded || !gamePaused) return;

  gamePaused = false;

  // Continue the game loop and timer
  gameLoop = setInterval(updateGame, 16);
  gameTimeInterval = setInterval(updateGameTime, 1000);

  // The music continues.
  if (gameMusic && gameMusic.play) {
    gameMusic.play().catch((err) => console.log("Couldn't resume music:", err));
  }
}

/**
 * Handle New Game button click
 */
function handleNewGameClick() {
  // Pause the game
  pauseGame();

  // Show confirmation modal
  document.getElementById("confirmation-modal").style.display = "block";

  // Set up event listeners for the modal buttons
  document.getElementById("confirm-yes").onclick = function () {
    document.getElementById("confirmation-modal").style.display = "none";
    showScreen("config");
  };

  document.getElementById("confirm-no").onclick = function () {
    document.getElementById("confirmation-modal").style.display = "none";
    resumeGame();
  };

  // Close button and click outside functionality
  document.querySelector("#confirmation-modal .close-modal").onclick =
    function () {
      document.getElementById("confirmation-modal").style.display = "none";
      resumeGame();
    };

  window.onclick = function (event) {
    if (event.target == document.getElementById("confirmation-modal")) {
      document.getElementById("confirmation-modal").style.display = "none";
      resumeGame();
    }
  };
}

/**
 * Initialize game logic
 */
function initGameLogic() {
  // Set up keyboard event listeners
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
}

/**
 * Handle keydown events
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyDown(e) {
  // Prevent default scrolling for game navigation keys
  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
      e.code
    )
  ) {
    e.preventDefault();
  }

  // Only handle keys if game is active
  if (!gameStarted || gameEnded) return;

  // Store key state
  keyState[e.key] = true;

  // Update spaceship movement based on arrow keys
  updateSpaceshipMovement();

  // Handle shooting based on configured key
  if (e.code === gameConfig.shootKey) {
    spaceship.isShooting = true;
  }
}

/**
 * Handle keyup events
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyUp(e) {
  // Prevent default scrolling for game navigation keys
  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
      e.code
    )
  ) {
    e.preventDefault();
  }

  // Only handle keys if game is active
  if (!gameStarted || gameEnded) return;

  // Clear key state
  keyState[e.key] = false;

  // Update spaceship movement based on arrow keys
  updateSpaceshipMovement();

  // Handle shooting based on configured key
  if (e.code === gameConfig.shootKey) {
    spaceship.isShooting = false;
  }
}

/**
 * Update spaceship movement based on keyboard state
 */
function updateSpaceshipMovement() {
  spaceship.isMovingLeft = keyState["ArrowLeft"];
  spaceship.isMovingRight = keyState["ArrowRight"];
  spaceship.isMovingUp = keyState["ArrowUp"];
  spaceship.isMovingDown = keyState["ArrowDown"];
}

/**
 * Initialize the game
 */
function initGame() {
  // Initialize game objects
  initGameObjects();

  updateGameBackground();
  // Set game state
  gameStarted = true;
  gameEnded = false;
  gamePaused = false;

  // Start the game loop
  gameLoop = setInterval(updateGame, 16); // About 60fps

  // Start the game timer
  gameTimeInterval = setInterval(updateGameTime, 1000);

  // Play game music
  startGameMusic();
}

/**
 * Reset the game
 */
function resetGame() {
  // Stop current game if running
  if (gameLoop) clearInterval(gameLoop);
  if (gameTimeInterval) clearInterval(gameTimeInterval);
  stopGameMusic();

  // Reset game state
  gameStarted = false;

  // Start a new game
  initGame();
}

/**
 * Update game time
 */
function updateGameTime() {
  if (gameEnded) return;

  // Decrease time
  gameTimeLeft--;

  // Update display
  document.getElementById("game-time-left").textContent =
    formatTime(gameTimeLeft);

  // Check if time is up
  if (gameTimeLeft <= 0) {
    // End game due to timeout
    endGame("timeout");
  }
}

/**
 * Main game update function
 */
function updateGame() {
  if (gameEnded || gamePaused) return;

  // Clear canvas
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Move game objects
  moveSpaceship();
  moveEnemies();
  moveBullets();

  // Handle enemy shooting
  randomEnemyShoot();

  // Handle player shooting
  handlePlayerShooting();

  // Check for speed increase (every 5 seconds)
  updateEnemySpeed();

  // Check collisions
  checkCollisions();

  // Draw all game objects
  renderGame();

  // Check game end conditions
  checkGameEndConditions();
}

/**
 * Move spaceship based on keyboard input
 */
function moveSpaceship() {
  // Calculate movement boundaries (40% of the bottom of the screen)
  const movementBoundaryTop = gameCanvas.height * MOVEMENT_BOUNDARY_TOP;

  if (spaceship.isMovingLeft && spaceship.x > 0) {
    spaceship.x -= spaceship.speed;
  }

  if (
    spaceship.isMovingRight &&
    spaceship.x < gameCanvas.width - spaceship.width
  ) {
    spaceship.x += spaceship.speed;
  }

  if (spaceship.isMovingUp && spaceship.y > movementBoundaryTop) {
    spaceship.y -= spaceship.speed;
  }

  if (
    spaceship.isMovingDown &&
    spaceship.y < gameCanvas.height - spaceship.height
  ) {
    spaceship.y += spaceship.speed;
  }
}

/**
 * Move enemies left and right
 */
// Update in game-logic.js
function moveEnemies() {
  const currentTime = Date.now();

  // Check if random movement has ended
  if (randomMovementActive && currentTime > randomMovementDuration) {
    randomMovementActive = false;
  }

  // Check if it's time for a new random movement (around every 2-5 seconds)
  if (
    !randomMovementActive &&
    currentTime - lastDirectionChangeTime > randomBetween(2000, 8000)
  ) {
    // 30% chance to activate random movement
    if (Math.random() < 0.3) {
      randomMovementActive = true;
      // Reverse direction for a short time
      enemySpeed = -enemySpeed;
      // Set duration for random movement (0.5-1.5 seconds)
      randomMovementDuration = currentTime + randomBetween(500, 1500);
      lastDirectionChangeTime = currentTime;
    }
  }

  // Check if any enemies need to change direction
  let changeDirection = false;
  for (const enemy of enemies) {
    if (!enemy.isAlive) continue;

    // Check if enemy is at edge of screen
    if (
      (enemy.x <= 0 && enemySpeed < 0) ||
      (enemy.x + enemy.width >= gameCanvas.width && enemySpeed > 0)
    ) {
      changeDirection = true;
      break;
    }
  }

  // Change direction if needed
  if (changeDirection) {
    enemySpeed = -enemySpeed;
  }

  // Move all enemies
  for (const enemy of enemies) {
    if (!enemy.isAlive) continue;
    enemy.x += enemySpeed;
  }
}

/**
 * Update enemy speed based on time
 */
function updateEnemySpeed() {
  const currentTime = Date.now();
  if (currentTime - lastSpeedIncreaseTime >= 5000 && speedIncreaseCount < 4) {
    enemySpeed += Math.sign(enemySpeed); // Increase while maintaining direction
    speedIncreaseCount++;
    lastSpeedIncreaseTime = currentTime;
  }
}

/**
 * Handle player shooting
 */
function handlePlayerShooting() {
  if (spaceship.isShooting && Date.now() - spaceship.lastShootTime > 300) {
    // Create bullet
    const bullet = createPlayerBullet();
    playerBullets.push(bullet);

    // Play shoot sound
    playSound(shootSound);

    // Set last shoot time
    spaceship.lastShootTime = Date.now();
  }
}

/**
 * Random enemy shooting
 */
function randomEnemyShoot() {
  // Only allow new enemy bullet if no enemy bullets exist or last bullet has traveled 3/4 of the screen
  const canShoot =
    enemyBullets.length === 0 ||
    enemyBullets[enemyBullets.length - 1].y > gameCanvas.height * 0.75;

  if (canShoot) {
    // Get alive enemies
    const aliveEnemies = enemies.filter((enemy) => enemy.isAlive);

    if (aliveEnemies.length === 0) return;

    // Select random enemy
    const randomEnemy =
      aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

    // Create bullet
    const bullet = createEnemyBullet(randomEnemy);
    enemyBullets.push(bullet);
  }
}

/**
 * Move bullets
 */
function moveBullets() {
  // Move player bullets
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    playerBullets[i].y -= playerBullets[i].speed;

    // Remove bullets that go off screen
    if (playerBullets[i].y + playerBullets[i].height < 0) {
      playerBullets.splice(i, 1);
    }
  }

  // Move enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].y += enemyBullets[i].speed;

    // Remove bullets that go off screen
    if (enemyBullets[i].y > gameCanvas.height) {
      enemyBullets.splice(i, 1);
    }
  }
}

/**
 * Check collisions
 */
function checkCollisions() {
  // Check player bullets vs enemies
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    const bullet = playerBullets[i];

    for (let j = 0; j < enemies.length; j++) {
      const enemy = enemies[j];

      if (enemy.isAlive && isColliding(bullet, enemy)) {
        // Remove bullet
        playerBullets.splice(i, 1);

        // Kill enemy
        enemy.isAlive = false;

        // Add score based on enemy row
        const points = getScoreForRow(enemy.row);
        score += points;

        // Update display
        updateGameStats();

        // Play enemyenemyExplosion sound
        playSound(enemyExplosionSound);

        break; // Bullet can only hit one enemy
      }
    }
  }

  // Check enemy bullets vs player
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];

    if (isColliding(bullet, spaceship)) {
      // Remove bullet
      enemyBullets.splice(i, 1);

      // Reduce lives
      lives--;

      // Update display
      updateGameStats();

      // Play hurtByEnemies sound
      playSound(hurtByEnemiesSound);

      // Reset player position
      resetSpaceshipPosition();

      break;
    }
  }
}

/**
 * Check game end conditions
 */
function checkGameEndConditions() {
  // Check if player is out of lives
  if (lives <= 0) {
    endGame("lost");
    return;
  }

  // Check if all enemies are dead
  if (areAllEnemiesDefeated()) {
    endGame("champion");
    return;
  }
}

/**
 * End the game
 * @param {string} reason - Reason for ending game ('lost', 'timeout', 'champion')
 */
function endGame(reason) {
  gameEnded = true;

  // Stop game loop and timer
  clearInterval(gameLoop);
  clearInterval(gameTimeInterval);

  // Stop game music
  stopGameMusic();

  // Save score to history
  saveScore();

  // Show game over screen with appropriate message
  const resultTitle = document.getElementById("game-result-title");
  const resultMessage = document.getElementById("game-result-message");

  if (reason === "lost") {
    resultTitle.textContent = "You Lost!";
    resultTitle.className = "message-lost";
  } else if (reason === "champion") {
    resultTitle.textContent = "Champion!";
    resultTitle.className = "message-champion";
  } else if (reason === "timeout") {
    if (score < 100) {
      resultTitle.textContent = "You can do better";
      resultTitle.className = "message-better";
    } else {
      resultTitle.textContent = "Winner!";
      resultTitle.className = "message-winner";
    }
  }

  resultMessage.textContent = `You scored ${score} points!`;

  // Show game over screen
  showScreen("gameOver");
}
