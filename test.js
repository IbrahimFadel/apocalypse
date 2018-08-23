/*
* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
* Apocalypse Game
* Made with Phaser
* By: Ibrahim Fadel
* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
*/
var game = new Phaser.Game(1400, 800, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
	game.load.image('player', 'assets/player/player_pumpgun_stand.png');
	game.load.spritesheet('playerRunning', 'assets/player/player_run_strip6.png', 80, 85, 6);
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
var walkingTrueFalse = false;
var spawn1 = [600, 105];
var spawn2 = [890, 500];
var spawn3 = [1050, 215];
var zombieSpawnLocations = [spawn1, spawn2, spawn3];

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

    	this.handleBulletCollision();
	}
}

function create() {
	game.world.setBounds(0, 0, 800*4, 800);
	game.stage.backgroundColor = 'rgb(96, 128, 56)';

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

    createEnemies();

    drawInventory();

    drawMap();
}

/** 
* Changes the players texture to 'playerRunning'
* Returns: nothing
* Param: none
*/

function changePlayerTexture() {
	if(walkingTrueFalse === true) {
		player.loadTexture('playerRunning');
	    player.animations.add("run", [0, 1, 2, 3, 4, 5], 10, true);
		player.animations.play("run");
		walkingTrueFalse = true;
	};
}

/**
* Moves crosshair in all direction
* Prevents crosshair from leaving a certain radius
* @return nothing
* @param none
*/

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

/**
* Calulates the distance between two given objects
* @return nothing
* @param first object
* @param second object
*/

function calculateDistanceBetween(object1, object2) {
	let object1X = object1.x;
	let object1Y = object1.y;

	let object2X = object2.x;
	let object2Y = object2.y;

	let diffX = object1.x - object2.x;
	let diffY = object1.y - object2.y;

	let distance = Math.sqrt((diffX * diffX) + (diffY * diffY));
}

/**
* Adds enemies to the game and choses it's spawn location
* @return nothing
* @param none
*/

function createEnemies() {
	let otherZombies = [];
	for(let i = 0; i < zombieAmmount; i++) {
		let rndX;
		let rndY;
		let rndNum = Math.floor(Math.random() * 4);
		if(rndNum === 0) {
			rndX = spawn1[0];
			rndY = spawn1[1];
		} else if(rndNum === 1) {
			rndX = spawn2[0];
			rndY = spawn2[1];
		} else if(rndNum === 2) {
			rndX = spawn3[0];
			rndY = spawn3[1];
		} else {
			rndX = Math.random() * 600;
			rndY = Math.random() * 600;
		}
		zombies[i] = new Zombie(game, rndX, rndY);
		zombies[i].setChaseAfter(player);
		zombies[i].startUpdating();
	}
} 

/**
* Draws the inventory at the bottom left of the game
* @return nothing
* @param none
*/

function drawInventory() {
	let inventoryGraphicsArray = [];
	for(let i = 0; i < 5; i++) {
		inventoryGraphicsArray[i] = game.add.graphics(100 + i * 45, 400);
	    inventoryGraphicsArray[i].fixedToCamera = true;
	    inventoryGraphicsArray[i].beginFill(0xaab3c1);
	    inventoryGraphicsArray[i].drawRect(20, 350, 40, 40);
	}
}

/**
* Draws the first house
* @return nothing
* @param none
*/

function drawHouse1() {
	let wall = game.add.graphics(500, 100);

    wall.beginFill(0x00F0F8FF);
    wall.lineStyle(10, 0x00F0F8FF, 1);

    wall.moveTo(100, 0);
    wall.lineTo(300, 0);
    wall.moveTo(300, 0);
    wall.lineTo(300, 140);
    wall.moveTo(300, 140);
    wall.lineTo(100, 140);
    wall.moveTo(100, 140);
    wall.lineTo(100, 115);
    wall.moveTo(100, 30);
    wall.lineTo(100, 0);

    wall.endFill();
}

/**
* Draws the second house
* @return nothing
* @param none
*/

function drawHouse2() {
	let wall = game.add.graphics(500, 100);

    wall.beginFill(0x00F0F8FF);
    wall.lineStyle(10, 0x00F0F8FF, 1);

	wall.moveTo(340, 400);
    wall.lineTo(540, 400);
    wall.moveTo(540, 400);
    wall.lineTo(540, 540);
    wall.moveTo(540, 540);
    wall.lineTo(340, 540);
    wall.moveTo(340, 540);
    wall.lineTo(340, 520);
    wall.moveTo(340, 440);
    wall.lineTo(340, 400);

    wall.endFill();
}

/**
* Draws the third house
* @return nothing
* @param none
*/

function drawHouse3() {
	let wall = game.add.graphics(500, 100);

    wall.beginFill(0x00F0F8FF);
    wall.lineStyle(10, 0x00F0F8FF, 1);

    wall.moveTo(500, 100);
    wall.lineTo(700, 100);
    wall.moveTo(700, 100);
    wall.lineTo(700, 240);
    wall.moveTo(700, 240);
    wall.lineTo(500, 240);
    wall.moveTo(500, 240);
    wall.lineTo(500, 220);
    wall.moveTo(500, 140);
    wall.lineTo(500, 100);

    wall.endFill();
}

/**
* Calls all drawHouse[i] functions
* @return nothing
* @param none
*/

function drawMap() {
	drawHouse1();
	drawHouse2();
	drawHouse3();
}


/*   Make zombies have 75% chance of spawning in a random house
*  Houses have guns and loot and stuff
*  change player gun to shoot like shotgun
*/  
 
function update() {
	handleCrosshair();

	//game.physics.arcade.collide(player, wall);

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
		if(walkingTrueFalse === false) {
			walkingTrueFalse = true;
			changePlayerTexture();
		}
	} else if(cursors.down.isDown) {
		player.body.velocity.y = 200;
		if(walkingTrueFalse === false) {
			walkingTrueFalse = true;
			changePlayerTexture();
		}
	} else if(cursors.right.isDown) {
		player.body.velocity.x = 200;
		if(walkingTrueFalse === false) {
			walkingTrueFalse = true;
			changePlayerTexture();
		}
	} else if(cursors.left.isDown) {
		player.body.velocity.x = -200;
		if(walkingTrueFalse === false) {
			walkingTrueFalse = true;
			changePlayerTexture();
		}
	} else {
		walkingTrueFalse = false;
		player.loadTexture('player');
	}

	
	
}