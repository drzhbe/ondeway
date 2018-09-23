function Human(game, room) {
	Phaser.Group.call(this, game, undefined, 'Human');

	this.active = false;
	this.moving = false;
	this.room = room;
	this.x = room.x;
	this.y = room.y;

	this.sprite = this.create(5, 5, 'game-atlas', 'human.png');
	this.sprite.width = toDip(30);
	this.sprite.height = toDip(50);
	this.sprite.inputEnabled = true;
	this.sprite.events.onInputDown.add(this.downHandler, this);
}
Human.prototype = Object.create(Phaser.Group.prototype);
Human.prototype.constructor = Human;

Human.prototype.activate = function() {
	if (this.moving) return;

	this.active = true;
	game.app.activeHuman = this;
	this.sprite.tint = 0xff9999;
};

Human.prototype.deactivate = function() {
	this.active = false;
	game.app.activeHuman = undefined;
	this.sprite.tint = 0xffffff;
};

Human.prototype.downHandler = function() {
	if (!this.room.isPlayer) return;

	if (this.active) {
		this.deactivate();
	} else {
		this.activate();
	}
};

Human.prototype.moveTo = function(room) {
	// Escape from the last room
	if (this.room) {
		this.room.manLeft();
	}
	// Get path and walk it
	var ship = getShip(room);
	this.path = ship.findPath(this.room, room);
	this.path.shift(); // pathfinder stores first cell too, so we remove it
	// step value -1 because zeros of grid is walls
	var xs = this.path.map(function(step) { return (step[0]-1) * (Room.prototype.size); });
	var ys = this.path.map(function(step) { return (step[1]-1) * (Room.prototype.size); });
	if (this.tween) {
		this.tween.stop();
	}
	this.moving = true;
	this.tween = game.add.tween(this);
	this.tween.to({x: xs, y: ys}, 500*this.path.length, Phaser.Easing.Linear.None, true);
	this.tween.onComplete.add(function() {
		// Enter new room
		this.moving = false;
		this.room = room;
		room.manEnter(this);
	}, this)

	this.deactivate();
};
