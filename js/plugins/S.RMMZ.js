/**
 * Super RPG Maker MZ!
 * A heavy modification / organizing tool for manipulating the more difficult functionality.
 */

const SRM = new class {

    constructor() {
    }

    /**
     * Grab party members spriteset from Game_Map and return
     * both Sprite_Actor and the Game_Actor class it's tied to, as well as the index
     * it's currently occupying in the _spriteset._characterSprites array.
     * 
     * @example
     * const fullPlayerData = SRM.actorSpriteLink(0);
     * // 1+ would represent the followers.
     * 
     * @param sprite
     */
    actorSpriteLink(index) {
        var sprite;
        if(index==0) {
            sprite=$gamePlayer;
        } else {
            sprite = $gamePlayer._followers._data[index-1];
        }
        var retmap = null;
        let i = SceneManager._scene._spriteset._characterSprites.length;
        while (i--) {
            const a = SceneManager._scene._spriteset._characterSprites[i];
            if (a._character == sprite) {
                retmap = {
                    sprite: a,
                    actor: a._character,
                    charSpriteIndex: i
                };
                i = 0;
            }
        }
        return retmap
    }

    /**
     * Grab a game event from Game_Map and return
     * both Sprite_Actor and the Game_Actor class it's tied to, as well as the index
     * it's currently occupying in the _spriteset._characterSprites array.
     * 
     * @example
     * const fullPlayerData = SRM.eventSpriteLink(0);
     * // 1+ would represent the followers.
     * 
     * @param sprite
     */
    eventSpriteLink(index) {
        var sprite = $gameMap.events()[index];
        var retmap = null;
        let i = SceneManager._scene._spriteset._characterSprites.length;
        while (i--) {
            const a = SceneManager._scene._spriteset._characterSprites[i];
            if (a._character == sprite) {
                retmap = {
                    sprite: a,
                    actor: a._character,
                    charSpriteIndex: i
                };
                i = 0;
            }
        }
        return retmap
    }

    /**
     * Adds code and arguments to an already existing function from a class.
     * 
     * @example
     * Window_Base = SRM.appendCode(Window_Base, {
     *     name: "initialize",
     *     func: function (rect, ...args) {
     *         ...
     *     }
     * });
     * 
     * @param {class} cls 
     * @param newData
     */
    appendCode(cls, newData = { name: "", func: function (...args) { return; } }) {
        const CLS = class extends cls {
            [newData.name](...args) {
                super[newData.name](...arguments);
                newData.func.call(this, ...arguments);
            }
        };
        return CLS;
    }
}