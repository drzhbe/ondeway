function ShieldRoom(game, gridX, gridY, ship) {
	Room.call(this, game, gridX, gridY, ship, 'ShieldRoom', 1);

	this.entity = new Shield(game, ship);
	this.addAt(this.entity, 1);
};
ShieldRoom.prototype = Object.create(Room.prototype);
ShieldRoom.prototype.constructor = ShieldRoom;
