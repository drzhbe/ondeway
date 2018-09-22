function Wheel(game, x, y, w, h) {
	Phaser.Group.call(this, game, undefined, 'Wheel');

	this.x = x || Room.prototype.size/2;
	this.y = y || Room.prototype.size/2;
	this.w = w || toDip(Room.prototype.size/2);
	this.h = h || toDip(Room.prototype.size/2);

	this.strokeCanceled = false;

	this.sprite = new Phaser.Sprite(game, 0, 0, 'wheel');
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.width = this.w;
	this.sprite.height = this.h;
	this.sprite.inputEnabled = true;
	this.sprite.events.onInputOver.add(this.overHandler, this);
	this.sprite.events.onInputOut.add(this.outHandler, this);
	this.sprite.events.onInputDown.add(this.downHandler, this);

	this.g = game.make.graphics();
	this.g.lineStyle(2, 0xff2200, 1);
	this.g.drawCircle(0, 0, 120);
	this.strokeTargetTween = game.add.tween(this.g).to(
		{alpha: 0},
		3000,
		Phaser.Easing.Linear.None,
		true,
		0,
		-1,
		true
	);
	this.strokeTarget(false);

	this.add(this.sprite);
	this.add(this.g);
}
Wheel.prototype = Object.create(Phaser.Group.prototype);
Wheel.prototype.constructor = Wheel;

Wheel.prototype.downHandler = function() {
	if (game.app.mode === game.app.modes.battle && game.app.enemyShip.health > 0) return;

	game.add.tween(this.sprite).to(
		{angle: 180},
		500,
		Phaser.Easing.Linear.None,
		true
	);

	if (game.app.mode === game.app.modes.map) {
		game.app.mode = game.app.modes.ship;
	} else {
		game.app.mode = game.app.modes.map;
	}
};

Wheel.prototype.overHandler = function() {
	if (game.app.mode === game.app.modes.battle && game.app.enemyShip.health > 0) return;

	game.add.tween(this.sprite).to(
		{angle: 45},
		100,
		Phaser.Easing.Linear.None,
		true
	);

	if (this.g.visible) {
		this.strokeTarget(false);
		this.strokeCanceled = true;
	}
};

Wheel.prototype.outHandler = function() {
	if (game.app.mode === game.app.modes.battle && game.app.enemyShip.health > 0) return;

	game.add.tween(this.sprite).to(
		{angle: 0},
		100,
		Phaser.Easing.Linear.None,
		true
	);
};

Wheel.prototype.strokeTarget = function(on) {
	if (on) {
		this.g.visible = true;
		this.strokeTargetTween.resume();
	} else {
		this.g.visible = false;
		this.strokeTargetTween.pause();
	}
};

Wheel.prototype.disable = function() {
	this.sprite.tint = 0x999999;
};

Wheel.prototype.enable = function() {
	this.sprite.tint = 0xffffff;
};
