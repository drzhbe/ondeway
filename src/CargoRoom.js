function CargoRoom(game, x, y, ship) {
	Room.call(this, game, x, y, ship, 'CargoRoom', 0);

	this.entity = new Cargo(game, this.w/2, this.h/2, this.w*1.5, this.h*1.5, ship);
	// Room will handle sprite`s input, so disable its own input
	this.entity.sprite.inputEnabled = false;
	this.addAt(this.entity, 1);
};
CargoRoom.prototype = Object.create(Room.prototype);
CargoRoom.prototype.constructor = CargoRoom;
