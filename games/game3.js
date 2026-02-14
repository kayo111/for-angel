export class Game3 {
    constructor(canvas, ctx, assets, onWin, input) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assets = assets;
        this.onWin = onWin;
        this.input = input;

        this.playerSize = assets.size;
        this.groundY = canvas.height - 60;
        
        this.player = {
            x: canvas.width / 2 - this.playerSize / 2,
            y: this.groundY - this.playerSize,
            speed: 3 // Комфортная, но не слишком быстрая скорость игрока
        };

        this.items = [];
        this.score = 0;
        this.needed = 15;
        this.spawnTimer = 0;
        this.itemSpeed = 3.0; // Чуть быстрее старого кода, но медленнее хардкора
    }

    update() {
        // Управление
        if (this.input.left && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.input.right && this.player.x < this.canvas.width - this.playerSize) {
            this.player.x += this.player.speed;
        }

        // Спавн сердечек
        this.spawnTimer++;
        if (this.spawnTimer > 120) { // Оптимальная частота появления
            this.items.push({
                x: Math.random() * (this.canvas.width - this.assets.size),
                y: -this.assets.size,
                // ВЕРНУЛИ КРУПНЫЙ РАЗМЕР (80% от базового размера)
                size: this.assets.size * 0.8 
            });
            this.spawnTimer = 0;
        }

        for (let i = this.items.length - 1; i >= 0; i--) {
            let it = this.items[i];
            it.y += this.itemSpeed;

            // Логика поимки (Коллизия)
            const margin = (this.playerSize + it.size) * 0.4;
            if (Math.abs(this.player.x + this.playerSize/2 - (it.x + it.size/2)) < margin &&
                Math.abs(this.player.y + this.playerSize/2 - (it.y + it.size/2)) < margin) {
                this.score++;
                this.items.splice(i, 1);
                
                if (this.score >= this.needed) {
                    this.onWin();
                    return;
                }
                continue; // Переходим к следующему сердечку
            }

            // ЛОГИКА ПРОИГРЫША: Сердечко упало на пол
            if (it.y > this.groundY) {
                this.score = 0; // Строго: обнуляем счет!
                this.items.splice(i, 1);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем пол
        this.assets.drawGround(0, this.groundY, this.canvas.width, this.canvas.width);
        
        // Рисуем падающие сердечки (теперь они снова крупные!)
        this.items.forEach(it => this.assets.drawCollectible(it.x, it.y, it.size));
        
        // Рисуем увеличенного игрока
        this.assets.drawPlayer(this.player.x, this.player.y, this.playerSize);

        // Интерфейс
        this.ctx.fillStyle = 'white';
        // Если счет обнулился, текст на секунду станет красным для наглядности
        if (this.score === 0 && this.items.length > 0) {
            this.ctx.fillStyle = '#ff4d4d'; 
        }
        
        this.ctx.font = "14px 'Press Start 2P'";
        this.ctx.fillText(`Собрано: ${this.score}/${this.needed}`, 20, 40);
    }
}