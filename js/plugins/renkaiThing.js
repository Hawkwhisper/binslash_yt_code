// (()=>{
// })();

Bitmap.prototype.drawQuadraticCurve = function(sx, sy, ex, ey, bendx, bendy, color) {
    const ctx = this._context;

    // Quadratic curves example
    const ost = ctx.strokeStyle;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(bendx, bendy, ex, ey);
    ctx.stroke();
    ctx.strokeStyle = ost;
}

function __partySelected() {
    for (let i of $gameParty.members()) {
        if (i._actorId == $gameParty._menuActorId) {
            return i;
        }
    }
    return null;
}


Window_BattleSkill = class extends Window_BattleSkill {
    makeItemList() {
        super.makeItemList();
        this._data = [];
        if (this._actor) {
            this._actor.equippedSkills().map(m => { if (m) this._data.push(m) })
        }
    }
}

Game_Actor = class extends Game_Actor {
    initialize() {
        super.initialize(...arguments);
        this._equippedSkills = [];
        this._otherBoosts = new Int16Array(this._paramPlus.length + 2);
        this._equipSkillSlots = 5;
        for (let i = 0; i < this.equipSkillSlots(); i++) {
            this._equippedSkills.push(null);
        }
    }

    equippedSkills() {
        return this._equippedSkills;
    }

    equipSkillSlots() {
        return this._equipSkillSlots;
    }

    update() {
        for (let i = 0; i < this._equippedSkills.length; i++) {
            this._otherBoosts[i] = 0;
            const skill = this._equippedSkills[i];
            if (skill) {
                const meta = skill.meta.boost;
                if (meta) {
                    const data = meta.replace(/\[(.*)\]\[(.*)\]/gm, (a, _statList, _statGain) => {
                        let statList = _statList.split(',').map(m => parseInt(m));
                        let statGain = _statGain.split(',').map(m => parseInt(m));
                        for (let j = 0; j < statList.length; j++) {
                            this._otherBoosts[statList[j]] += statGain[j];
                        }
                    });
                }
            }
        }
    }
}


Window_MenuCommand = class extends Window_MenuCommand {
    addOriginalCommands() {
        super.addOriginalCommands(...arguments);
        this.addCommand(`Skill Equip`, `sk_eq`);
    }
}

Scene_Menu = class extends Scene_Menu {
    createCommandWindow() {
        super.createCommandWindow(...arguments);
        this._commandWindow.setHandler("sk_eq", this.commandPersonal.bind(this));
    }
    onPersonalOk() {
        super.onPersonalOk(...arguments);
        switch (this._commandWindow.currentSymbol()) {
            case "sk_eq":
                SceneManager.push(Scene_SkillEquip);
                break;
        }
    }
}

class Window_SkillEquip extends Window_Command {
    initialize(rect, actor) {
        super.initialize(rect);
        this._actor = actor;
        this.refresh();
    }

    makeCommandList() {
        this._actor = __partySelected();
        if (!this._actor) return;
        if (!this._actor.equippedSkills) return;
        this._actor.equippedSkills().map(e => {
            if (!e) {
                this.addCommand("EMPTY", "s");
                return e;
            }
            this.addCommand(`${e.iconIndex}::${e.name}::${e.mpCost}::${e.tpCost}`, "s");
        });
    }

    drawItem(index) {
        const cmdData = this.commandName(index).split("::");
        if (cmdData.length < 2) {
            super.drawItem(index);
        } else {
            const rect = this.itemLineRect(index);
            const mpCost = parseInt(cmdData[2]);
            const tpCost = parseInt(cmdData[3]);
            let _ay = rect.y - (this._padding / 2);
            this.resetTextColor();
            this.changePaintOpacity(this.isCommandEnabled(index));
            this.drawIcon(cmdData[0], rect.x, rect.y + 2);
            this.drawText(cmdData[1], rect.x + ImageManager.iconWidth + this.itemPadding(), rect.y, rect.width);
            if (mpCost > 0) {
                this.contents.fontSize /= 1.5;
                let _tpw = this.contents.measureTextWidth("MP") + 2;
                this.drawText(`MP`, rect.x, rect.y, rect.width, 'right');
                this.changeTextColor(ColorManager.mpCostColor());
                this.drawText(`${cmdData[2]}`, rect.x - _tpw, rect.y, rect.width, 'right');
                this.contents.fontSize *= 1.5;
            } else if (tpCost > 0) {
                this.contents.fontSize /= 1.5;
                let _tpw = this.contents.measureTextWidth("MP") + 2;
                this.drawText(`TP`, rect.x, rect.y, rect.width, 'right');
                this.changeTextColor(ColorManager.tpCostColor());
                this.drawText(`${cmdData[3]}`, rect.x - _tpw, rect.y, rect.width, 'right');
                this.contents.fontSize *= 1.5;
            } else if (mpCost > 0 && tpCost > 0) {
                this.contents.fontSize /= 2;
                let _tpw = this.contents.measureTextWidth("MP") + 2;
                this.drawText(`MP`, rect.x, _ay - 1, rect.width, 'right');
                this.drawText(`TP`, rect.x, _ay + this.contents.fontSize + 1, rect.width, 'right');
                this.changeTextColor(ColorManager.mpCostColor());
                this.drawText(`${cmdData[2]}`, rect.x - _tpw, _ay - 1, rect.width, 'right');
                this.changeTextColor(ColorManager.tpCostColor());
                this.drawText(`${cmdData[3]}`, rect.x - _tpw, _ay + this.contents.fontSize + 1, rect.width, 'right');
                this.contents.fontSize *= 2;
            }
        }
    }

    update() {
        super.update();
        this._disabledList = this._actor.equippedSkills();
    }
}

class Window_SkillEquipData extends Window_Base {
    initialize(rect, actor) {
        super.initialize(rect);
        this._actor = actor;
        this.refresh();
    }

    exVar(index) {
        switch (index) {
            case 0:
                return this._actor.eva * 100;

            case 1:
                return this._actor.hit * 100;
        }

    }

    refresh() {
        this._actor = __partySelected();
        this.contents.clear();
        var x = 0;
        var y = 0;
        this.bonus_elms = ["mhp", "mmp", "atk", "def", "mat", "mdf", "agi", "luk", "cri", "eva"];
        this.contents.fillRect(0, 0, this.contents.width, this.lineHeight() * 3, "rgba(0, 25, 50, 0.5)")
        this.contents.fontSize /= 2;
        for (let i = 0; i < this._actor._paramPlus.length + 2; i++) {
            const term = $dataSystem.terms.params[i];
            let w = (this.contents.width / 2);
            let col = i;
            if (i == 0) col = 20;
            if (i == 1) col = 22;
            if (i == 7) col = 14;
            let xpos = (x + (this.contents.width - (w * 2)));
            let ypos = y;
            let _fullHeight = (this.contents.height / 5);
            let _height = 8;
            this.contents.fillRect(xpos, ypos - 1, w, _fullHeight, ColorManager.textColor(col) + "9a");
            this.contents.fillRect(xpos, ypos - 1, w, _fullHeight, `rgba(0, 0, 0, 0.5)`);
            let should_use_alt = i < this._actor._paramPlus.length;
            var maxv = should_use_alt ? 999 : 50;
            if (i < 2) maxv = 9999;
            let exVar = this.exVar(i - this._actor._paramPlus.length);
            let _bx = should_use_alt ? (((this._actor.paramBase(i) + this._actor._otherBoosts[i]) / maxv) * w) : exVar;
            this.contents.fillRect(xpos, ypos + this.lineHeight() - _height, w, _height, "rgba(0, 0, 0, 0.5)");
            this.contents.gradientFillRect(xpos + 1, ypos + this.lineHeight() - _height, _bx, _height - 2, ColorManager.textColor(col), ColorManager.textColor(col) + "a9");
            this.changeTextColor(ColorManager.textColor(col));
            this.drawText(term, xpos + 2, ypos - 5, w - 4, 'left');
            this.resetTextColor();
            this.drawText(`${should_use_alt ? this._actor._otherBoosts[i] + "+" : exVar + "%"}`, xpos + 2, ypos - 5, w - 4, 'right');
            x += w + 1;
            if (x > w * 2) {
                x = 0;
                y += _fullHeight;
            }
        }
        this.resetTextColor();
        this.contents.fontSize *= 2;
    }

    update() {
        super.update();
    }
}

class Window_SkillEquipHelp extends Window_Base {
    initialize(rect) {
        super.initialize(rect);
        this._output = "";
    }

    refresh() {
        this._actor = __partySelected();
        this.contents.clear();
        this.drawTextEx(this._output, 0, 0);
    }

    updateData(skill) {
        if (!skill) return;
        if (this._output != skill.description) {
            this._output = skill.description;
            this.refresh();
        }
    }
}

class Window_SkillEquipSelect extends Window_Command {
    initialize(rect, actor) {
        super.initialize(rect);
        this._disabledList = [];
        this._actor = actor;
        this.refresh();
    }
    maxCols() {
        return 3;
    }

    makeCommandList() {
        this._actor = __partySelected();
        if (!this._actor) return;
        this.addCommand("REMOVE", "r")
        this._actor._skills.map(e => {
            this.addCommand(`${$dataSkills[e].iconIndex}::${$dataSkills[e].name}::${$dataSkills[e].mpCost}::${$dataSkills[e].tpCost}::${e}`, "s", this.canEquip(e));
        });
    }

    canEquip(s) {
        if (!s.meta) return false;
        let ret = true;
        this._actor.equippedSkills().map(e => {
            if (e) {
                if (e.id == s) {
                    ret = false;
                }
            }
        });
        if (!s.meta.canEquip) ret = false;
        return ret;
    }

    drawItem(index) {
        const cmdData = this.commandName(index).split("::");
        if (cmdData.length < 2) {
            super.drawItem(index);
        } else {
            const rect = this.itemLineRect(index);
            const mpCost = parseInt(cmdData[2]);
            const tpCost = parseInt(cmdData[3]);
            let _ay = rect.y - (this._padding / 2);
            this.resetTextColor();
            this.changePaintOpacity(this.isCommandEnabled(index));
            this.drawIcon(cmdData[0], rect.x, rect.y + 2);
            this.drawText(cmdData[1], rect.x + ImageManager.iconWidth + this.itemPadding(), rect.y, rect.width);
            if (mpCost > 0) {
                this.contents.fontSize /= 1.5;
                let _tpw = this.contents.measureTextWidth("MP") + 2;
                this.drawText(`MP`, rect.x, rect.y, rect.width, 'right');
                this.changeTextColor(ColorManager.mpCostColor());
                this.drawText(`${cmdData[2]}`, rect.x - _tpw, rect.y, rect.width, 'right');
                this.contents.fontSize *= 1.5;
            } else if (tpCost > 0) {
                this.contents.fontSize /= 1.5;
                let _tpw = this.contents.measureTextWidth("MP") + 2;
                this.drawText(`TP`, rect.x, rect.y, rect.width, 'right');
                this.changeTextColor(ColorManager.tpCostColor());
                this.drawText(`${cmdData[3]}`, rect.x - _tpw, rect.y, rect.width, 'right');
                this.contents.fontSize *= 1.5;
            } else if (mpCost > 0 && tpCost > 0) {
                this.contents.fontSize /= 2;
                let _tpw = this.contents.measureTextWidth("MP") + 2;
                this.drawText(`MP`, rect.x, _ay - 1, rect.width, 'right');
                this.drawText(`TP`, rect.x, _ay + this.contents.fontSize + 1, rect.width, 'right');
                this.changeTextColor(ColorManager.mpCostColor());
                this.drawText(`${cmdData[2]}`, rect.x - _tpw, _ay - 1, rect.width, 'right');
                this.changeTextColor(ColorManager.tpCostColor());
                this.drawText(`${cmdData[3]}`, rect.x - _tpw, _ay + this.contents.fontSize + 1, rect.width, 'right');
                this.contents.fontSize *= 2;
            }
        }
    }
}

class Scene_SkillEquip extends Scene_MenuBase {
    start(actor) {
        super.start();
        this.setupPortrait();
        this.setupSkillWindows();
    }

    setupSkillWindows() {

        const h1 = this.calcWindowHeight(4, true);
        const h2 = this.calcWindowHeight(2, false);
        const _y = this.calcWindowHeight(1, false);
        const eqY = _y + h1 + h2;
        this.Window_SkillEquip = new Window_SkillEquip(new Rectangle(0, _y + h2, Graphics.boxWidth - 448, h1), this._actor);
        this.Window_SkillEquipData = new Window_SkillEquipData(new Rectangle(0, h2 + _y, 448, h1), this._actor);
        this.Window_SkillEquipHelp = new Window_SkillEquipHelp(new Rectangle(0, _y, Graphics.boxWidth, h2));
        this.Window_SkillEquipSelect = new Window_SkillEquipSelect(new Rectangle(0, eqY, Graphics.boxWidth, Graphics.boxHeight - eqY), this._actor);
        this.Window_SkillEquip.x = this.Window_SkillEquipData.width
        this.Window_SkillEquipSelect.setHandler('s', () => {
            this._actor._equippedSkills[this.Window_SkillEquip._index] = this.skData;
            this.Window_SkillEquip.activate();
            this.Window_SkillEquip.refresh();
            this.Window_SkillEquipSelect.refresh();
            this.Window_SkillEquipData.refresh();
        });
        this.Window_SkillEquipSelect.setHandler('r', () => {
            this._actor._equippedSkills[this.Window_SkillEquip._index] = null;
            this.Window_SkillEquip.activate();
            this.Window_SkillEquip.refresh();
            this.Window_SkillEquipSelect.refresh();
            this.Window_SkillEquipData.refresh();
        });
        this.Window_SkillEquip.setHandler('s', () => {
            this.Window_SkillEquipSelect.refresh();
            this.Window_SkillEquipSelect.activate();
            this.Window_SkillEquipData.refresh();
        });

        this.Window_SkillEquip.setHandler("cancel", () => {
            SceneManager.pop();
        })

        this.Window_SkillEquipSelect.setHandler("cancel", () => {
            this.Window_SkillEquipSelect.deactivate();
            this.Window_SkillEquip.activate();
            this.Window_SkillEquipData.refresh();
        })
        this.addWindow(this.Window_SkillEquip);
        this.addWindow(this.Window_SkillEquipData);
        this.addWindow(this.Window_SkillEquipHelp);
        this.addWindow(this.Window_SkillEquipSelect);

        this.Window_SkillEquipSelect.deactivate();

        this.Window_SkillEquip.setHandler("pagedown", () => {
            $gameParty.makeMenuActorNext();
            this.Window_SkillEquip._actor = this._actor;
            this.Window_SkillEquipHelp._actor = this._actor;
            this.Window_SkillEquipData._actor = this._actor;
            this.Window_SkillEquipSelect._actor = this._actor;
            this.Window_SkillEquip.refresh();
            this.Window_SkillEquip.activate();
            this.Window_SkillEquipHelp.refresh();
            this.Window_SkillEquipData.refresh();
            this.Window_SkillEquipSelect.refresh();
            this.doPChange = true;
        });
        this.Window_SkillEquip.setHandler("pageup", () => {
            $gameParty.makeMenuActorPrevious();
            this.Window_SkillEquip._actor = this._actor;
            this.Window_SkillEquipHelp._actor = this._actor;
            this.Window_SkillEquipData._actor = this._actor;
            this.Window_SkillEquipSelect._actor = this._actor;
            this.Window_SkillEquip.refresh();
            this.Window_SkillEquip.activate();
            this.Window_SkillEquipHelp.refresh();
            this.Window_SkillEquipData.refresh();
            this.Window_SkillEquipSelect.refresh();
            this.doPChange = true;
        });
    }

    setupPortrait() {
        this.portrait = new Sprite(ImageManager.loadPicture($dataActors[$gameParty._menuActorId].meta.portrait));
        const _newChild = this.children.pop();
        this.addChild(this.portrait);
        this.children.push(_newChild);
        this.portrait.y = 32;
    }

    update() {
        super.update();
        this._actor.update();
        this.Window_SkillEquipData.refresh();
        this.portrait.x = Graphics.boxWidth - this.portrait.width;
        if (this.doPChange) {
            // this.removeChild(this.portrait);
            this.portrait.bitmap = ImageManager.loadPicture($dataActors[$gameParty._menuActorId].meta.portrait)
            this.doPChange = false;
        }
        this.skData = $dataSkills[parseInt(this.Window_SkillEquipSelect.commandName(this.Window_SkillEquipSelect._index).split("::").pop())];
        this.Window_SkillEquipHelp.updateData(this.skData);
    }
}

Game_BattlerBase = class extends Game_BattlerBase {
    paramPlus(paramId) {
        return super.paramPlus(paramId) + this._otherBoosts[paramId];
    }
}