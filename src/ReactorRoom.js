function ReactorRoom(game, gridX, gridY, ship, capacity) {
	Room.call(this, game, gridX, gridY, ship, 'ReactorRoom', 0);

	this.entity = new Reactor(game, this.w/2, this.h/2, this.w*1.5, this.h*1.5, ship, capacity);
	// Room will handle sprite`s input, so disable its own input
	// this.entity.sprite.inputEnabled = false;
	this.addAt(this.entity, 1);
};
ReactorRoom.prototype = Object.create(Room.prototype);
ReactorRoom.prototype.constructor = ReactorRoom;
