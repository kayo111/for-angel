export class Game2 {
    constructor(canvas, ctx, assets, onWin, input = { left: false, right: false }) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assets = assets;
        this.onWin = onWin;
        this.input = input;
        const size = assets.size;
        this.totalTime = 30;
        this.timeLeft = this.totalTime;
        this.startTime = null;
        this.player = {
            x: canvas.width / 2 - size / 2,
            y: canvas.height - size - 50,
            size,
            vx: 0
        };
        this.enemies = [];
        this.frames = 0;
        this.speed = 5; // Чуть быстрее макс. скорость
        this.accel = 0.4;
        this.friction = 0.88;
    }

    reset() {
        this.timeLeft = this.totalTime;
        this.startTime = null;
        this.player.x = this.canvas.width / 2 - this.assets.size / 2;
        this.player.vx = 0;
        this.enemies = [];
    }

    cleanup() {
        this.input.left = false;
        this.input.right = false;
    }

    update() {
        this.frames++;
        if (this.startTime == null) this.startTime = Date.now();
        const elapsedSec = (Date.now() - this.startTime) / 1000;
        this.timeLeft = Math.max(0, Math.ceil(this.totalTime - elapsedSec));
        
        if (this.timeLeft <= 0) {
            this.cleanup();
            this.onWin();
            return;
        }

        if (this.input.left) this.player.vx -= this.accel;
        if (this.input.right) this.player.vx += this.accel;
        this.player.vx *= this.friction;
        this.player.x += this.player.vx;
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.size, this.player.x));

        // Теперь спавним чаще и до 6 облаков для сложности
        if (this.frames % 25 === 0 && this.enemies.length < 4) {
            this.enemies.push({
                x: Math.random() * (this.canvas.width - this.assets.size * 1.3),
                y: -50,
                size: this.assets.size * 1.3,
                speed: 2 + Math.random() * 2.1 // Скорость падения выше
            });
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.y += e.speed;
            
            // Проверка столкновения
            const margin = (this.player.size + e.size) * 0.38;
            if (Math.abs(this.player.x + this.player.size/2 - (e.x + e.size/2)) < margin &&
                Math.abs(this.player.y + this.player.size/2 - (e.y + e.size/2)) < margin) {
                this.reset();
                break;
            }
            if (e.y > this.canvas.height) this.enemies.splice(i, 1);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = "16px 'Press Start 2P'";
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.timeLeft + 's', this.canvas.width / 2, 40);
        
        this.enemies.forEach(e => this.assets.drawEnemy(e.x, e.y, e.size));
        this.assets.drawPlayer(this.player.x, this.player.y, this.player.size);
    }
}