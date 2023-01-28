const PI2 = Math.PI / 2;
class HWUI extends Sprite {
    initialize() {
        super.initialize(new Bitmap(1, 1));
        this.elements = [];
        this.gritTexture = PIXI.Texture.from("./js/plugins/shaders/tex.png");
        this.text = [];
    }

    /**=================================
     * @section Internal Functions
     ===================================*/

    _drawKnob(knob) {
        const { container, style, min_value, max_value, default_value, c_value, text } = knob;
        text.text = `${c_value}`;
        container.clear();
        switch (style) {
            case 0: case 1:
                container.lineWidth = 1;
                container.beginFill(0x05190d, 0.95);
                container.lineStyle(1, 0x000000, .5, 1, false);
                container.drawCircle(16, 16, 16);
                container.lineStyle(1, 0x000000, .5, 1, false);
                container.drawCircle(16, 16, 16);
                container.beginTextureFill(this.gritTexture);
                container.drawCircle(16, 16, 17);
                container.moveTo(16, 16);
                const curnum = Math.max(min_value, (Math.max(1, c_value) / max_value) * Math.PI);
                const xcos = (Math.cos(Math.PI + curnum) * 13);
                const ycos = (Math.sin(Math.PI + curnum) * 13);
                container.lineStyle(0, 0xffffff, 1, 0.5, false);
                container.beginFill(0x05190d, 1);
                container.drawCircle(16, 16, 4);
                container.lineStyle(5, 0x000000, .5, 0.5, false);
                container.moveTo(16, 16);
                container.lineTo(16 + xcos, 16 + ycos);
                container.lineStyle(1, 0x00782e, 1, 0.5, false);
                container.lineTo(16 + (xcos/1.5), 16 + (ycos/1.5));
                container.lineStyle(2, 0x00782e, 1, 0.5, false);
                container.lineTo(16, 16);
                
                // knob.c_value++;
                // knob.c_value = knob.c_value%max_value;
                break;

            case 1:
                text.text = `${(c_value/max_value)*100}%`;
                break;
        }
       

        text.x = 14 - (text.text.length * 2);
        text.y = 20;
    }

    addTurningKnob(min_value, max_value, default_value, style) {
        const text = new PIXI.Text(``, {
            fontFamily: 'rmmz-numberfont',
            fontSize: 8,
            fill: 0xffffff,
            align: 'center',
        });

        const knob = {
            container: new PIXI.Graphics(),
            type: "knob",
            min_value,
            max_value,
            default_value,
            c_value: default_value,
            style,
            text
        };
        this.elements.push(knob);

        this.addChild(knob.container);
        this.addChild(text);
        knob.container.scaleMode = PIXI.SCALE_MODES.NEAREST;
    }

    update() {
        this.elements.map(e => {
            this._drawKnob(e);
            e.c_value = TouchInput.x;
        })
    }
}

Scene_Title = class extends Scene_Title {
    start() {
        super.start();
        const ti = new HWUI();
        this.addChild(ti);
        ti.x = 200;
        ti.y = 200;
        ti.addTurningKnob(0, 100, 50, 0);
    }
}