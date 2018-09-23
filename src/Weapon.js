function Weapon(game, weaponType, isPlayer) {
	Phaser.Group.call(this, game, game.world, 'Weapon');
	this.x = Room.prototype.size/2;
	this.y = Room.prototype.size/2;
	this.w = toDip(Room.prototype.size/2);
	this.h = toDip(Room.prototype.size/2);

	this.weaponType = weaponType;
	this.weaponName = weaponType;
	this.shortcut = weaponType === 'blaster' ? 1 : 2;
	// 500 pixels per second
	this.speed = weaponType === 'blaster' ? 1000/1000 : 1000/500;
	this.isPlayer = isPlayer;
	switch (this.weaponType) {
		case 'blaster':
			this.damage = 1;
			this.originalCooldown = 5000;
			break;
		case 'rocket':
			this.damage = 2;
			this.originalCooldown = 10000;
			break;
	}
	this.reloadable = true;
	// This cooldown will be modified by WeaponRoom status. 
	// It can be increased if room is damaged
	// or decreased if room is upgraded or manned.
	this.cooldown = this.originalCooldown;
	this.ready = false;
	this.readyTime = 0;
	// Player clicked weapon to use it
	this.active = false;
	// If weapon isn't ready player can delay shoot, so here is shooting target
	this.targetRoom = undefined;
	// Bullet is released and flying to this room
	this.bulletIsGoingToRoom = undefined;

	this.sprite = new Phaser.Sprite(game, 0, 0, 'game-atlas', `${this.weaponName}.png`);
	this.sprite.width = this.w;
	this.sprite.height = this.h;
	this.sprite.anchor.setTo(0.5, 0.5);
	// This input can be disabled by room – owner of this weapon
	this.sprite.inputEnabled = true;
	this.sprite.events.onInputDown.add(this.downHandler, this);


	this.bulletExplosion = game.add.sprite(0, 0, 'explosion');
	this.bulletExplosion.anchor.setTo(0.5, 0.5);
	this.bulletExplosion.width = toDip(this.bulletExplosion.width/2)
	this.bulletExplosion.height = toDip(this.bulletExplosion.height/2)
	this.bulletExplosion.animations
		.add('explosion')
		.onComplete.add(function() {
			this.bulletExplosion.visible = false;
		}, this);
	this.bulletExplosion.visible = false;


	// Add to the global coords
	var bulletType = weaponType === 'rocket' ? 'rocket' : 'laser-bullet';
	this.bullet = game.add.sprite(this.x, this.y, 'game-atlas', `${bulletType}.png`);
	this.bullet.anchor.setTo(0.5, 0.5);
	if (weaponType === 'rocket') {
		this.bullet.width = this.w;
		this.bullet.height = this.h;
	} else {
		this.bullet.width = toDip(this.bullet.width/2);
		this.bullet.height = toDip(this.bullet.height/2);
	}
	// this.bullet.visible = false;
	this.bullet.sendToBack();
	// game.app

	// this.nameText = game.add.text(
	// 	0,
	// 	50,
	// 	this.weaponName,
	// 	this.firstTextStyle
	// );

	// this.damageText = game.add.text(
	// 	0,
	// 	50 + 20,
	// 	'dmg: ' + this.damage,
	// 	this.secondaryTextStyle
	// );

	// this.cooldownText = game.add.text(
	// 	0,
	// 	50 + 40,
	// 	'cd: ' + this.cooldown,
	// 	this.secondaryTextStyle
	// );

	this.add(this.sprite);
	// this.add(this.nameText);
	// this.add(this.damageText);
	// this.add(this.cooldownText);
}
Weapon.prototype = Object.create(Phaser.Group.prototype);
Weapon.prototype.customRender = true;
Weapon.prototype.constructor = Weapon;

Weapon.prototype.update = function() {
	// Shoot on ready or if enemy is dead remove target
	if (this.ready && this.targetRoom) {
		var ship = getShip(this.targetRoom);
		if (!ship || ship.health <= 0) {
			this.targetRoom = undefined;
		} else {
			this._shoot(this.targetRoom);
		}
	}
	// if (this.bullet.visible && this.bulletIsGoingToRoom) {
	// 	if (this.bullet.body.hitTest(this.bulletIsGoingToRoom.world)) {
	// 		this.bulletHitsTarget();
	// 	}
		// game.physics.arcade.overlap(this.bullet, this.bulletIsGoingToRoom, bulletHitsTarget, null, this);
	// }

	// if (this.active) {
	// 	this.bullet.rotation = Math.PI/2 + game.physics.arcade.angleToXY(this.bullet, game.input.x, game.input.y, true);
	// }

	if (this.bulletIsGoingToRoom === undefined) {
		if (this.bullet.worldPosition.x !== this.worldPosition.x &&
			this.bullet.worldPosition.y !== this.worldPosition.y)
		{
			this.bullet.position.setTo(this.worldPosition.x, this.worldPosition.y);
		}
	}
};

Weapon.prototype.bulletHitsTarget = function() {
	this.bulletExplosion.position.setTo(this.bullet.x, this.bullet.y)
	this.bulletExplosion.visible = true;
	this.bulletExplosion.play('explosion', 20);
};

Weapon.prototype.setReady = function(ready) {
	if (ready) {
		this.ready = true;
	} else {
		this.ready = false;
		this.readyTime = game.time.now + this.cooldown;
	}
};

Weapon.prototype.activate = function() {
	this.active = true;
	game.app.activeWeapon = this;

	var room = getRoom(this);
	if (room) {
		room.activate();
	}

	
};

Weapon.prototype.deactivate = function() {
	this.active = false;
	if (game.app.activeWeapon === this) {
		game.app.activeWeapon = undefined;
	}

	var room = getRoom(this);
	if (room) {
		room.deactivate();
	}
};

Weapon.prototype.shoot = function(room) {
	// Remove targeted mark from previous room
	if (this.targetRoom) {
		this.targetRoom.toggleMark(this.shortcut);
	}
	this.targetRoom = room;
	this.targetRoom.toggleMark(this.shortcut);
	this.deactivate();
};

Weapon.prototype._shoot = function(room) {
	this.setReady(false);

	if (!room) return;

	var ship = getShip(room);
	if (!ship) return;

	var hit = game.rnd.integerInRange(1,6) > ship.getEvasion();

	this.bullet.bringToTop();
	this.bulletIsGoingToRoom = this.targetRoom;

	// Set to default position
	this.bullet.position.setTo(this.worldPosition.x, this.worldPosition.y);
	// Because rotation is facing right side (not top) we add 90 degrees (Pi/2) always
	this.bullet.rotation =
		Math.PI/2
		+ game.physics.arcade.angleToXY(
			this.bullet,
			this.bulletIsGoingToRoom.worldPosition.x,
			this.bulletIsGoingToRoom.worldPosition.y,
			true);

	var toX = this.bulletIsGoingToRoom.worldPosition.x + this.bulletIsGoingToRoom.size / 2;
	var toY = this.bulletIsGoingToRoom.worldPosition.y + this.bulletIsGoingToRoom.size / 2;

	var bulletTween = game.add.tween(this.bullet);
	bulletTween.onComplete.add(function() {
		if (hit) {
			this.bulletHitsTarget();

			if (!ship.absorbWithShield()) {
				ship.takeDamage(this.damage);
				room.takeDamage();
			}
		} else {
			ship.evade();
		}

		this.bullet.sendToBack();
		this.bulletIsGoingToRoom = undefined;
		this.bullet.position.setTo(this.worldPosition.x, this.worldPosition.y);
	}, this);

	var dist = game.math.distance(this.worldPosition.x, this.worldPosition.y, toX, toY);
	var time = dist * this.speed;

	if (hit) {
		// if shield – to center of ship and collide with shield
		bulletTween.to({x: toX, y: toY}, time, Phaser.Easing.Linear.None, true);
	} else {
		var isLeft = ship.x > game.world.width/2;
		var isBottom = toY > this.worldPosition.y;
		var offsetX = isLeft ? 200 : -200;
		var offsetY = isBottom ? 200 : -200;
		bulletTween.to({x: toX+offsetX, y: toY+offsetY}, time, Phaser.Easing.Linear.None, true);
	}
};

Weapon.prototype.broken = function() {
	// Remove delayed shot and target marker from enemy's ship when weapon is broken
	// if (this.targetRoom) {
	// 	this.targetRoom.toggleMark(this.shortcut);
	// 	this.targetRoom = undefined;
	// }
};

Weapon.prototype.downHandler = function() {
	if (!this.isPlayer) return;

	var room = getRoom(this);
	if (this.active) {
		this.deactivate();
	} else if (room.isBroken()) {
		console.log('To use weapons you should repair the WeaponRoom');
	} else {
		// If another weapon was active – deactivate it
		if (game.app.activeWeapon && game.app.activeWeapon !== this) {
			game.app.activeWeapon.deactivate();
		}
		this.activate();
	}
}


