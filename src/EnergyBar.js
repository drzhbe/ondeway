function EnergyBar(game, x, y, w, h, capacity) {
	Phaser.Group.call(this, game, undefined, 'EnergyBar');
	this.capacity = capacity;
	this.activeCount = 0;
	this.x = x;
	this.y = y;

	this.h = h;

	for (var i = 0; i < capacity; i++) {
		this.add(new Energy(game, i, h));
	}
}

EnergyBar.prototype = Object.create(Phaser.Group.prototype);
EnergyBar.prototype.constructor = EnergyBar;

/*
	Example of how it supposed to work:

			   input: - 0 2 3 1 1

	4th energy point: 0 0 0 1 0 0
	3rd energy point: 0 0 1 1 0 0
	2nd energy point: 0 0 1 1 1 0
	1st energy point: 0 1 1 1 1 1

*/
EnergyBar.prototype.energyClicked = function(index, isRightButton) {
	var ship = getShip(this);
	var room = getRoom(this);
	var oldEnergy = this.activeCount;

	if (index + 1 === this.activeCount) {
		this.activeCount--;
		this.children[index].deactivate();
		ship.releaseEnergy(1);
	} else {
		if (index + 1 > this.activeCount) {
			var consumedEnergy = ship.consumeEnergy((index + 1) - this.activeCount);
			if (consumedEnergy === 0) return; // we can show a hint, that we're out of energy
			if (consumedEnergy < (index + 1) - this.activeCount) {
				// Ship doesn't have that much energy as player requested
				index = consumedEnergy - 1;
			}
		} else {
			ship.releaseEnergy(this.activeCount - (index + 1));
		}
		
		this.activeCount = index + 1;
		this.children.forEach(function(energy) {
			if (energy instanceof Energy) {
				if (energy.index <= index) {
					energy.activate();
				} else {
					energy.deactivate();
				}
			}
		});
	}

	if (oldEnergy === this.capacity && this.activeCount < this.capacity) {
		room.unpowered();
	} else if (oldEnergy < this.capacity && this.activeCount === this.capacity) {
		room.powered();
	}
};
