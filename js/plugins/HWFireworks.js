(() => {
    async function nfor(iCount = 0, interupt = 16.6, processor = i => { }, onYield = i => { }, onError = error => { }, onFinish = () => { }) {
        interupt = Number(interupt);
        return new Promise((s, f) => {
            try {
                // Create the generator function
                function* gen() {
                    var timer = Date.now();
                    while (true) {
                        for (let i = 0; i < iCount; i++) {
                            // Allow a break from the loop after specified interupt ms
                            if (Date.now() > timer + interupt) {
                                timer = Date.now();
                                onYield(i);
                                yield i;
                            }
                            try {
                                processor(i);
                            } catch (e) {
                                f(e);
                            }
                        }
                        return;
                    }
                }

                // Create an updater
                const updater = gen();
                function update() {
                    const next = updater.next();
                    if (next.done) {
                        s(null);
                    } else {
                        setTimeout(() => { update() }, 0);
                    }
                }
                setTimeout(() => { update() }, 0);
            } catch (e) {
                f(e);
            }
        }).then(() => onFinish()).catch(e => onError(e));
    }

    class HWParticleContainer extends Sprite {
        initialize() {
            super.initialize(new Bitmap(0, 0));
            this._particles = [];
            this._recallNfor = true;
        }

        update() {
            super.update();
            if (this._recallNfor) {
                nfor(this._particles.length, 50, i => {
                    this._particles[i].update();
                }, i => { }, i => { }, i => {
                    this._recallNfor = true;
                });
                this._recallNfor = false;
            }
        }
    }

    class HWParticle extends Sprite {

    }

    Scene_Title = class extends Scene_Title {
        start() {
            super.start();
            this.tsp = new HWParticleContainer();
            this.addChild(this.tsp);
            
        }
    }
})();