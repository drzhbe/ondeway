function Energy(game, index, parentHeight) {
	Phaser.Group.call(this, game, undefined, 'Energy');

	this.index = index;

	this.sprite = this.create(0, 0, 'game-atlas', 'energyEmpty.png');

	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.scale.setTo(toDip(0.30), toDip(0.30));
	// Place energy symbols from bottom to top. 5 is padding between them.
	this.sprite.y = parentHeight - dip(this.sprite.height/2) - 5 - this.index * dip(this.sprite.height + 5);
	this.sprite.inputEnabled = true;
	this.sprite.events.onInputDown.add(this.downHandler, this);
	this.sprite.events.onInputOver.add(this.overHandler, this);
	this.sprite.events.onInputOut.add(this.outHandler, this);
	this.deactivate();

	this.active = false;
}
Energy.prototype = Object.create(Phaser.Group.prototype);
Energy.prototype.constructor = Energy;

Energy.prototype.activate = function(silent) {
	this.active = true;
	this.sprite.frameName = 'energy.png';
};

Energy.prototype.deactivate = function(silent) {
	this.active = false;
	this.sprite.frameName = 'energyEmpty.png';
};

Energy.prototype.downHandler = function(sprite, pointer) {
	this.parent.energyClicked(this.index, pointer.rightButton.isDown);
};

Energy.prototype.overHandler = function() {
	this.sprite.scale.setTo(toDip(0.35), toDip(0.35));
};

Energy.prototype.outHandler = function() {
	this.sprite.scale.setTo(toDip(0.30), toDip(0.30));
};
