export class Game3 {
    constructor(canvas, ctx, assets, onWin, input) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assets = assets;
        this.onWin = onWin;
        this.input = input;
        
        const size = assets.size;
        this.player = {
            x: canvas.width / 2 - size / 2,
            y: canvas.height - size - 60,
            size,
            vx: 0
        };
        this.hearts = [];
        this.collected = 0;
        this.needed = 10;
        this.frames = 0;

        // Физика движения
        this.speed = 6;
        this.accel = 0.4;
        this.friction = 0.88;
    }

    update() {
        this.frames++;

        // Движение по кнопкам из script.js
        if (this.input.left) this.player.vx -= this.accel;
        if (this.input.right) this.player.vx += this.accel;
        
        this.player.vx *= this.friction;
        this.player.x += this.player.vx;

        // Ограничение экрана
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.size, this.player.x));

        // Сердечки: реже и медленнее
        if (this.frames % 80 === 0 && this.hearts.length < 3) {
            this.hearts.push({
                x: Math.random() * (this.canvas.width - this.assets.size),
                y: -50,
                size: this.assets.size * 0.9,
                speed: 2 + Math.random() // Медленно
            });
        }

        for (let i = this.hearts.length - 1; i >= 0; i--) {
            const h = this.hearts[i];
            h.y += h.speed;

            const margin = (this.player.size + h.size) * 0.4;
            if (Math.abs(this.player.x + this.player.size / 2 - (h.x + h.size / 2)) < margin &&
                Math.abs(this.player.y + this.player.size / 2 - (h.y + h.size / 2)) < margin) {
                this.collected++;
                this.hearts.splice(i, 1);
            } else if (h.y > this.canvas.height) {
                this.hearts.splice(i, 1);
            }
        }

        if (this.collected >= this.needed) this.onWin();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = "12px 'Press Start 2P'";
        this.ctx.fillText(`❤️: ${this.collected}/${this.needed}`, 20, 40);
        this.hearts.forEach(h => this.assets.drawCollectible(h.x, h.y, h.size));
        this.assets.drawPlayer(this.player.x, this.player.y, this.player.size);
    }
}