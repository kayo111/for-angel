// Мини-игра 1: Прыжок к сердечку
export class Game1 {
    constructor(canvas, ctx, assets, onWin) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assets = assets;
        this.onWin = onWin;
        const size = assets.size;
        this.player = {
            x: canvas.width / 2 - size / 2,
            y: canvas.height - size - 60,
            size,
            dy: 0
        };
        this.target = {
            x: canvas.width / 2 - size / 2,
            y: 80,
            size
        };
        this.gravity = 0.6;

        this.clickHandler = () => { this.player.dy = -11; };
        window.addEventListener('touchstart', this.clickHandler, { passive: true });
        window.addEventListener('mousedown', this.clickHandler);
    }

    cleanup() {
        window.removeEventListener('touchstart', this.clickHandler);
        window.removeEventListener('mousedown', this.clickHandler);
    }

    update() {
        this.player.dy += this.gravity;
        this.player.y += this.player.dy;
        if (this.player.y > this.canvas.height - this.player.size - 20) {
            this.player.y = this.canvas.height - this.player.size - 20;
            this.player.dy = 0;
        }
        const margin = this.player.size * 0.6;
        if (Math.abs(this.player.x + this.player.size / 2 - (this.target.x + this.target.size / 2)) < margin &&
            Math.abs(this.player.y + this.player.size / 2 - (this.target.y + this.target.size / 2)) < margin) {
            this.cleanup();
            this.onWin();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.assets.drawHeart(this.target.x, this.target.y, this.target.size);
        this.assets.drawPlayer(this.player.x, this.player.y, this.player.size);
    }
}
