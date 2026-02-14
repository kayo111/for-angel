// Мини-игра 4: По экрану появляются сердечки — тапай по ним, собери 8 (исчезают через несколько секунд)
export class Game4 {
    constructor(canvas, ctx, assets, onWin) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assets = assets;
        this.onWin = onWin;
        this.hearts = [];
        this.score = 0;
        this.needed = 8;
        this.frames = 0;
        this.spawnTimer = 0;

        this.clickHandler = (e) => {
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const px = (x - rect.left) * scaleX;
            const py = (y - rect.top) * scaleY;
            for (let i = this.hearts.length - 1; i >= 0; i--) {
                const s = this.hearts[i];
                if (px >= s.x && px <= s.x + s.size && py >= s.y && py <= s.y + s.size) {
                    this.score++;
                    this.hearts.splice(i, 1);
                    break;
                }
            }
        };
        window.addEventListener('touchstart', this.clickHandler, { passive: true });
        window.addEventListener('mousedown', this.clickHandler);
    }

    cleanup() {
        window.removeEventListener('touchstart', this.clickHandler);
        window.removeEventListener('mousedown', this.clickHandler);
    }

    update() {
        this.frames++;
        this.spawnTimer++;
        if (this.spawnTimer > 40 && this.hearts.length < 3) {
            this.spawnTimer = 0;
            this.hearts.push({
                x: 24 + Math.random() * (this.canvas.width - this.assets.size - 48),
                y: 70 + Math.random() * (this.canvas.height - 160),
                size: this.assets.size * 0.9,
                life: 100
            });
        }
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            this.hearts[i].life--;
            if (this.hearts[i].life <= 0) this.hearts.splice(i, 1);
        }
        if (this.score >= this.needed) {
            this.cleanup();
            this.onWin();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(255,255,255,0.95)';
        this.ctx.font = "10px 'Press Start 2P'";
        this.ctx.fillText('Тапай сердечки: ' + this.score + '/' + this.needed, 12, 28);
        this.hearts.forEach(h => this.assets.drawCollectible(h.x, h.y, h.size));
    }
}
