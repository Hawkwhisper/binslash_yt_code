/** /*:
 * @author TheUnproPro
 * @plugindesc Allows dynamic multiple choices in multiple formats
 * 
 * 
 * ---PLUGIN COMMANDS
 * @command Choices
 * 
 * @arg list
 * @text Choice List
 * @desc The choice list!
 * @type string[]
 * 
 * @arg columns
 * @text Max Columns
 * @desc How many choices there are horizontally.
 * @type number
 * @default 1
 * 
 * @arg position
 * @text Position
 * @type struct<winPos>
 * @default {"init_position":"Mid Center","x":"0","y":"0"}
 * 
 * @help
 * This makes use of the PLugin Commands option in events!
 * You can use that to create a giant list of options,
 * as well as other settings, such as window position!
 * 
 * To check which item you selected, you'll need to 
 * start up a "Conditional Branch" after the plugin command.
 * Go to the 4th tab and select "Script", then type in
 * $wc.lastCommand == 0
 * where 0 is the index you're checking. Choice 1 = 0,
 * Choice 2 = 1, etc, so whatever the index of your choice
 * is minus 1.
 * 
 * Example:
 * ◆Text：None, None, Window, Bottom
 * ：    ：ok multi choicez
 * ◆Plugin Command：tupWorldChoice, Choices
 * ：              ：Choice List = ["Item...
 * ：              ：Max Columns = 2
 * ：              ：Position = {"init_po...
 * ◆If：Script：$wc.lastChoice == 0
 *   ◆Text：None, None, Window, Bottom
 *   ：    ：You Selected Item 1!
 *   ◆
 * ：End
 * ◆If：Script：$wc.lastChoice == 5
 *   ◆Text：None, None, Window, Bottom
 *   ：    ：You Selected Item 6!
 *   ◆
 * ：End
 * ◆Text：None, None, Window, Bottom
 * ：    ：like, why tho
 */

/** /*~struct~winPos:
 *
 * @param init_position
 * @type select
 * @option Top Left
 * @option Top Middle
 * @option Top Right
 * @option Mid Left
 * @option Mid Center
 * @option Mid Right
 * @option Lower Left
 * @option Lower Middle
 * @option Lower Right
 * @default Mid Center
 * 
 * @param x
 * @text X Offset
 * @desc Amount of pixels to shift horizontally.
 * @type number
 * @min -999999;
 * @default 0
 * 
 * @param y
 * @text Y Offset
 * @desc Amount of pixels to shift vertically.
 * @type number
 * @min -999999;
 * @default 0
 * 
*/

var $wc = {
    lastChoice: 0,
};
(() => {
    const pluginName = "tupWorldChoice";

    PluginManager.registerCommand(pluginName, "Choices", args => {
        var { list, columns, position } = args;
        list = JSON.parse(list);
        position = JSON.parse(position);
        position.x = JSON.parse(position.x);
        position.y = JSON.parse(position.y);
        columns = parseInt(columns);

        const mcWindow = new Window_HWCmd();
        SceneManager._scene._mcWindowActive = mcWindow;
        mcWindow.prepare(columns, position.init_position, position.x, position.y, list);
        SceneManager._scene.addChild(mcWindow);


        mcWindow.setHandler('a', () => {
            mcWindow.close();
            $gameMap._interpreter._index--;
        });
    });

    //_-_-_-_-_-_-_-_-_-_-_-_-
    // CUSTOM CLASSES
    //_-_-_-_-_-_-_-_-_-_-_-_-

    class Window_HWCmd extends Window_Command {
        initialize() {
            Window_Selectable.prototype.initialize.call(this, new Rectangle(0, 0, Graphics.width, Graphics.height));
        }

        cmdWidth() {
            return 192;
        }

        prepare(cols, position, x, y, list) {
            this.maxCols = function () { return cols };
            this.move(0, 0, this.cmdWidth() * cols, this.fittingHeight(list.length / this.maxCols()))
            switch (position) {
                case "Top Left":
                    this.x = 0;
                    this.y = 0;
                    break;
                case "Top Middle":
                    this.x = Graphics.width / 2 - (this.width / 2);
                    this.y = 0;
                    break;
                case "Top Right":
                    this.x = Graphics.width - (this.width);
                    this.y = 0;
                    break;
                case "Mid Left":
                    this.x = 0;
                    this.y = Graphics.height / 2 - (this.height / 2);
                    break;
                case "Mid Center":
                    this.x = Graphics.width / 2 - (this.width / 2);
                    this.y = Graphics.height / 2 - (this.height / 2);
                    break;
                case "Mid Right":
                    this.x = Graphics.width - (this.width);
                    this.y = Graphics.height / 2 - (this.height / 2);
                    break;
                case "Lower Left":
                    this.x = 0;
                    this.y = Graphics.height - (this.height);
                    break;
                case "Lower Middle":
                    this.x = Graphics.width / 2 - (this.width / 2);
                    this.y = Graphics.height - (this.height);
                    break;
                case "Lower Right":
                    this.x = Graphics.width - (this.width);
                    this.y = Graphics.height - (this.height);
                    break;
            }
            this.x += x;
            this.y += y;
            this.refresh(list);
        }

        makeCommandList(list = ["Ok", "one", "two"]) {
            list.map((item, index) => {
                this.addCommand(item, 'a');
            });
        }

        refresh(list) {
            this.clearCommandList();
            this.makeCommandList(list);
            Window_Selectable.prototype.refresh.call(this);
            this.paint();
            this.select(0);
            this.activate();
        }

        update() {
            super.update();
            $wc.lastChoice = this._index;
        }
    }

    Game_Message = class extends Game_Message {
        isBusy() {
            if (SceneManager._scene._mcWindowActive) {
                return super.isBusy() || SceneManager._scene._mcWindowActive._openness>0;
            }
            return super.isBusy();
        }
    }

    Game_Player = class extends Game_Player {
        canMove() {
            if (SceneManager._scene._mcWindowActive) {
                return super.canMove() && SceneManager._scene._mcWindowActive._openness==0;
            }
            return super.canMove();
        }
    }
})();