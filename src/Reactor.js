function Reactor(game, x, y, w, h, ship, capacity) {
	Phaser.Group.call(this, game, undefined, 'Reactor');

	this.maxCapacity = 10;
	this.capacity = capacity;
	this.energy = capacity;

	this.x = Room.prototype.size/2;
	this.y = Room.prototype.size/2;
	this.w = toDip(Room.prototype.size/2);
	this.h = toDip(Room.prototype.size/2);

	this.sprite = this.create(0, 0, 'game-atlas', 'reactor0.png');
	this.sprite.width = this.w;
	this.sprite.height = this.h;
	this.sprite.anchor.setTo(0.5, 0.5);
	this.updateAvailableEnergy(this.energy);
	// this.sprite.inputEnabled = true;
	// this.sprite.events.onInputDown.add(this.downHandler, this);
}
Reactor.prototype = Object.create(Phaser.Group.prototype);
Reactor.prototype.constructor = Reactor;

/*
	@param {number} energy
*/
Reactor.prototype.updateAvailableEnergy = function(energy) {
	this.energy = Math.min(energy, this.maxCapacity);
	this.sprite.frameName = `reactor${energy}.png`;
};
