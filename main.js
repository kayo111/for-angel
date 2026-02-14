import { Game1 } from './games/game1.js';
import { Game2 } from './games/game2.js';
import { Game3 } from './games/game3.js';
import { Game4 } from './games/game4.js';
import { Game5 } from './games/game5.js';

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

const W = window.innerWidth > 430 ? 430 : window.innerWidth;
const H = window.innerHeight;
canvas.width = W;
canvas.height = H;

// Увеличил размер игрока с 64 до 80
const SPRITE_SIZE = 80; 

const playerImg = new Image();
const heartImg = new Image();
const enemyImg = new Image();
const earthImg = new Image();
playerImg.src = 'images/player.png';
heartImg.src = 'images/heart.png';
enemyImg.src = 'images/enemy.png';
earthImg.src = 'images/earth.png';

// --- ЛОГИКА МУЗЫКАЛЬНОГО ПЛЕЙЛИСТА ---
const playlist = ['audio/bgmusic1.mp3', 'audio/bgmusic2.mp3'];
let currentTrackIndex = 0;
const bgm = document.getElementById('bg-music');

// Устанавливаем первый трек сразу
bgm.src = playlist[currentTrackIndex];

// Автопереключение на следующий трек
bgm.addEventListener('ended', () => {
    currentTrackIndex++;
    if (currentTrackIndex >= playlist.length) {
        currentTrackIndex = 0; // Возврат к первой песне
    }
    bgm.src = playlist[currentTrackIndex];
    bgm.play().catch(err => console.log("Music play blocked by browser"));
});

function drawImg(ctx, img, x, y, size) {
    if (!img.complete || !img.naturalWidth) return;
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, size, size);
}

function drawStar(ctx, x, y, size) {
    const s = size;
    const cx = x + s / 2, cy = y + s / 2;
    ctx.fillStyle = '#ffd93d';
    ctx.strokeStyle = '#e6b800';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? s * 0.4 : s * 0.2;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

const GROUND_HEIGHT = 60;

export const assets = {
    size: SPRITE_SIZE,
    player: playerImg,
    heart: heartImg,
    enemy: enemyImg,
    earth: earthImg,
    drawPlayer(x, y, size) {
        drawImg(ctx, playerImg, x, y, size || SPRITE_SIZE);
    },
    drawHeart(x, y, size) {
        drawImg(ctx, heartImg, x, y, size || SPRITE_SIZE);
    },
    drawEnemy(x, y, size) {
        drawImg(ctx, enemyImg, x, y, size || SPRITE_SIZE);
    },
    drawCollectible(x, y, size) {
        drawImg(ctx, heartImg, x, y, size || SPRITE_SIZE);
    },
    drawStar(x, y, size) {
        drawStar(ctx, x, y, size || SPRITE_SIZE);
    },
    drawGround(offsetX, groundY, viewW, levelW) {
        if (!earthImg.complete || !earthImg.naturalWidth) {
            ctx.fillStyle = '#ff9ebb';
            ctx.fillRect(0, groundY, viewW + 200, GROUND_HEIGHT + 20);
            return;
        }
        const tw = earthImg.naturalWidth;
        const th = earthImg.naturalHeight;
        const scale = GROUND_HEIGHT / th;
        const w = tw * scale;
        let x = -offsetX % w;
        if (x > 0) x -= w;
        while (x < viewW + 100) {
            ctx.drawImage(earthImg, 0, 0, tw, th, x, groundY, w, GROUND_HEIGHT);
            x += w;
        }
    }
};

const levels = [
    { class: Game1, photo: 'images/photo1.png', text: 'Шаг 1: Ты забралась в моё сердце ❤️' },
    { class: Game2, photo: 'images/photo2.png', text: 'Шаг 2: Вместе мы увернёмся от любых туч' },
    { class: Game3, photo: 'images/photo3.png', text: 'Шаг 3: Лови моменты счастья' },
    { class: Game4, photo: 'images/photo4.png', text: 'Шаг 4: Ты — моя звёздочка' },
    { class: Game5, photo: 'images/photo5.png', text: 'С 14 февраля! Я тебя люблю!' } 
];

let currentLevelIndex = 0;
let currentGame = null;

const gameInput = { left: false, right: false };

function showMoveButtons() {
    document.getElementById('move-buttons').classList.remove('hidden');
}
function hideMoveButtons() {
    document.getElementById('move-buttons').classList.add('hidden');
    gameInput.left = false;
    gameInput.right = false;
}

function showTitleScreen() {
    document.getElementById('title-screen').classList.remove('hidden');
    document.getElementById('game-container').querySelector('#mainCanvas').classList.add('hidden');
}

function hideTitleScreen() {
    document.getElementById('title-screen').classList.add('hidden');
}

function showFinalScreen() {
    if (currentGame && currentGame.cleanup) currentGame.cleanup();
    currentGame = null;
    canvas.classList.add('hidden');
    document.getElementById('reward-screen').classList.add('hidden');
    document.getElementById('final-screen').classList.remove('hidden');
}

function startLevel() {
    if (currentLevelIndex >= levels.length) {
        showFinalScreen();
        return;
    }
    document.getElementById('reward-screen').classList.add('hidden');
    document.getElementById('final-screen').classList.add('hidden');
    hideMoveButtons();
    canvas.classList.remove('hidden');

    // Кнопки для 2, 3 и 5 игр
    if ([1, 2, 4].includes(currentLevelIndex)) {
        showMoveButtons();
    } else {
        hideMoveButtons();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const level = levels[currentLevelIndex];
    const LevelClass = level.class;
    const onWin = () => {
        if (currentLevelIndex === 4) {
            showFinalScreen();
            return;
        }
        hideMoveButtons();
        if (currentGame && currentGame.cleanup) currentGame.cleanup();
        currentGame = null;
        document.getElementById('photo-display').src = level.photo;
        document.getElementById('reward-text').innerText = level.text;
        document.getElementById('reward-screen').classList.remove('hidden');
    };

    try {
        currentGame = new LevelClass(canvas, ctx, assets, onWin, gameInput);
        if (currentGame && currentGame.draw) {
            currentGame.draw();
        }
        requestAnimationFrame(loop);
    } catch (err) {
        console.error('startLevel error', err);
        currentGame = null;
    }
}

document.getElementById('play-btn').addEventListener('click', () => {
    hideTitleScreen();
    canvas.classList.remove('hidden');
    // Запуск музыки при первом клике
    bgm.play().catch(() => {});
    startLevel();
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentLevelIndex++;
    startLevel();
});

document.getElementById('music-toggle').addEventListener('click', () => {
    bgm.paused ? bgm.play().catch(() => {}) : bgm.pause();
});

// Обработчики кнопок
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
function setLeft(v) { gameInput.left = v; }
function setRight(v) { gameInput.right = v; }
btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); setLeft(true); }, { passive: false });
btnLeft.addEventListener('touchend', () => setLeft(false));
btnLeft.addEventListener('mousedown', () => setLeft(true));
btnLeft.addEventListener('mouseup', () => setLeft(false));
btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); setRight(true); }, { passive: false });
btnRight.addEventListener('touchend', () => setRight(false));
btnRight.addEventListener('mousedown', () => setRight(true));
btnRight.addEventListener('mouseup', () => setRight(false));

function loop() {
    if (currentGame) {
        currentGame.update();
        currentGame.draw();
    }
    requestAnimationFrame(loop);
}

function init() {
    showTitleScreen();
    loop();
}

function runWhenReady() {
    Promise.all([
        new Promise(r => { playerImg.onload = r; playerImg.onerror = r; }),
        new Promise(r => { heartImg.onload = r; heartImg.onerror = r; }),
        new Promise(r => { enemyImg.onload = r; enemyImg.onerror = r; }),
        new Promise(r => { earthImg.onload = r; earthImg.onerror = r; })
    ]).then(() => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    });
}
runWhenReady();

// Добавь это в конец файла main.js
const skipBtn = document.createElement('button');
skipBtn.innerText = "SKIP (DEBUG)";
skipBtn.style = "position:fixed; top:10px; right:10px; z-index:1000; padding:10px; background:red; color:white; border:none; font-family:serif;";
document.body.appendChild(skipBtn);

skipBtn.onclick = () => {
    if (currentGame) {
        if (currentGame.cleanup) currentGame.cleanup();
        // Просто вызываем callback победы текущей игры
        const level = levels[currentLevelIndex];
        hideMoveButtons();
        document.getElementById('photo-display').src = level.photo;
        document.getElementById('reward-text').innerText = level.text;
        document.getElementById('reward-screen').classList.remove('hidden');
    }
};