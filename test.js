var game = new Phaser.Game(1400, 800, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
	game.load.image('player', 'assets/player/player_pumpgun_stand.png');
	game.load.image('playerRunning', 'assets/player/player_run_strip6.png', 64, 64);
	game.load.image('crosshair', 'assets/crosshairs/blue_ball.png');
	game.load.image('bullet', 'assets/bullet2.png');
	game.load.spritesheet('zombie', 'assets/enemies/zombiebasic.png', 95, 80, 15);
}

var cursors;
var player;
var ammoCount = 30;
var fireRate = 100;
var bullets;
var ammoCountText;
var zombieAmmount = 6;
var zombie;
var weapon;
var prevFireTime = 0;
var inventoryGraphics;
var inventoryText;
var zombies = [];

class Zombie {
	constructor(game, x, y) {
		this.zombie = game.add.sprite(x, y, 'zombie');
		game.physics.arcade.enable(this.zombie);
	}

	setChaseAfter(sprite) {
		this._chaseAfter = sprite;
	}

	startUpdating(){
        var self = this;
        setInterval(function(){
            self.update();
        }, 20);
    }

	setOtherZombie(otherZombie) {
		this.someOtherZombie = otherZombie;
		console.log("zombie set");
	}

	gotHit() {
		this.zombie.kill();
		console.log("hit");
	}

	handleBulletCollision() {
		game.physics.arcade.overlap(weapon.bullets, this.zombie, this.gotHit, null, this);
	}

	handleZombieCollision(firstZombie, secondZombie) {
		game.physics.arcade.collide(firstZombie, secondZombie, zombiesCollided, null, this);
	}

	update() {
		var self = this;

        let player = this._chaseAfter;
        let zombie = this.zombie;
        
        game.physics.arcade.moveToXY(zombie, player.x, player.y, 100);

        //zombie.rotation = Phaser.Math.angleBetween(zombie.x, zombie.y, player.x, player.y);

        //game.physics.arcade.collide(this.zombie, this.zombie);

    	this.handleBulletCollision();
	}
}

function create() {
	game.world.setBounds(0, 0, 800*4, 800);

	player = game.add.sprite(370, 290, 'player');
	player.enableBody = true;
	game.physics.arcade.enable(player);
	player.body.collideWorldBounds = true;
	player.anchor.set(0.5);

	crosshair = game.add.sprite(player.x + 200, player.y, 'crosshair');
	crosshair.scale.setTo(0.2, 0.2);

	cursors = game.input.keyboard.createCursorKeys();

	game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1);

	weapon = game.add.weapon(30, 'bullet');
	weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
	weapon.bulletSpeed = 400;
	weapon.fireRate = 60;
	weapon.trackSprite(player, 0, 0, true);
	weapon.multiFire = true

    ammoCountText = game.add.text(16, 16, "Ammo: " + ammoCount, { fontSize: '16px', fill: '#ff0044' });
    ammoCountText.fixedToCamera = true;

    game.input.onDown.add(changePlayerTexture, this);

    player.animations.add('run', [0, 1, 2, 3, 4, 5], 10, true);

    createEnemies();

    drawInventory();

}

function changePlayerTexture() {
	player.loadTexture('playerRunning', 0);

	player.animations.play('run');
}

function handleCrosshair() {
	crosshair.x = game.input.x;
	crosshair.y = game.input.y;

	let distX = crosshair.x - player.x;
	let distY = crosshair.y - player.y;

	if (distX > 250)
              crosshair.x = player.x+250;
          else if (distX < -250)
              crosshair.x = player.x-250;

          if (distY > 250)
              crosshair.y = player.y+250;
          else if (distY < -250)
              crosshair.y = player.y-250;

    player.rotation = Phaser.Math.angleBetween(player.x, player.y, crosshair.x, crosshair.y);
}

function createEnemies() {
	let otherZombies = [];
	for(let i = 0; i < zombieAmmount; i++) {
		zombies[i] = new Zombie(game, 600 + Math.random() * 600, 100 + Math.random() * 600);
		zombies[i].setChaseAfter(player);
		zombies[i].startUpdating();

		/*for(let j = 0; j < zombieAmmount; j++) {
			if(i === j) {
				continue;
			}
			zombies[i].setOtherZombie(zombies[j]);
			console.log(zombies[i] + "")
		}*/
	}
} 

function drawInventory() {
	let inventoryGraphicsArray = [];
	for(let i = 0; i < 5; i++) {
		inventoryGraphicsArray[i] = game.add.graphics(100 + i * 45, 400);
	    inventoryGraphicsArray[i].fixedToCamera = true;
	    inventoryGraphicsArray[i].beginFill(0xaab3c1);
	    inventoryGraphicsArray[i].drawRect(20, 350, 40, 40);
	}
}
 
function update() {
	//console.log("weapon.bullets = "+ weapon.bullets.toString());


	handleCrosshair();

	if(game.input.activePointer.isDown && prevFireTime + 60 <= game.time.now && ammoCount > 0) {
		ammoCount--;
		prevFireTime = game.time.now;
		weapon.fire();
		ammoCountText.setText("Ammo: " + ammoCount);
	}

	
	player.body.velocity.x = 0;
	player.body.velocity.y = 0;
	if(cursors.up.isDown) {
		player.body.velocity.y = -200;
	}  if(cursors.down.isDown) {
		player.body.velocity.y = 200;
	}  if(cursors.right.isDown) {
		player.body.velocity.x = 200;
	}  if(cursors.left.isDown) {
		player.body.velocity.x = -200;
	} 

	
	
}