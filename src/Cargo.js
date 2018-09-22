function Cargo(game, x, y, w, h, ship) {
	Phaser.Group.call(this, game, undefined, 'Cargo');

	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;

	this.isOpen = false;

	this.sprite = this.create(0, 0, 'cargo-atlas');
	this.sprite.width = this.w;
	this.sprite.height = this.h;
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.inputEnabled = true;
	this.sprite.events.onInputDown.add(this.downHandler, this);

	this.openTweenX = game.add.tween(this.sprite).to(
		{x: dip(game.width)/2},
		350,
		Phaser.Easing.Quadratic.InOut
	);
	this.openTweenScale = game.add.tween(this.sprite.scale).to(
		{x: 2, y: 2},
		350,
		Phaser.Easing.Quadratic.InOut
	);
	this.openTweenX.onStart.add(function() { this.openTweenScale.start(); }, this);
	this.openTweenX.onComplete.add(function() { this.sprite.frameName = 'openedCargo'; }, this);

	this.closeTweenX = game.add.tween(this.sprite).to(
		{x: 0},
		350,
		Phaser.Easing.Quadratic.InOut
	);
	this.closeTweenScale = game.add.tween(this.sprite.scale).to(
		{x: 0.8, y: 0.8},
		350,
		Phaser.Easing.Quadratic.InOut
	);
	this.closeTweenX.onStart.add(function() {
		this.sprite.frameName = 'cargo';
		this.closeTweenScale.start();
	}, this);
}
Cargo.prototype = Object.create(Phaser.Group.prototype);
Cargo.prototype.constructor = Cargo;

Cargo.prototype.open = function(first_argument) {
	this.isOpen = true;
	this.sprite.inputEnabled = true;
	this.openTweenX.start();
};

Cargo.prototype.close = function() {
	this.isOpen = false;
	this.sprite.inputEnabled = false;
	this.closeTweenX.start();
};

Cargo.prototype.downHandler = function() {
	if (this.isOpen) {
		this.close();
	} else {
		this.open();
	}
};
