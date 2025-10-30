/**
 * Game rendering for the Galactic Defenders game
 */

// Image assets
const images = {
  spaceship: new Image(),
  enemies: [],
  playerBullet: new Image(),
  enemyBullet: new Image(),
};

// Load spaceship image
images.spaceship.src = "assets/images/ours/spaceship.png";

// Load enemy images for each row (4 types)
for (let i = 1; i <= 4; i++) {
  const img = new Image();
  img.src = `assets/images/enemies/enemy${i}.png`;
  images.enemies.push(img);
}

// Load bullet images
images.playerBullet.src = "assets/images/ours/our_rocket.png";
images.enemyBullet.src = "assets/images/enemies/enemy_rocket.png";

/**
 * Render the game
 */
function renderGame() {

  // Draw enemies
  drawEnemies();

  // Draw player
  drawSpaceship();

  // Draw bullets
  drawBullets();
}

/**
 * Draw player spaceship
 */
function drawSpaceship() {
  const targetWidth = 50;
  const targetHeight = 50;
  gameCtx.drawImage(
    images.spaceship,
    spaceship.x,
    spaceship.y,
    targetWidth,
    targetHeight
  );
  spaceship.width = targetWidth;
  spaceship.height = targetHeight;
}

/**
 * Draw enemies
 */
function drawEnemies() {
  const enemyWidth = 50;
  const enemyHeight = 50;
  for (const enemy of enemies) {
    if (enemy.isAlive) {
      gameCtx.drawImage(
        images.enemies[enemy.row],
        enemy.x,
        enemy.y,
        enemyWidth,
        enemyHeight
      );
      enemy.width = enemyWidth;
      enemy.height = enemyHeight;
    }
  }
}


/**
 * Draw bullets
 */
function drawBullets() {
  const playerBulletWidth = 10;
  const playerBulletHeight = 25;
  const enemyBulletWidth = 8;
  const enemyBulletHeight = 20;

  // Draw player bullets
  for (const bullet of playerBullets) {
    if (images.playerBullet.complete && images.playerBullet.naturalWidth > 0) {
      gameCtx.drawImage(
        images.playerBullet,
        bullet.x,
        bullet.y,
        playerBulletWidth,
        playerBulletHeight
      );
    } else {
      gameCtx.fillStyle = gameConfig.bulletColor;
      gameCtx.fillRect(
        bullet.x,
        bullet.y,
        playerBulletWidth,
        playerBulletHeight
      );
    }
    bullet.width = playerBulletWidth;
    bullet.height = playerBulletHeight;
  }

  // Draw enemy bullets
  for (const bullet of enemyBullets) {
    if (images.enemyBullet.complete && images.enemyBullet.naturalWidth > 0) {
      gameCtx.drawImage(
        images.enemyBullet,
        bullet.x,
        bullet.y,
        enemyBulletWidth,
        enemyBulletHeight
      );
    } else {
      gameCtx.fillStyle = "#ff9800";
      gameCtx.fillRect(bullet.x, bullet.y, enemyBulletWidth, enemyBulletHeight);
    }
    bullet.width = enemyBulletWidth;
    bullet.height = enemyBulletHeight;
  }
}

/**
 * Draw game over effects
 * @param {string} reason - Reason for game over
 */
function drawGameOverEffect(reason) {
  // Fade overlay
  gameCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Game over text
  gameCtx.fillStyle = "#ffffff";
  gameCtx.font = "bold 48px Arial";
  gameCtx.textAlign = "center";

  let message = "";

  switch (reason) {
    case "lost":
      message = "You Lost!";
      gameCtx.fillStyle = "#f44336";
      break;
    case "champion":
      message = "Champion!";
      gameCtx.fillStyle = "#ffc107";
      break;
    case "timeout":
      if (score < 100) {
        message = "You can do better";
        gameCtx.fillStyle = "#ff9800";
      } else {
        message = "Winner!";
        gameCtx.fillStyle = "#4caf50";
      }
      break;
  }

  gameCtx.fillText(message, gameCanvas.width / 2, gameCanvas.height / 2);

  // Score text
  gameCtx.font = "24px Arial";
  gameCtx.fillStyle = "#ffffff";
  gameCtx.fillText(
    `Score: ${score}`,
    gameCanvas.width / 2,
    gameCanvas.height / 2 + 50
  );
}


