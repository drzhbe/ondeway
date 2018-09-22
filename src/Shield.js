/*
	To show Shield these conditions should be satisfied:
		readyTime < game.time.now
		ready
		!room.isBroken()
		room.isPowered()
*/
function Shield(game, ship) {
	Phaser.Group.call(this, game, undefined, 'Shield');
	// this.x = this.w/2;
	// this.y = this.h/2;
	// this.width = this.w*1.5;
	// this.height = this.h*1.5;
	this.x = Room.prototype.size/2;
	this.y = Room.prototype.size/2;
	this.w = toDip(Room.prototype.size/2);
	this.h = toDip(Room.prototype.size/2);

	this.reloadable = true;
	this.ready = false;
	this.readyTime = 0;
	this.originalCooldown = 5000;
	this.cooldown = this.originalCooldown;

	this.sprite = this.create(0, 0, 'shield');
	this.sprite.width = this.w;
	this.sprite.height = this.h;
	this.sprite.anchor.setTo(0.5, 0.5);
	this.add(this.sprite);


	// Shield field around the ship
	var shieldFieldTexture = game.make.graphics()
		.beginFill(0x0077ff)
		.drawEllipse(0, 0, 200, 250)
		.endFill()
		.generateTexture();
	this.shieldField = new Phaser.Sprite(game, -50, -50, shieldFieldTexture);
	this.shieldField.alpha = 0.2;

	// Prepare crop to show and hide field
	this.cropShieldField = new Phaser.Rectangle(0,0,400,0);
	this.shieldFieldShowTween = game.add.tween(this.cropShieldField).to(
		{height: 500},
		1000,
		Phaser.Easing.Linear.None
	);
	this.shieldFieldHideTween = game.add.tween(this.cropShieldField).to(
		{height: 0},
		1000,
		Phaser.Easing.Linear.None
	);
	this.shieldField.crop(this.cropShieldField);

	ship.installShield(this.shieldField);
	
}
Shield.prototype = Object.create(Phaser.Group.prototype);
Shield.prototype.constructor = Shield;

Shield.prototype.update = function() {
	this.shieldField.updateCrop();
};

Shield.prototype.absorb = function() {
	var room = getRoom(this);
	if (room && !room.isPowered()) return false;
	if (!this.ready) return false;

	this.setReady(false);	
	return true;
};

Shield.prototype.setReady = function(ready) {
	if (ready) {
		this.ready = true;
		game.app.sounds.enableShield.play();
		this.shieldFieldShowTween.start();
	} else {
		this.ready = false;
		this.readyTime = game.time.now + this.cooldown;
		this.shieldFieldHideTween.start();
		game.app.sounds.disableShield.play();
	}
};
