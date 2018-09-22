function WeaponRoom(game, gridX, gridY, ship, weaponType, energyCapacity, key) {
	Room.call(this, game, gridX, gridY, ship, 'WeaponRoom', energyCapacity, key);

	this.entity = new Weapon(game, weaponType, ship.isPlayer);
	// Room will handle sprite`s input, so disable its own input
	this.entity.sprite.inputEnabled = false;
	this.addAt(this.entity, 1);
};
WeaponRoom.prototype = Object.create(Room.prototype);
WeaponRoom.prototype.constructor = WeaponRoom;
