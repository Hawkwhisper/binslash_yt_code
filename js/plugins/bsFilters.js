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
                vert = vert.replace(/\$\[(.+)\];/gm, (a, name) => {
                    return HWEngine._glslExtensions[name];
                });

                frag = frag.replace(/\$\[(.+)\];/gm, (a, name) => {
                    return HWEngine._glslExtensions[name];
                });

                vert = `#version 300 es \nprecision lowp float;\n${vert}`;
                frag = `#version 300 es \nprecision lowp float;\n${frag}`;

               
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
                const filter = new PIXI.Filter(vert, frag, {});
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
    }

    Scene_Title = class extends Scene_Title {
        start() {
            super.start();
            this.bin_shader = new PIXI.Filter();
            HWEngine.compileFilter("bin_shader", (filter) => {
                this.filters.splice(this.filters.indexOf(this.bin_shader));
                this.bin_shader = filter;
                this.filters.push(this.bin_shader);
                console.log('wat');
            });
            this.filters.push(this.bin_shader);
            // hwFilter.on("filterLoaded", (filter, vert, frag) => {
            //     this.filters.push(hwFilter.filter)
            // });
        }
    }
})();