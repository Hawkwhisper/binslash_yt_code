/** /*:
 * @target MZ
 */

(() => {
    document.body.innerHTML += `<style>html, body, canvas{margin: 0px; padding: 0px; image-rendering: pixelated; image-rendering: crisp-edges; image-rendering: optimizeSpeed;}</style>`;
    const PI = Math.PI;
    const PI2 = Math.PI / 2;
    const PI2X = Math.PI * 2;
    const PI60 = Math.PI / 60;
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
                vert = vert.replace(/\$\[(.+)\];/gm, (a, name) => {
                    return HWEngine._glslExtensions[name];
                });

                frag = frag.replace(/\$\[(.+)\];/gm, (a, name) => {
                    return HWEngine._glslExtensions[name];
                });

                vert = `#version 300 es \nprecision highp float;\n${vert}`;
                frag = `#version 300 es \nprecision highp float;\n${frag}`;

                callback(vert, frag);
            });
        });
    }

    ///////////////////////////////////////////
    // CLASSES
    ///////////////////////////////////////////
    const HWEngine = new class {
        constructor() {
            this._events = {
                filterLoaded: [],
            }

            this._createExtensions();

        }

        compileFilter(src, callback) {
            loadShader(src, (vert, frag) => {
                const coreUniforms = { hwDelta: 0 };
                const filter = new PIXI.Filter(vert, frag, { ...coreUniforms });
                callback(filter);
                this._fireEvents('filterLoaded', filter);
            });
        }

        _createExtensions() {
            this._glslExtensions = {
                "lumins": `float lumins(vec4 color) {
                     return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
                }`,
                // "getNeighbors": 
                "advancedBlendModes": `vec4 blend_Multiply(vec4 src, vec4 new, float mixLevel) {
                    vec4 total = (new * src);
                    return mix(src, total, mixLevel);
                 }
                 
                 vec4 blend_Divide(vec4 src, vec4 new, float mixLevel) {
                    vec4 total = (new / src);
                    return mix(src, total, mixLevel);
                 }
                 
                 vec4 blend_Add(vec4 src, vec4 new, float mixLevel) {
                    vec4 total = src + new;
                    total.r = min(1., total.r);
                    total.g = min(1., total.g);
                    total.b = min(1., total.b);
                    total.a = src.a;
                    return mix(src, total, mixLevel);
                 }
                 
                 vec4 blend_Subtract(vec4 src, vec4 new, float mixLevel) {
                    vec4 total = src - new;
                    total.r = max(0., total.r);
                    total.g = max(0., total.g);
                    total.b = max(0., total.b);
                    total.a = src.a;
                    return mix(src, total, mixLevel);
                 }
                 
                 vec4 blend_Darken(vec4 src, vec4 new, float mixLevel) {
                    float sv = lumins(src);
                    float nv = lumins(new);
                    vec4 total = vec4(vec3(new.rgb-src.rgb), src.a);
                    total.r = max(0., total.r);
                    total.g = max(0., total.g);
                    total.b = max(0., total.b);
                    return mix(src, total, mixLevel);
                 }
                 
                 vec4 blend_Lighten(vec4 src, vec4 new, float mixLevel) {
                    float sv = lumins(src);
                    float nv = lumins(new);
                    vec4 total = vec4(vec3(new.rgb+src.rgb), src.a);
                    total.r = min(1., total.r);
                    total.g = min(1., total.g);
                    total.b = min(1., total.b);
                    return mix(src, total, mixLevel);
                 }
                 
                 vec4 blend_PositionalMultiplier(vec4 src, vec4 new, float mixLevel) {
                    vec4 total = vec4(src.a);
                    total.rgb = vec3((cos((gl_FragCoord.x*lumins(src))/3.1415926535)*((1.*mixLevel)+(new.rgb+src.rgb))) * (sin((gl_FragCoord.y*lumins(src))/3.1415926535)*((1.*mixLevel)+(src.rgb+new.rgb))));
                    total.r = min(1., max(0., total.r));
                    total.g = min(1., max(0., total.g));
                    total.b = min(1., max(0., total.b));
                    return mix(src, total, mixLevel);
                 }
                 
                 vec4 blend_PositionalDivider(vec4 src, vec4 new, float mixLevel) {
                    vec4 total = vec4(src.a);
                    total.rgb = vec3((cos((gl_FragCoord.x*lumins(src))/3.1415926535)*((1.*mixLevel)+(new.rgb+src.rgb))) / (sin((gl_FragCoord.y*lumins(src))/3.1415926535)*((1.*mixLevel)+(src.rgb+new.rgb))));
                    total.r = min(1., max(0., total.r));
                    total.g = min(1., max(0., total.g));
                    total.b = min(1., max(0., total.b));
                    return mix(src, total, mixLevel);
                 }
                 
                 vec4 blend_RedWave(vec4 src, vec4 new, float mixLevel) {
                    vec4 _new = vec4(1.) - vec4(new.rgba);
                    vec4 total = vec4(src.rgba);
                    float sl = lumins(total);
                    float nl = lumins(_new);
                    total.r/=(new.r*nl);
                    total.r*=(total.r*sl);
                    total.g/=(new.r*nl);
                    total.g*=(total.r*sl);
                    total.b/=(new.r*nl);
                    total.b*=(total.r*sl);
                    return mix(src, total, mixLevel);
                 }
                 
                 vec4 blend_GreenWave(vec4 src, vec4 new, float mixLevel) {
                    vec4 _new = vec4(1.) - vec4(new.rgba);
                    vec4 total = vec4(src.rgba);
                    float sl = lumins(total);
                    float nl = lumins(_new);
                    total.r/=(new.r*nl);
                    total.r*=(total.g*sl);
                    total.g/=(new.r*nl);
                    total.g*=(total.g*sl);
                    total.b/=(new.r*nl);
                    total.b*=(total.g*sl);
                    return mix(src, total, mixLevel);
                 }
                 
                 vec4 blend_BlueWave(vec4 src, vec4 new, float mixLevel) {
                    vec4 _new = vec4(1.) - vec4(new.rgba);
                    vec4 total = vec4(src.rgba);
                    float sl = lumins(total);
                    float nl = lumins(_new);
                    total.r/=(new.r*nl);
                    total.r*=(total.b*sl);
                    total.g/=(new.r*nl);
                    total.g*=(total.b*sl);
                    total.b/=(new.r*nl);
                    total.b*=(total.b*sl);
                    return mix(src, total, mixLevel);
                 }
                 
                 vec4 blend_HeavensLight(vec4 src, vec4 new, float mixLevel) {
                    vec4 sat = vec4(1.) - new;
                    vec4 total = new*(sat * src + new);
                    vec4 original = new*(sat * src + new);
                    total.rgb += total.bgr;
                    return mix(original, total, mixLevel);
                 }`
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

        updateFilterUniforms(filters) {
            filters.map(filter => {
                filter.uniforms.hwWidth = Graphics.width;
                filter.uniforms.hwHeight = Graphics.height;
                filter.uniforms.hwRandom = Math.random();
                filter.uniforms.hwPi = PI;
                filter.uniforms.hwPi2 = PI2;
                filter.uniforms.hwPi2x = PI2X;
                filter.uniforms.hwDelta += PI60;
            });
        }
    }

    var globalBinShader = null;
    function applyBinFilter() {
        return;
        if(globalBinShader) {
            this.bin_shader = globalBinShader;
            if(this.filters) this.filters.push(this.bin_shader);
        }
        this.bin_shader = new PIXI.Filter();
        HWEngine.compileFilter("bin_shader", (filter) => {
            if (this.filters) {
                this.filters.splice(this.filters.indexOf(this.bin_shader));
            } else {
                this.filters = [];
            }
            globalBinShader = filter;
            this.bin_shader = globalBinShader;
            this.filters.push(this.bin_shader);
        });
        this.filters.push(this.bin_shader);
    }

    var globalSWShader = null;
    function applySoftWhisperFilter() {
        // return;
        if(globalSWShader) {
            this.sw_shader = globalSWShader;
            if(this.filters) this.filters.push(this.sw_shader);
        }
        this.sw_shader = new PIXI.Filter();
        HWEngine.compileFilter("sw_shader", (filter) => {
            if (this.filters) {
                this.filters.splice(this.filters.indexOf(this.sw_shader));
            } else {
                this.filters = [];
            }
            globalSWShader = filter;
            this.sw_shader = globalSWShader;
            this.filters.push(this.sw_shader);
        });
        this.filters.push(this.sw_shader);
    }

    Scene_Map = class extends Scene_Map {
        start() {
            super.start();
            applyBinFilter.call(this, ...arguments);
                        applySoftWhisperFilter.call(this, ...arguments);
        }

        update() {
            super.update();
            HWEngine.updateFilterUniforms(this.filters);
        }
    };
    
    Scene_Base = class extends Scene_Base {
        start() {
            super.start();
            applyBinFilter.call(this, ...arguments);
                        applySoftWhisperFilter.call(this, ...arguments);
        }

        update() {
            super.update();
            HWEngine.updateFilterUniforms(this.filters);
        }
    };

    Scene_MenuBase = class extends Scene_MenuBase {
        start() {
            super.start();
            applyBinFilter.call(this, ...arguments);
                        applySoftWhisperFilter.call(this, ...arguments);
        }

        update() {
            super.update();
            HWEngine.updateFilterUniforms(this.filters);
        }
    };

    Scene_Options = class extends Scene_Options {
        start() {
            super.start();
            applyBinFilter.call(this, ...arguments);
                        applySoftWhisperFilter.call(this, ...arguments);
        }

        update() {
            super.update();
            HWEngine.updateFilterUniforms(this.filters);
        }
    };

})();