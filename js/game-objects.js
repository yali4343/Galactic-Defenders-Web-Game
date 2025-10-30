/**
 * Game objects for the Galactic Defenders game
 */

// Game canvas and context
let gameCanvas, gameCtx;

// Game configuration
let gameConfig = {
    shootKey: 'Space',
    gameTime: 2,  // minutes
    background: 'earth' // default
};

// Game state variables
let gameLoop, gameTimeInterval;
let score = 0;
let lives = 3;
let gameTimeLeft = 120; // in seconds
let gameStarted = false;
let gameEnded = false;

// Game objects
let spaceship;
let enemies = [];
let playerBullets = [];
let enemyBullets = [];
let enemySpeed = 2;
let speedIncreaseCount = 0;
let lastSpeedIncreaseTime = 0;

// Game boundaries
const MOVEMENT_BOUNDARY_TOP = 0.6; // 60% from the top (restricts to bottom 40%)

/**
 * Initialize game objects
 */
function initGameObjects() {
    // Set up canvas
    gameCanvas = document.getElementById('game-canvas');
    gameCtx = gameCanvas.getContext('2d');

    updateGameBackground(); // apply the selected background
    
    // Create spaceship
    spaceship = createSpaceship();
    
    // Create enemies
    createEnemies();
    
    // Set initial game state
    score = 0;
    lives = 3;
    playerBullets = [];
    enemyBullets = [];
    enemySpeed = 2;
    speedIncreaseCount = 0;
    lastSpeedIncreaseTime = Date.now();
    
    // Update UI
    updateGameStats();
}


function updateGameBackground() {
    const bgPath = `assets/images/backgrounds/${gameConfig.background}.jpg`;
    const container = document.getElementById("game-container");
    container.style.backgroundImage = `url('${bgPath}')`;
    container.style.backgroundSize = "cover";
    container.style.backgroundRepeat = "no-repeat";
}

/**
 * Create player spaceship
 * @returns {Object} - Spaceship object
 */
function createSpaceship() {
    return {
        x: gameCanvas.width / 2 - 20,
        y: gameCanvas.height - 50,
        width: 40,
        height: 40,
        speed: 5,
        isMovingLeft: false,
        isMovingRight: false,
        isMovingUp: false,
        isMovingDown: false,
        isShooting: false,
        lastShootTime: 0
    };
}

/**
 * Create enemies
 */
function createEnemies() {
    enemies = [];
    
    const rows = 4;
    const cols = 5;
    const enemyWidth = 40;
    const enemyHeight = 40;
    const padding = 20;
    
    const startX = (gameCanvas.width - (cols * (enemyWidth + padding))) / 2;
    const startY = 80;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const enemy = {
                x: startX + col * (enemyWidth + padding),
                y: startY + row * (enemyHeight + padding),
                width: enemyWidth,
                height: enemyHeight,
                row: row,  // Keep track of row for scoring
                isAlive: true
            };
            enemies.push(enemy);
        }
    }
}

/**
 * Create a player bullet
 * @returns {Object} - Bullet object
 */
function createPlayerBullet() {
    return {
        x: spaceship.x + spaceship.width / 2 - 2.5,  // Center the bullet
        y: spaceship.y,
        width: 5,
        height: 10,
        speed: 7,
        color: gameConfig.bulletColor
    };
}

/**
 * Create an enemy bullet
 * @param {Object} enemy - Enemy that fires the bullet
 * @returns {Object} - Bullet object
 */
function createEnemyBullet(enemy) {
    return {
        x: enemy.x + enemy.width / 2 - 2.5,  // Center the bullet
        y: enemy.y + enemy.height,
        width: 5,
        height: 10,
        speed: 5 + speedIncreaseCount,  // Speed increases with game difficulty
        color: '#ff9800'  // Orange color for enemy bullets
    };
}

/**
 * Update game stats display
 */
function updateGameStats() {
    document.getElementById('game-score').textContent = score;
    document.getElementById('game-lives').textContent = lives;
    document.getElementById('game-time-left').textContent = formatTime(gameTimeLeft);
}

/**
 * Calculate score based on enemy row
 * @param {number} row - Enemy row (0-3)
 * @returns {number} - Score value
 */
function getScoreForRow(row) {
    // Row 0 (top) = 20 points
    // Row 1 = 15 points
    // Row 2 = 10 points
    // Row 3 (bottom) = 5 points
    const scores = [20, 15, 10, 5];
    return scores[row];
}

/**
 * Reset the spaceship position
 */
function resetSpaceshipPosition() {
    spaceship.x = gameCanvas.width / 2 - 20;
    spaceship.y = gameCanvas.height - 50;
}

/**
 * Check if all enemies are defeated
 * @returns {boolean} - True if all enemies are defeated
 */
function areAllEnemiesDefeated() {
    return enemies.every(enemy => !enemy.isAlive);
}

