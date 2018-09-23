function bootState(game, { bg, loading }) {
	return {
    preload: function() {
      game.load.image('preloader_bg', bg);
      game.load.image('preloader_loading', loading);
    },
    create: function(game) {
      game.state.start('init');
    }
  }
}

function mapState(game) {
  return {
    preload: function() {
      
    },
  };
}

function gameState(game) {
  return {
    preload: function() {
      game.load.image('stars', 'img/stars.jpg');
      game.load.image('stars2', 'img/stars5.jpg');

      game.load.atlas('game-atlas', 'img/game-atlas.png', 'img/game-atlas.json');

      game.load.spritesheet('explosion', 'img/explosion_sprt.png', 110, 74);
    
      game.load.audio('hit', 'sound/hit.m4a');
      game.load.audio('miss', 'sound/miss.m4a');
      game.load.audio('enableShield', 'sound/shieldOn.m4a');
      game.load.audio('disableShield', 'sound/shieldOff.m4a');
      game.load.audio('gameOver', 'sound/gameOver.m4a');
    },
    create: function() {
      console.log('game', game)
      // To detect collisions between missiles and rooms and shield
      game.physics.startSystem(Phaser.Physics.ARCADE);
    
      game.input.mouse.capture = true;
      game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
    
      game.app.mode = game.app.modes.ship;
      game.app.portrait = game.height > game.width;
    
      background = game.add.sprite(0, 0, 'stars2');
      background.width = toDip(game.width);
      background.height = toDip(game.height);
    
      g = game.add.graphics();
      window.debugPoint = function(p, color) {
        g.beginFill(color || 0xff0000)
        g.drawCircle(p.x, p.y, 20)
        g.endFill()
      }
      window.debugXY = function(x, y, color) {
        g.beginFill(color || 0xff0000)
        g.drawCircle(x, y, 20)
        g.endFill()
      }
    
      ships = game.add.group(game.world, 'Ships');
      game.app.ship = new Ship(game, game.app.planetNumber, dip(game.width)/10, dip(game.height) / dip(4), true);
      game.app.ship.blasterRoom.energyBar.energyClicked(0);
      game.app.ship.rocketRoom.energyBar.energyClicked(1);
      game.app.ship.shieldRoom.energyBar.energyClicked(0);
      // game.app.ship.wheelRoom.energyBar.energyClicked(0);
      ships.add(game.app.ship);
      map = new Map(game);
    
      ui = game.add.group(game.world, 'Ui');
    
      wheel = new Wheel(game, game.width / 2, 80, toDip(100), toDip(100));
      wheel.strokeTarget(true);
      ui.add(wheel);
    
      game.app.sounds.hit = game.add.audio('hit');
      game.app.sounds.miss = game.add.audio('miss');
      game.app.sounds.gameOver = game.add.audio('gameOver');
      game.app.sounds.enableShield = game.add.audio('enableShield');
      game.app.sounds.disableShield = game.add.audio('disableShield');
    
      if (game.app.portrait) {
        ships.scale.setTo(0.5, 0.5);
        ui.scale.setTo(0.5, 0.5);
      }
    
      game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
      game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(function() {
        game.paused = !game.paused;
        pauseText.visible = game.paused;
        if (game.paused) {
          pauseStartTime = game.time.now;
        } else {
          game.app.pauseTime = pauseStartTime - game.time.now;
        }
      });
    
      var pauseText = game.add.text(game.world.centerX, 100, 'PAUSE\npress space to continue', {font: '16px Revalia', fill: '#EFD6AC'});
      pauseText.anchor.setTo(0.5, 0.5);
      pauseText.visible = false;
    
    
      game.world.bringToTop(g);
    
      g.alpha = 0.5;
      // g
      // 	.beginFill(0x000000)
      // 	.moveTo(10,10)
      // 	.lineTo(game.width-10,10)
      // 	.lineTo(game.width-10,game.height-10)
      // 	.lineTo(10,game.height-10)
      // 	.moveTo(20,20)
      // 	.lineTo(game.width-20,20)
      // 	.lineTo(game.width-20,game.height-20)
      // 	.lineTo(20,game.height-20)
      // g
      // 	.beginFill(0x000000)
      // 	.moveTo(20,20)
      // 	.lineTo(200,20)
      // 	.lineTo(200,200)
      // 	.lineTo(20,200)
      // 	.arc(100,100,100,0,Math.PI)
      // 	.lineTo(100,150)
      // 	.lineTo(150,150)
    
      var mask = game.add.graphics();
      mask.alpha = 0;
      mask.beginFill(0x000000)
      mask.drawCircle(100,100,100);
      mask.endFill()
    
      // var size = dip(wheel.width) * 1.5;
      // highlight(
      // 	wheel.x - size / 2,
      // 	wheel.y - size / 2,
      // 	size,
      // 	size)
    
      window.mask = mask;
    },
    update: function() {
      if (game.app.mode === game.app.modes.map && !map.visible) {
        map.show();
      } else if (game.app.mode !== game.app.modes.map && map.visible) {
        map.hide();
      }
    
      if (game.app.mode === game.app.modes.event) {
        if (game.app.ship.fuel <= 0) {
          game.app.ship.defeatText.visible = true;
          return;
        }
        game.app.ship.fly();
        genereteEvent();
        if (game.app.mode === game.app.modes.battle) {
          wheel.strokeCanceled = false;
        }
      }
    
      if (game.app.mode === game.app.modes.battle) {
        if (!game.app.enemyShip) {
          wheel.disable();
    
          addEnemy();
        } else {
          if (game.app.enemyShip.planetNumber !== game.app.planetNumber) {
            wheel.disable();
    
            game.app.enemyShip.destroy();
            addEnemy();
          } else if (game.app.enemyShip.health <= 0) {
            wheel.enable();
          }
        }
    
        if (game.app.enemyShip) {
          if (game.app.enemyShip.health > 0) {
            // Enemy tries to attack player
            if (game.app.enemyShip.blasterRoom.isEnabled() &&
              game.app.enemyShip.blasterRoom.isReady() &&
              game.app.ship.health > 0)
            {
              game.app.enemyShip.blaster.shoot(game.app.ship.blasterRoom);
            }
          } else {
            if (!wheel.strokeCanceled) {
              wheel.strokeTarget(true);
            }
          }
        }
      }
    },
  };
}
