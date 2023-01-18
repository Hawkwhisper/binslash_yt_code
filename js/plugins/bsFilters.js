/** /*:
 * @target MZ
 */

(() => {
    ///////////////////////////////////////////
    // FUNCTIONS
    ///////////////////////////////////////////

    function loadShader(src, callback) {
        var frag = "";
        var vert = "";

        fetch(`./js/plugins/shaders/${src}/main.vert`).then(a => a.text()).then(_vert => {
            vert = _vert;
            fetch(`./js/plugins/shaders/${src}/main.frag`).then(a => a.text()).then(_frag => {
                frag = _frag;
                vert = `#version 300 es \nprecision lowp float;\n${vert}`;
                frag = `#version 300 es \nprecision lowp float;\n${frag}`;
                callback(vert, frag);
            });
        });
    }

    ///////////////////////////////////////////
    // CLASSES
    ///////////////////////////////////////////
    class HWFilter {
        constructor(src) {
            loadShader(src, (vert, frag) => {
                this.filter = new PIXI.Filter(vert, frag, {});
                this._fireEvents('ready', vert, frag);
            });

            this._events = {
                ready: [],
            }
        }

        _fireEvents(name, ...args) {
            this._events[name].forEach(e => {
                e(...args);
            });
        }

        on(name, callback) {
            this._events[name].push(callback);
        }
    }

    Scene_Title = class extends Scene_Title {
        start() {
            super.start();
            const hwFilter = new HWFilter("bin_shader");
            hwFilter.on("ready", (vert, frag) => {
                this.filters.push(hwFilter.filter)
            });
        }
    }
})();