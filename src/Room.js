/*
	Room of the ship. Contains some entity (i.e. Wheel, Blaster, Rocket, Shield)
	@param {object} game
	@param {number} gridX
	@param {number} gridY
	@param {Ship} ship – where the room is placed
	@param {string} name
	@param {number} energyCapacity – maximum energy the room can consume
	@param {string} shortcut – keyboard shortcut of the room.
					Should be key from Phaser.KeyCode hash
*/
function Room(game, gridX, gridY, ship, name, energyCapacity, shortcut) {
	Phaser.Group.call(this, game, undefined, name || 'Room');

	this.roomName = name;
	this.isPlayer = ship.isPlayer;
	this.shortcut = shortcut;
	// 2 is for OKAY, 1 is for DAMAGED, 0 is for BROKEN
	this.status = 2;
	this.repairCooldown = 2500;
	this.repairReadyTime = 0;
	this.repairing = false;

	this.gridX = gridX;
	this.gridY = gridY;
	this.x = (gridX-1) * this.size;
	this.y = (gridY-1) * this.size;

	// Entity of room (i.e. Wheel, Weapon)
	this.entity = undefined;
	// Instance of human
	this.man = undefined;

	this.g = game.make.graphics();
	this.deactivate();

	this.g.inputEnabled = true;
	this.g.events.onInputOver.add(this.overHandler, this);
	this.g.events.onInputOut.add(this.outHandler, this);
	this.g.events.onInputDown.add(this.downHandler, this);

	this.repairIndicator = game.make.graphics();
	this.entityCooldownIndicator = game.make.graphics();

	if (this.shortcut && this.isPlayer) {
		var t = this.shortcut;
		switch (this.shortcut) {
			case 'ONE': t = 1; break;
			case 'TWO': t = 2; break;
			case 'THREE': t = 3; break;
			case 'FOUR': t = 4; break;
			case 'FIVE': t = 5; break;
			case 'SIX': t = 6; break;
			case 'SEVEN': t = 7; break;
			case 'EIGHT': t = 8; break;
			case 'NINE': t = 9; break;
			case 'ZERO': t = 0; break;
			default: t = this.shortcut;
		}
		// this.shortcutText = game.add.text(
		// 	8,
		// 	this.size-24,
		// 	t,
		// 	{font: '18px Arial', fill: '#606060'}
		// );

		this.shortcutSprite = new Phaser.Sprite(game, 8, this.size-24, 'shortcut'+t);
		this.shortcutSprite.scale.setTo(toDip(0.5), toDip(0.5));

		// Handle keyboard room activation if shortcut exists
		game.input.keyboard.addKey(Phaser.KeyCode[shortcut]).onDown.add(function() {
			this.entity.downHandler();
		}, this)
	}

	// TODO mark and remove mark
	if (!this.isPlayer) {
		this.targetedMark = new Phaser.Sprite(game, 5, this.size - 34, 'target-atlas');
		this.targetedMark.scale.setTo(toDip(0.4));
		// targeted by 1 (blaster) or 2 (rocket)
		this.targeted1 = false;
		this.targeted2 = false;
		this.targetedMark.visible = false;
	}

	this.add(this.g);
	this.add(this.repairIndicator);
	this.add(this.entityCooldownIndicator);
	if (energyCapacity) {
		this.energyBar = new EnergyBar(game, this.size - 10, 0, 10, this.size, energyCapacity);
		this.add(this.energyBar);
	}
	if (this.shortcutSprite) {
		this.add(this.shortcutSprite);
	}
	if (this.targetedMark) {
		this.add(this.targetedMark);
	}

	game.onResume.add(function() {
		if (this.entity && this.entity.hasOwnProperty('cooldown') && !this.isReady(game.time.now - game.time.pauseDuration)) {
			this.entity.readyTime += game.time.pauseDuration;
		}
		if (this.repairing) {
			this.repairReadyTime += game.time.pauseDuration;
		}
	}, this)
}
Room.prototype = Object.create(Phaser.Group.prototype);
Room.prototype.constructor = Room;
Room.prototype.size = 100;

Room.prototype.update = function() {
	if (this.man) {
		if (this.status !== 2 && !this.repairing) {
			this.repairing = true;
			this.repairReadyTime = game.time.now + this.repairCooldown;
		}
		if (this.repairing) {
			if (this.repairReadyTime > game.time.now) {
				this.drawRepairIndicator();
			} else {
				this.repairing = false;
				this.repair();
				this.repairIndicator.clear();
			}
		}
	}

	// Make entity ready or not ready
	if (this.entity && this.entity.reloadable) {
		if (this.isEnabled() && !this.entity.ready) {
			if (this.isReady()) {
				this.entityCooldownIndicator.clear();
				this.entity.setReady(true);
			} else {
				this.drawEntityCooldownIndicator();
			}
		} else if (!this.isEnabled()) {
			this.entityCooldownIndicator.clear();
			if (this.entity.ready) {
				this.entity.setReady(false);
			}
		}
	}

	Phaser.Group.prototype.update.call(this);
};

// Mark enemy's room as target to next attack
Room.prototype.toggleMark = function(weaponNumber) {
	// Mark only enemy ship
	if (this.isPlayer) return;

	var target = 'targeted' + weaponNumber;
	this[target] = !this[target];

	// Handle delayed shot marks (targeted)
	if (this.targeted1 && this.targeted2) {
		this.targetedMark.frameName = 'target12';
	} else if (this.targeted1) {
		this.targetedMark.frameName = 'target1';
	} else if (this.targeted2) {
		this.targetedMark.frameName = 'target2';
	}
	this.targetedMark.visible = this.targeted1 || this.targeted2;
};

Room.prototype.manEnter = function(man) {
	this.man = man;
};

Room.prototype.manLeft = function() {
	this.repairing = false;
	this.man = undefined;
	this.repairIndicator.clear();
};

Room.prototype.drawRepairIndicator = function() {
	var msLeft = this.repairReadyTime - game.time.now;
	var percent = 1 - (msLeft / this.repairCooldown);
	var w = game.math.clamp(this.size * percent, 0, this.size);
	this.repairIndicator.clear();
	this.repairIndicator.beginFill(0x000000);
	this.repairIndicator.drawRect(0, this.size - 5, w, 5);
	this.repairIndicator.endFill();
};

Room.prototype.drawEntityCooldownIndicator = function() {
	var msLeft = this.entity.readyTime - game.time.now;
	var percent = 1 - (msLeft / this.entity.cooldown);
	var w = game.math.clamp(this.size * percent, 0, this.size);
	this.entityCooldownIndicator.clear();
	this.entityCooldownIndicator.beginFill(0x000000);
	this.entityCooldownIndicator.drawRect(0, 0, w, 5);
	this.entityCooldownIndicator.endFill();
};

Room.prototype.draw = function(fillColor) {
	// strokeColor = strokeColor !== undefined ? strokeColor : 0x333333;
	fillColor = fillColor !== undefined ? fillColor : 0xdddddd;
	// strokeWidth = strokeWidth !== undefined ? strokeWidth : 2;
	this.g.clear();
	this.g.lineStyle(2, 0x333333, 1);
	this.g.beginFill(fillColor);
	this.g.drawRect(0, 0, this.size, this.size);
	this.g.endFill();
};


Room.prototype.activate = function() {
	this.draw(0xffffff);
};

Room.prototype.deactivate = function() {
	this.draw(0xdddddd);
};

Room.prototype.highlight = function() {
	this.draw(0xeeeeee);
};


Room.prototype.overHandler = function() {
	// Bring to top Z-index to correctly draw increased borders
	this.parent.bringToTop(this);
	if (!this.entity || !this.entity.active) {
		this.highlight();
	}

	if (this.entity) {
		this.entity.scale.setTo(1.1, 1.1);
		if (this.entity.overHandler) {
			this.entity.overHandler();
		}
	}
};

Room.prototype.outHandler = function() {
	if (!this.entity || !this.entity.active) {
		this.deactivate();
	}

	if (this.entity) {
		this.entity.scale.setTo(1, 1);
		if (this.entity.outHandler) {
			this.entity.outHandler();
		}
	}
};

Room.prototype.downHandler = function() {
	if (game.app.activeHuman) {
		game.app.activeHuman.moveTo(this);
		return;
	}

	// Highlight clicked room on player`s ship
	if (this.isPlayer && game.app.ship.health > 0) {
		if (this.isPowered() && this.entity && this.entity.downHandler) {
			this.entity.downHandler();
			if (!this.entity.active) {
				this.highlight();
			}
		}
	}

	// Hit the room
	if (!this.isPlayer && game.app.activeWeapon) {
		game.app.activeWeapon.shoot(this);
	}
};


Room.prototype.takeDamage = function() {
	if (this.status > 0) {
		this.status--;
		this.updateView();

		if (this.entity.hasOwnProperty('cooldown')) {
			this.slowDownReloadTime(this.status);
		}
	}
};

Room.prototype.repair = function() {
	if (this.status < 2) {
		// Room is repaired if before repairing it was broken
		var repaired = this.status === 0;
		this.status++;
		this.updateView();

		if (this.entity.hasOwnProperty('cooldown')) {
			this.speedUpReloadTime(this.status);
		}

		if (repaired) {
			this.repaired();
		}
	}
};


Room.prototype.slowDownReloadTime = function(status) {
	if (status === 0) {
		this.entityCooldownIndicator.clear();

		if (this.entity.broken) {
			this.entity.broken();
		}
	}

	// Increase reloading time if it is reloading right now
	var msLeft = this.entity.readyTime - game.time.now;
	if (msLeft > 0) {
		this.entity.readyTime += msLeft / 2;
	}
	this.entity.cooldown *= 2;
};

Room.prototype.speedUpReloadTime = function(status) {
	var msLeft = this.entity.readyTime - game.time.now;
	this.entity.readyTime -= msLeft / 2;
	this.entity.cooldown /= 2;
};


Room.prototype.updateView = function() {
	switch (this.status) {
		case 2:
			this.entity.sprite.tint = 0xffffff;
			break;
		case 1:
			this.entity.sprite.tint = 0xee9900;
			break;
		case 0:
			this.entity.sprite.tint = 0xff0000;
			break;
	}
};

Room.prototype.isBroken = function() {
	return this.status === 0;
};

Room.prototype.isPowered = function() {
	return this.energyBar
		? this.energyBar.activeCount === this.energyBar.capacity
		: true;
};

Room.prototype.isEnabled = function() {
	return !this.isBroken() && this.isPowered();
};

/*
	@param {number} time – usable to check with `game.time.now - pause.duration`
*/
Room.prototype.isReady = function(time) {
	return (time || game.time.now) > this.entity.readyTime;
};

Room.prototype.powered = function() {
	if (this.isEnabled()) {
		this.enabled();
	}
};

Room.prototype.unpowered = function() {
	
};

Room.prototype.repaired = function() {
	if (this.isEnabled()) {
		this.enabled();
	}
};

Room.prototype.broken = function() {
	// body...
};

Room.prototype.enabled = function() {
	// restart cooldown
	if (this.entity && this.entity.reloadable) {
		this.entity.readyTime = game.time.now + this.entity.cooldown;
	}
};

Room.prototype.disabled = function(first_argument) {
	// body...
};
