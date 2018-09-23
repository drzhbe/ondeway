const width = (window.innerWidth || document.documentElement.clientWidth) * window.devicePixelRatio;
const height = (window.innerHeight || document.documentElement.clientHeight) * window.devicePixelRatio;
const game = new Phaser.Game({
  width: dip(width),
  height: dip(height),
  renderer: Phaser.CANVAS,
  // renderer: Phaser.AUTO,
  parent: 'app',
  resolution: window.devicePixelRatio,
  // state: {
  //   preload: preload,
  //   create: create,
  //   update: update,
  //   render: render
  // }
});

game.app = {
  portrait: undefined,
  ship: undefined,
  enemyShip: undefined,
  activeWeapon: undefined,
  activeHuman: undefined,
  modes: {
    ship: {name:'ship'},
    battle: {name:'battle'},
    store: {name:'store'},
    map: {name:'map'},
    event: {name:'event'}, // deciding which event to generate, middle mode
  },
  mode: undefined,
  planetNumber: 0,

  sounds: {
    hit: undefined,
    miss: undefined,
    gameOver: undefined,
    enableShield: undefined,
    disableShield: undefined,
  }
};

game.state.add('boot', bootState(game, {
  bg: '',
  loading: '',
}));
game.state.add('game', gameState(game));
game.state.start('game');

// Go to travel map button
var wheel;
var ui;
var map;
var ships;
var background;
// Graphics object used to debug game
var g;

function highlight(x,y,w,h) {
  g.alpha = 0.5;
  g
    .beginFill(0x000000)
    .moveTo(0,0)
    .lineTo(game.width,0)
    .lineTo(game.width, game.height)
    .lineTo(0, game.height)
    .lineTo(0,y)
    .lineTo(x,y)
    .lineTo(x,y+h)
    .lineTo(x+w,y+h)
    .lineTo(x+w,y)
    .lineTo(0,y)
    .lineTo(0,0)
}


function genereteEvent() {
  // var rnd = game.rnd.integerInRange(1,3);
  // For now, always battle
  var rnd = 2;
  switch (rnd) {
    case 1:
      game.app.mode = game.app.modes.ship;
      break;
    case 2:
      game.app.mode = game.app.modes.battle;
      break;
    case 3:
      game.app.mode = game.app.modes.store;
      break;
  }
}


function addEnemy() {
  game.app.enemyShip = new Ship(game, game.app.planetNumber, (game.width / 10) * 6, dip(game.height) / dip(4), false);
  game.app.enemyShip.blasterRoom.energyBar.energyClicked(0);
  game.app.enemyShip.shieldRoom.energyBar.energyClicked(0);
  game.app.enemyShip.wheelRoom.energyBar.energyClicked(0);
  ships.add(game.app.enemyShip);
}
