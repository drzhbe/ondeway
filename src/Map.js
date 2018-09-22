function Map(game) {
	Phaser.Group.call(this, game, game.world, 'Map');

	var stars = new Phaser.Sprite(game, 0, 0, 'stars');
	// stars.scale.setTo(1.1, 1.1);
	stars.width = toDip(game.width);
	stars.height = toDip(game.height);

	// this.x = game.width/2-dip(stars.width)/2;
	// this.y = 150;
	this.x = 0;
	this.y = 0;

	this.add(stars);

	for (var i = 0; i < 5; i++) {
		var planet = new Planet(game, i, (game.width * 0.5 - 200) + (100 * i), dip(stars.height)/2);
		this.add(planet);
	}

	this.hide();
}
Map.prototype = Object.create(Phaser.Group.prototype);
Map.prototype.constructor = Map;

Map.prototype.show = function() {
	this.visible = true;
	this.forEach(function(child) {
		if (child instanceof Planet) {
			child.updateView();
		}
	})
};
Map.prototype.hide = function() {
	this.visible = false;
};


function Planet(game, i, x, y) {
	Phaser.Group.call(this, game, undefined, 'Planet');

	this.x = x;
	this.y = y;
	this.planetNumber = i;

	this.sprite = new Phaser.Sprite(game, 0, 0, 'planet');
	this.sprite.width = toDip(100);
	this.sprite.height = toDip(100);
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.inputEnabled = true;

	this.add(this.sprite);

	this.updateView();

	this.sprite.events.onInputOver.add(this.overHandler, this);
	this.sprite.events.onInputOut.add(this.outHandler, this);
	this.sprite.events.onInputDown.add(this.clickHandler, this);

	var rnd = game.rnd.integerInRange(1,5);
	game.add.tween(this.sprite).to(
		{y: 10},
		300*rnd*this.planetNumber,
		Phaser.Easing.Linear.None,
		true,
		100*rnd*this.planetNumber,
		-1,
		true
	);
}
Planet.prototype = Object.create(Phaser.Group.prototype);
Planet.prototype.constructor = Planet;

Planet.prototype.textStyle = {font: '16px Arial', fill: '#EFD6AC'};

Planet.prototype.updateView = function() {
	this.available = this.planetNumber <= game.app.planetNumber + 1 && this.planetNumber >= game.app.planetNumber - 1;

	if (!this.available) {
		this.sprite.tint = 0x999999;
	} else if (game.app.planetNumber === this.planetNumber) {
		this.sprite.tint = 0xffaa00;

		if (!this.youAreHereIndicator) {
			this.youAreHereIndicator = new Phaser.Sprite(game, -40, -5, 'ship');
			this.youAreHereIndicator.scale.setTo(0, 0);
			this.youAreHereIndicator.anchor.setTo(0.5, 0.5);
			this.add(this.youAreHereIndicator);

			game.add.tween(this.youAreHereIndicator).to(
				{x: 40},
				3000,
				Phaser.Easing.Quadratic.InOut,
				true,
				0,
				-1
			);
			game.add.tween(this.youAreHereIndicator).to(
				{y: 10},
				1500,
				Phaser.Easing.Quadratic.InOut,
				true,
				0,
				-1,
				true
			);
			game.add.tween(this.youAreHereIndicator.scale).to(
				{x: toDip(0.025), y: toDip(0.025)},
				1500,
				Phaser.Easing.Quadratic.InOut,
				true,
				0,
				-1,
				true
			);
		} else {
			this.youAreHereIndicator.visible = true;
		}
	} else {
		if (this.youAreHereIndicator && this.youAreHereIndicator.visible) {
			this.youAreHereIndicator.visible = false;
		}
		if (this.sprite.tint !== 0xffffff) {
			this.sprite.tint = 0xffffff;
		}
	}
};
Planet.prototype.overHandler = function() {
	if (!this.available) return;

	game.add.tween(this.sprite).to(
		{width: toDip(120), height: toDip(120)},
		100,
		Phaser.Easing.Linear.None,
		true
	);
}
Planet.prototype.outHandler = function() {
	if (!this.available) return;

	game.add.tween(this.sprite).to(
		{width: toDip(100), height: toDip(100)},
		100,
		Phaser.Easing.Linear.None,
		true
	);
}
Planet.prototype.clickHandler = function() {
	if (!this.available) return;

	game.app.planetNumber = this.planetNumber;
	game.app.mode = game.app.modes.event;
}
