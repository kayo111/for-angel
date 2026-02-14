export class Game5 {
    constructor(canvas, ctx, assets, onWin, input) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.assets = assets;
        this.onWin = onWin;
        this.input = input;

        this.stars = [];
        this.collectedCount = 0;
        
        // Список твоих комплиментов
        this.compliments = [
            "Любимая", "Нежная", "Моя душа", "Самая лучшая", 
            "Красивая", "Добрая", "Единственная", "Сияющая",
            "Моё счастье", "Целый мир"
        ];
        
        this.activeText = "";
        this.textTimer = 0;
        
        this.player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: assets.size
        };

        this.target = { x: this.player.x, y: this.player.y };

        this.handleMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.target.x = clientX - rect.left;
            this.target.y = clientY - rect.top;
        };

        window.addEventListener('mousemove', this.handleMove);
        window.addEventListener('touchmove', this.handleMove, { passive: false });

        for (let i = 0; i < this.compliments.length; i++) {
            this.stars.push({
                x: Math.random() * (canvas.width - 60) + 30,
                y: Math.random() * (canvas.height - 150) + 50,
                size: 35,
                text: this.compliments[i],
                collected: false,
                pulse: Math.random() * Math.PI
            });
        }
    }

    cleanup() {
        window.removeEventListener('mousemove', this.handleMove);
        window.removeEventListener('touchmove', this.handleMove);
    }

    update() {
        // Плавное следование за пальцем
        this.player.x += (this.target.x - this.player.x) * 0.1;
        this.player.y += (this.target.y - this.player.y) * 0.1;

        if (this.textTimer > 0) this.textTimer--;

        this.stars.forEach(s => {
            if (!s.collected) {
                s.pulse += 0.04;
                const dist = Math.hypot(this.player.x - s.x, this.player.y - s.y);
                if (dist < 45) {
                    s.collected = true;
                    this.collectedCount++;
                    this.activeText = s.text;
                    this.textTimer = 120; // Текст теперь висит ~2 секунды (при 60fps)
                }
            }
        });

        if (this.collectedCount >= this.compliments.length && this.textTimer === 0) {
            setTimeout(() => this.onWin(), 800);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Устанавливаем фирменный розовый фон
        this.ctx.fillStyle = "#ff9ebb";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Добавим немного "звездной пыли" на фон (светлые точки)
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        for(let i=0; i<20; i++) {
            this.ctx.beginPath();
            this.ctx.arc((i*137)%this.canvas.width, (i*563)%this.canvas.height, 2, 0, Math.PI*2);
            this.ctx.fill();
        }

        // 2. Рисуем звезды
        this.stars.forEach(s => {
            if (!s.collected) {
                const pSize = s.size + Math.sin(s.pulse) * 6;
                this.assets.drawStar(s.x - pSize/2, s.y - pSize/2, pSize);
            }
        });

        // 3. Рисуем игрока
        this.assets.drawPlayer(this.player.x - this.player.size/2, this.player.y - this.player.size/2, this.player.size);

        // 4. Рисуем комплимент (с эффектом появления/затухания)
        if (this.textTimer > 0) {
            // Текст плавно затухает только в последние 30 кадров
            const alpha = this.textTimer > 30 ? 1 : this.textTimer / 30;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.5})`; // Тень для читаемости
            this.ctx.lineWidth = 3;
            this.ctx.font = "18px 'Press Start 2P'";
            this.ctx.textAlign = "center";
            
            // Рисуем обводку и текст
            this.ctx.strokeText(this.activeText, this.canvas.width / 2, this.canvas.height / 2 - 80);
            this.ctx.fillText(this.activeText, this.canvas.width / 2, this.canvas.height / 2 - 80);
        }

        // Интерфейс
        this.ctx.fillStyle = "white";
        this.ctx.font = "10px 'Press Start 2P'";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Найдено: ${this.collectedCount}/${this.compliments.length}`, 20, 40);
    }
}