(() => {
    document.body.innerHTML += `<style>*{image-rendering:pixelated;}</style>`;
    Scene_Title = class extends Scene_Title {
        start() {
            super.start();
            SceneManager.push(Scene_HWBars);
        }
    }

    class HWBarSprite extends Sprite {
        initialize(length, height, angle) {
            super.initialize(new Bitmap(length, height));
            this.endValue = 100;
            this.lastValue = 50;
            this.currentValue = 0;
            this.angle = angle;

            this.colorSet = {
                bg: "#00000050",
                fg1: ColorManager.textColor(Math.floor(this.angle / 32 % 15)),
                fg2: ColorManager.textColor(Math.floor(this.angle / 32 % 15)),
                slide: "#ffffff"
            }
        }

        update() {
            super.update();
            this.currentValue -= (this.currentValue - this.lastValue) / (2 + Math.max(1, (this.currentValue / this.lastValue) * 5));

            const bmp = this.bitmap;
            const ctx = bmp._context;
            const { fg1, fg2, bg, slide } = this.colorSet;
            const { currentValue, endValue, lastValue } = this;
            bmp.clear();
            // bmp.fillRect(0, 0, bmp.width, bmp.height, bg);
            const curval = (Math.max(currentValue, 1) / Math.max(endValue, 1));
            const trrval = (Math.max(lastValue, 1) / Math.max(endValue, 1));
            const slideval = (Math.max(currentValue, 1) / Math.max(lastValue, 1));
            const slidera = curval * bmp.width;
            const sliderb = trrval * bmp.width;
            // bmp.gradientFillRect(1, 1, slidera - 2, bmp.height - 2, fg1, fg2);
            // ctx.globalAlpha = Math.min(1, Math.max(0, 1 - slideval));
            // bmp.fillRect(1, 1, sliderb - 2, bmp.height - 2, slide);
            // ctx.globalAlpha = 1;

            const _sx = -(bmp.width / 2);
            const hval = (curval * bmp.height / 2);
            ctx.beginPath();
            ctx.fillStyle = bg;
            ctx.moveTo(0, bmp.height / 2);
            ctx.lineTo(bmp.width, 0);
            ctx.lineTo(bmp.width, bmp.height);
            ctx.lineTo(0, bmp.height / 2);
            ctx.fill();

            ctx.beginPath();

            const x = 0;
            const y = (bmp.height / 2) - hval;
            const x1 = slidera;
            const y1 = (bmp.height / 2) + hval;
            const grad = ctx.createLinearGradient(x, y, x1, y1);
            grad.addColorStop(0, fg1);
            grad.addColorStop(1, fg2);
            ctx.fillStyle = grad;
            ctx.moveTo(1, (bmp.height / 2));
            ctx.lineTo(slidera, ((bmp.height + 1) / 2) - (curval * (bmp.height - 1) / 2));
            ctx.lineTo(slidera, ((bmp.height - 1) / 2) + (curval * (bmp.height + 1) / 2));
            ctx.lineTo(1, (bmp.height / 2));
            ctx.fill();


        }
    }

    class Scene_HWBars extends Scene_Base {
        initialize() {
            super.initialize();
            this.testBars = new Sprite(new Bitmap(0, 0));
            this.addChild(this.testBars);

            var count = 24;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * 360;
                var bar = new HWBarSprite(100, 8, angle);
                bar.x = Graphics.width / 2;
                bar.y = Graphics.height / 2;

                this.addChild(bar);
            }

        }


        update() {
            super.update();
        }
    }
})();