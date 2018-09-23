/*
	Ship

	dependencies:
		Room
		Human
*/
function Ship(game, planetNumber, x, y, isPlayer) {
	Phaser.Group.call(this, game, game.world, 'Ship');

	if (isPlayer) {
		window.ship = this;
	}

	this.x = x;
	this.y = y;

	this.planetNumber = planetNumber;
	this.isPlayer = isPlayer;
	this.health = isPlayer ? 10 : game.rnd.integerInRange(3, 8);
	this.fuel = 4;
	this.scrap = isPlayer ? 10 : game.rnd.integerInRange(3, 20);

	this.sprite = new Phaser.Sprite(game, 0, 0, 'game-atlas', isPlayer ? 'ship.png' : 'ship2.png');
	this.sprite.width = toDip(300);
	this.sprite.height = toDip(350);


	this.rooms = new Phaser.Group(game, undefined, 'Rooms');
	// this.rooms.y = 20;
	this.crew = new Phaser.Group(game, undefined, 'Crew');

	this.add(this.sprite);
	this.add(this.rooms);
	this.add(this.crew);
	

	if (this.isPlayer) {
		this.makeGrid1();
	} else {
		this.makeGrid();
	}


	this.shield = this.shieldRoom.entity;
	this.blaster = this.blasterRoom.entity;
	this.rocket = this.rocketRoom.entity;


	this.man = new Human(game, this.emptyRoom1 || this.wheelRoom);
	this.crew.add(this.man);

	this.createText();

	// this.plan = [
	// 	[1,1,1,1,1,],
	// 	[1,1,this.wheelRoom,1,1,],
	// 	[1,this.blasterRoom,this.emptyRoom1,this.rocketRoom,1,],
	// 	[1,this.shieldRoom,1,this.reactorRoom,1,],
	// 	[1,1,1,1,1,],
	// ];

	// this.plan = [
	// 	[this.wheelRoom],
	// 	[this.blasterRoom, this.rocketRoom],
	// 	[this.shieldRoom, this.reactorRoom]
	// ];

	// this.grid = [
	// 	[1,1,1,1,1,1,1,1,1],
	// 	[1,1,1,0,0,0,1,1,1],
	// 	[1,1,1,0,0,0,1,1,1],
	// 	[1,1,1,0,0,0,1,1,1],
	// 	[1,1,1,0,1,0,1,1,1],
	// 	[1,0,0,0,1,0,0,0,1],
	// 	[1,0,0,0,1,0,0,0,1],
	// 	[1,0,0,0,1,0,0,0,1],
	// 	[1,1,0,1,1,1,0,1,1],
	// 	[1,0,0,0,1,0,0,0,1],
	// 	[1,0,0,0,1,0,0,0,1],
	// 	[1,0,0,0,1,0,0,0,1],
	// 	[1,1,1,1,1,1,1,1,1],
	// ];
}
Ship.prototype = Object.create(Phaser.Group.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.findRoomInPlan = function(room) {
	var result;
	for (var y = 0; y < this.plan.length; y++) {
		var floor = this.plan[y];
		for (var x = 0; x < floor.length; x++) {
			if (floor[x] === room) {
				result = {x: x, y: y};
				break;
			}
		}
		if (result) break;
	}
	return result;
};

Ship.prototype.findPath = function(aRoom, bRoom) {
	return this.pathFinder.findPath(aRoom.gridX, aRoom.gridY, bRoom.gridX, bRoom.gridY, this.grid.clone());
};

Ship.prototype.maxHealth = 10;
Ship.prototype.textStyle = {font: '16px Revalia', fill: '#EFD6AC'};
Ship.prototype.defeatTextStyle = {font: '30px Revalia', fill: '#FF0000'};
Ship.prototype.missTextStyle = {font: '30px Revalia', fill: '#FFFFFF'};

Ship.prototype.update = function() {
	// A little bit of AI: enemy should repair his parts when they are broken
	if (!this.isPlayer) {
		var ship = this;
		
		if (ship.man.moving || (ship.man.room && ship.man.room.isBroken())) {
			// Just stay and repair
		} else {
			// Find first broken room and do some work there
			for (var i = 0; i < ship.rooms.length; i++) {
				var room = ship.rooms.getAt(i);
				if (room.isBroken()) {
					ship.man.moveTo(room);
					break;
				}
			}
		}
	}

	// Hide and disable dead ship
	if (this.health <= 0) {
		this.crew.visible = false;
		this.rooms.visible = false;
		this.rooms.forEach(function(room) {
			if (room.entity && room.entity.ready !== undefined) {
				room.entity.readyTime = Infinity;
			}
		});
	}

	Phaser.Group.prototype.update.call(this);
};

Ship.prototype.createText = function() {
	this.healthText = game.add.text(0, -60, '', this.textStyle);
	this.updateHealth(this.health);

	this.fuelText = game.add.text(0, -40, '', this.textStyle);
	this.updateFuel(this.fuel);

	this.scrapText = game.add.text(0, -20, '', this.textStyle);
	this.updateScrap(this.scrap);
 
	this.defeatText = game.add.text(-100, -50, 'DEFEAT', this.defeatTextStyle);
	this.defeatText.anchor.setTo(0.5, 0.5)
	this.defeatText.alpha = 0;
	this.defeatTextTween = game.add.tween(this.defeatText).to({alpha: 1, x: dip(this.sprite.centerX)}, 500, Phaser.Easing.Bounce.Out);

	this.missText = game.add.text(-100, -50, 'MISS', this.missTextStyle);
	this.missText.anchor.setTo(0.5);
	this.missText.alpha = 0;
	this.missTextTween = game.add.tween(this.missText).to({alpha: 1, x: dip(this.sprite.centerX)}, 500, Phaser.Easing.Bounce.Out);
	this.missTextTween.onComplete.add(function() {
		game.add
			.tween(this.missText).to({alpha: 0, x: this.width}, 500, Phaser.Easing.Cubic.In, true, 1000)
			.onComplete.add(function() { this.missText.x = -100;}, this);
	}, this);

	this.add(this.healthText);
	this.add(this.fuelText);
	this.add(this.scrapText);
	this.add(this.defeatText);
	this.add(this.missText);
};

Ship.prototype.showMissText = function() {
	this.missTextTween.start();
};

Ship.prototype.defeat = function() {
	this.defeatTextTween.start();
};

Ship.prototype.updateHealth = function(newHealth) {
	this.health = newHealth;
	this.healthText.text = 'hp: ' + this.health;
};

Ship.prototype.installShield = function(shieldView) {
	// Install shield before rooms to not overlay rooms with shield field.
	var index = this.getIndex(this.rooms);
	this.addAt(shieldView, index);
};

Ship.prototype.absorbWithShield = function() {
	return this.shield ? this.shield.absorb() : false;
};

Ship.prototype.getEvasion = function() {
	return this.wheelRoom && this.wheelRoom.isPowered()
		? this.wheelRoom.status
		: 0;
};

Ship.prototype.evade = function() {
	// this.missTextTween.start();
	this.showMissText();
	game.app.sounds.miss.play();
};

Ship.prototype.takeDamage = function(dmg) {
	// Highlight pain
	this.sprite.tint = 0xff2200;
	game.add.tween(this.sprite)
		.to(
			{x: 10},
			50,
			Phaser.Easing.Back.InOut,
			true,
			0,
			2,
			true
		)
		.onComplete.add(function() {
			this.sprite.tint = 0xffffff;
		}, this);

	this.updateHealth(this.health - dmg);

	game.app.sounds.hit.play();

	if (this.health <= 0) {
		// Handle death, pay scrap, destroy ship
		if (this.isPlayer) {
			this.updateScrap(this.scrap + game.app.ship.scrap);
			game.app.ship.updateScrap(0);
		} else {
			game.app.ship.updateScrap(game.app.ship.scrap + this.scrap);
			this.updateScrap(0);
		}

		this.defeat();

		if (this.isPlayer) {
			game.app.sounds.gameOver.play();
		}
	}
};

Ship.prototype.fly = function() {
	this.updateFuel(this.fuel - 1);
};

Ship.prototype.updateFuel = function(newFuel) {
	this.fuel = newFuel;
	this.fuelText.text = 'fuel: ' + this.fuel;
};

Ship.prototype.updateScrap = function(newScrap) {
	this.scrap = newScrap;
	this.scrapText.text = 'scrap: ' + this.scrap;
};

Ship.prototype.getAvailableEnergy = function() {
	return this.reactorRoom.entity.availableEnergy;
};

/*
	@param {number} amount
	@returns {number} amount of energy consumed. May be less than passed `amount`
					  if we haven't got enough.
*/
Ship.prototype.consumeEnergy = function(amount) {
	// not enought energy available – spend all we have
	if (amount > this.reactorRoom.entity.energy) {
		amount = this.reactorRoom.entity.energy;
		this.reactorRoom.entity.updateAvailableEnergy(0);
		return amount;
	}

	this.reactorRoom.entity.updateAvailableEnergy(this.reactorRoom.entity.energy - amount);
	return amount;
};

Ship.prototype.releaseEnergy = function(amount) {
	this.reactorRoom.entity.updateAvailableEnergy(this.reactorRoom.entity.energy + amount);
};


Ship.prototype.makeGrid = function() {
	var rnd = game.rnd.integerInRange(1,2);
	this['makeGrid'+rnd]();
};

Ship.prototype.makeGrid1 = function() {
	this.grid = new PF.Grid([
		[1,1,1,1,1,],
		[1,1,0,1,1,],
		[1,0,0,0,1,],
		[1,0,1,0,1,],
		[1,1,1,1,1,],
	]);
	this.pathFinder = new PF.AStarFinder();

	// Create rooms after the `rooms group` is added to the ship.
	// Rooms constructors use reference to `rooms group` in the ship.
	this.wheelRoom = new WheelRoom(game, 2, 1, this);
	this.blasterRoom = new WeaponRoom(game, 1, 2, this, 'blaster', 1, 'ONE');
	this.emptyRoom1 = new Room(game, 2, 2, this, 'EmptyRoom');
	this.rocketRoom = new WeaponRoom(game, 3, 2, this, 'rocket', 2, 'TWO');
	this.shieldRoom = new ShieldRoom(game, 1, 3, this);
	this.reactorRoom = new ReactorRoom(game, 3, 3, this, 4);
	// this.cargoRoom = new CargoRoom(game, 150, 250, this);
	this.rooms.add(this.wheelRoom);
	this.rooms.add(this.blasterRoom);
	this.rooms.add(this.emptyRoom1);
	this.rooms.add(this.rocketRoom);
	this.rooms.add(this.shieldRoom);
	// this.rooms.add(this.cargoRoom);
	this.rooms.add(this.reactorRoom);
};

Ship.prototype.makeGrid2 = function() {
	this.grid = new PF.Grid([
		[1,1,1,1,1,],
		[1,0,0,0,1,],
		[1,0,0,0,1,],
		[1,1,1,1,1,],
	]);
	this.pathFinder = new PF.AStarFinder();

	// Create rooms after the `rooms group` is added to the ship.
	// Rooms constructors use reference to `rooms group` in the ship.
	this.blasterRoom = new WeaponRoom(game, 1, 1, this, 'blaster', 1, 'ONE');
	this.wheelRoom = new WheelRoom(game, 2, 1, this);
	this.rocketRoom = new WeaponRoom(game, 3, 1, this, 'rocket', 2, 'TWO');
	this.shieldRoom = new ShieldRoom(game, 1, 2, this);
	this.emptyRoom1 = new Room(game, 2, 2, this, 'EmptyRoom');
	this.reactorRoom = new ReactorRoom(game, 3, 2, this, 4);
	// this.cargoRoom = new CargoRoom(game, 150, 250, this);
	this.rooms.add(this.wheelRoom);
	this.rooms.add(this.blasterRoom);
	this.rooms.add(this.emptyRoom1);
	this.rooms.add(this.rocketRoom);
	this.rooms.add(this.shieldRoom);
	// this.rooms.add(this.cargoRoom);
	this.rooms.add(this.reactorRoom);
};

Ship.prototype.makeGrid3 = function() {
	this.grid = new PF.Grid([
		[1,1,1,1,1,1,1],
		[1,0,0,0,0,0,1],
		[1,1,1,1,1,1,1],
	]);
	this.pathFinder = new PF.AStarFinder();

	// Create rooms after the `rooms group` is added to the ship.
	// Rooms constructors use reference to `rooms group` in the ship.
	this.shieldRoom = new ShieldRoom(game, 1, 1, this);
	this.blasterRoom = new WeaponRoom(game, 2, 1, this, 'blaster', 1, 'ONE');
	this.wheelRoom = new WheelRoom(game, 3, 1, this);
	this.rocketRoom = new WeaponRoom(game, 4, 1, this, 'rocket', 2, 'TWO');
	this.reactorRoom = new ReactorRoom(game, 5, 1, this, 4);
	// this.cargoRoom = new CargoRoom(game, 150, 250, this);
	this.rooms.add(this.wheelRoom);
	this.rooms.add(this.blasterRoom);
	this.rooms.add(this.rocketRoom);
	this.rooms.add(this.shieldRoom);
	// this.rooms.add(this.cargoRoom);
	this.rooms.add(this.reactorRoom);
};

Ship.prototype.makeGrid4 = function() {
	this.grid = new PF.Grid([
		[1,1,1],
		[1,0,1],
		[1,0,1],
		[1,0,1],
		[1,0,1],
		[1,0,1],
		[1,1,1],
	]);
	this.pathFinder = new PF.AStarFinder();

	// Create rooms after the `rooms group` is added to the ship.
	// Rooms constructors use reference to `rooms group` in the ship.
	this.shieldRoom = new ShieldRoom(game, 1, 1, this);
	this.blasterRoom = new WeaponRoom(game, 1, 2, this, 'blaster', 1, 'ONE');
	this.wheelRoom = new WheelRoom(game, 1, 3, this);
	this.rocketRoom = new WeaponRoom(game, 1, 4, this, 'rocket', 2, 'TWO');
	this.reactorRoom = new ReactorRoom(game, 1, 5, this, 4);
	// this.cargoRoom = new CargoRoom(game, 150, 250, this);
	this.rooms.add(this.wheelRoom);
	this.rooms.add(this.blasterRoom);
	this.rooms.add(this.rocketRoom);
	this.rooms.add(this.shieldRoom);
	// this.rooms.add(this.cargoRoom);
	this.rooms.add(this.reactorRoom);
};
