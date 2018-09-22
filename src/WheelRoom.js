function WheelRoom(game, gridX, gridY, ship) {
	Room.call(this, game, gridX, gridY, ship, 'WheelRoom', 1);

	this.entity = new Wheel(game);
	// room will handle input
	this.entity.sprite.inputEnabled = false;
	this.addAt(this.entity, 1);
};
WheelRoom.prototype = Object.create(Room.prototype);
WheelRoom.prototype.constructor = WheelRoom;
