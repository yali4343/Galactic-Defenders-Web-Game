/**
 * Audio Manager for the Galactic Defenders game
 * This file handles all game sounds and music
 */

// Audio elements
let shootSound, enemyExplosionSound, hurtByEnemiesSound, gameMusic;
let audioEnabled = true;

// Detect base path depending on hosting location (GitHub Pages vs local)
const basePath = window.location.pathname.includes(
  "assignment2-211381009_316127653_assignment2"
)
  ? "/assignment2-211381009_316127653_assignment2/"
  : "./";

/**
 * Initialize audio system
 */
function initAudio() {
  // Create audio elements
  shootSound = createAudioElement("shoot");
  enemyExplosionSound = createAudioElement("enemyExplosion");
  hurtByEnemiesSound = createAudioElement("hurtByEnemies");
  gameMusic = createAudioElement("music", true);

  // Set default volume levels
  setVolumeLevels();

  console.log("Audio system initialized");
}

/**
 * Create an audio element
 * @param {string} type - The type of sound (shoot, enemyExplosion, hurtByEnemies, music)
 * @param {boolean} loop - Whether the audio should loop
 * @returns {HTMLAudioElement} - The created audio element
 */
function createAudioElement(type, loop = false) {
  const audio = new Audio();
  audio.loop = loop;

  switch (type) {
    case "shoot":
      audio.src = `${basePath}assets/audio/shoot.mp3`;
      break;
    case "enemyExplosion":
      audio.src = `${basePath}assets/audio/target_hit.ogg`;
      break;
    case "hurtByEnemies":
      audio.src = `${basePath}assets/audio/target_hit.mp3`;
      break;
    case "music":
      audio.src = `${basePath}assets/audio/background.mp3`;
      break;
  }

  return audio;
}

/**
 * Set volume levels for audio elements
 */
function setVolumeLevels() {
  if (shootSound) shootSound.volume = 0.1;
  if (enemyExplosionSound) enemyExplosionSound.volume = 0.05;
  if (hurtByEnemiesSound) hurtByEnemiesSound.volume = 0.2;
  if (gameMusic) gameMusic.volume = 0.2; // Lower volume for background music
}

/**
 * Play a sound effect
 * @param {HTMLAudioElement} sound - The sound to play
 */
function playSound(sound) {
  if (!audioEnabled || !sound || !sound.src) return;

  try {
    const soundClone = sound.cloneNode();
    soundClone.volume = sound.volume;
    soundClone.play().catch((error) => {
      console.warn("Error playing sound:", error);
    });
  } catch (error) {
    console.warn("Error playing sound:", error);
  }
}

/**
 * Start background music
 */
function startGameMusic() {
  if (!audioEnabled || !gameMusic || !gameMusic.src) return;

  try {
    gameMusic.currentTime = 0;
    gameMusic.play().catch((error) => {
      console.warn("Error playing background music:", error);
    });
  } catch (error) {
    console.warn("Error playing background music:", error);
  }
}

/**
 * Stop background music
 */
function stopGameMusic() {
  if (!gameMusic) return;

  try {
    gameMusic.pause();
    gameMusic.currentTime = 0;
  } catch (error) {
    console.warn("Error stopping music:", error);
  }
}

/**
 * Toggle audio on/off
 * @returns {boolean} - New audio state
 */
function toggleAudio() {
  audioEnabled = !audioEnabled;

  if (!audioEnabled) {
    stopGameMusic();
  } else if (gameStarted && !gameEnded) {
    startGameMusic();
  }

  return audioEnabled;
}

/**
 * Preload all audio files
 * @returns {Promise} - Resolves when all audio is loaded or on timeout
 */
function preloadAudio() {
  const audioElements = [
    shootSound,
    enemyExplosionSound,
    hurtByEnemiesSound,
    gameMusic,
  ];
  const promises = [];

  for (const audio of audioElements) {
    if (!audio || !audio.src) continue;

    const promise = new Promise((resolve) => {
      audio.addEventListener("canplaythrough", resolve, { once: true });
      audio.addEventListener("error", resolve, { once: true });
      setTimeout(resolve, 3000);
      audio.load();
    });

    promises.push(promise);
  }

  return Promise.all(promises);
}
