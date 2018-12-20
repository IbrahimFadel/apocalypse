/*
* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
* Apocalypse Game
* Made with Phaser and NodeJs
* By: Ibrahim Fadel
* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
*/
var game = new Phaser.Game(1000, 800, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
	game.load.image('player', 'assets/player/player_pumpgun_stand.png');
	game.load.spritesheet('playerRunning', 'assets/player/player_run_strip6.png', 80, 85, 6);
	game.load.image('crosshair', 'assets/crosshairs/blue_ball.png');
	game.load.image('bullet', 'assets/bullet2.png');
	game.load.spritesheet('zombie', 'assets/enemies/zombiebasic.png', 95, 80, 15);
	game.load.image('crate', 'assets/block.png');
	game.load.image('ar', 'assets/ar.png');
	game.load.image('shotgun', 'assets/shotgun.png');
	game.load.image('bush1', 'assets/bush.png');
	game.load.image('bush2', 'assets/bush2.png');
	game.load.image('knife', 'assets/knife.png');
}

/*>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

var loaded = false;

var content = [
"Apocalypse...",
"Made by Ibrahim Fadel",
"A game made with phaser",
"",
"In this post-apoctaliptic world, you must fight for",
"your life against zombies, and whatever challenges you",
"might face!",
"DANIEL SUCKS"
]

var line = [];
var wordIndex = 0;
var lineIndex = 0;
var wordDelay = 120;
var lineDelay = 400;

/*>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

var cursors;
var player;

var ammoCount;
var fireRate = 100;
var bullets;
var ammoCountText;
var zombieAmmount = 20;
var zombie;
var deadZombies = [];
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
var graphicsSprite;
var weaponReady = true;

var checkpointCleared = false;

var ar;
var gunisAr = false;
let arBulletsFired = 0;
var hasAr = false;

var crates;
var crate;

var oneKey;
var twoKey;

var arAmmo = 300;
var shotgunAmmo = 800;

var knife;

//Ammo type 0 is shotgun, 1 is ar
var ammoType = 0;

var inventorySlots = [
	[120, 760], 
	[163, 755],
	[206, 755]
];

var totalDistance = 0;
var spawnedWave = false;


/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
var healthGraphic;
var healthText;



var bulletsAlive;  //for debugging


if(ammoType === 0) {
	ammoCount = shotgunAmmo;
} else if(ammoType === 1) {
	ammoCount = arAmmo;
}



var playerHealth = 100;

class Zombie {
	constructor(game, x, y, health) {
		this.zombie = game.add.sprite(x, y, 'zombie');
		game.physics.arcade.enable(this.zombie);
		this.health = health;
		health = 100;
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
	}

	//bullet and zombie are backwards... i think...
	gotHit(bullet, zombie) {
		zombie.kill();
		//zombie.destroy();
		deadZombies.push(bullet);
		//console.log(deadZombies);
		bullet.kill()
	}

	withinRange() {
		let distance = calculateDistanceBetween(this.zombie, player);

		if(distance <= 20 && playerHealth > 0 && deadZombies.includes(this.zombie) === false) {
			//console.log(deadZombies.includes(this.zombie));
			playerHealth = playerHealth - 0.5;
			//console.log(playerHealth);
		}
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
    	this.withinRange();
    	//this.handleZombieCollisio(zombie, this.zombie);
	}
}

function create() {

	game.world.setBounds(0, 0, 800*4, 800);
	game.stage.backgroundColor = 'rgb(96, 128, 56)';

	//game.time.gamePaused()

    text = game.add.text(32, 32, '', { font: "35px Arial", fill: "#19de65" });

    //nextLine();

    //game.time.events.add(Phaser.Timer.SECOND * 10, function(){
    	//loaded = true;

    	text.kill();

		console.log("loaded in!");
		oneKey = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
		twoKey = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
		var threeKey = game.input.keyboard.addKey(Phaser.Keyboard.THREE);
		var fourKey = game.input.keyboard.addKey(Phaser.Keyboard.FOUR);

		player = game.add.sprite(370, 290, 'player');
		player.enableBody = true;
		game.physics.arcade.enable(player);
		player.body.collideWorldBounds = true;
		player.anchor.set(0.5);

		crosshair = game.add.sprite(player.x + 200, player.y, 'crosshair');
		crosshair.scale.setTo(0.2, 0.2);

		cursors = game.input.keyboard.createCursorKeys();

		game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1);

		weapon = game.add.weapon(60, 'bullet');
		weapon.bulletLifeSpan = 10;
		//Phaser.Weapon.KILL_DISTANCE = 100;

		//bulletLifespan = 1;
		weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
		weapon.bulletKillDistance = 500;
		weapon.bulletSpeed = 400;
		weapon.fireRate = 60;
		weapon.trackSprite(player, 0, 0, true);
		weapon.multiFire = true;
		weapon.bulletAngleVariance = 10;

	    ammoCountText = game.add.text(16, 16, "Ammo: " + ammoCount, { fontSize: '16px', fill: '#ff0044' });
	    ammoCountText.fixedToCamera = true;

	    graphicsSprite = game.add.sprite(0, 0);

	    crates = game.add.group();

	    crates.enableBody = true;
	    crates.scale.setTo(0.3, 0.3);


	    createEnemies();

	    drawInventory();

	    var shotgun = game.add.sprite(0, 0, 'shotgun');
	    shotgun.scale.setTo(0.05, 0.05);
	    shotgun.fixedToCamera = true;
	    shotgun.cameraOffset.x = inventorySlots[0][0];
	    shotgun.cameraOffset.y = inventorySlots[0][1];

	    for(let i = 0; i < 4; i++) {
	        var bush1 = game.add.sprite(Math.random() * 1020 - i*40 , Math.random() * 500 + 200, 'bush2');
		    bush1.enableBody = true;
		    bush1.scale.setTo(0.05, 0.05);	
	    }

	    healthGraphic = game.add.graphics(100, 100);
	    healthGraphic.fixedToCamera = true;

	    healthText = game.add.text(190, 15, "Health", { fontSize: '16px', fill: '#ff0044' });
	    healthText.fixedToCamera = true;

	    //var knife = game.add.sprite(inventorySlots[2][0], inventorySlots[2],[1], 'knife');
	    //knife = game.add.sprite(0, 0, 'knife');
    //}, this);
}



	//if(loaded === true) {

//}

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

	return distance;
}

function wakeZombie() {
	let distance = calculateDistanceBetween(player, zombies[0]);

	//console.log(distance);
}

/**
* Adds enemies to the game and choses it's spawn location
* @return nothing
* @param none
*/

function createEnemies() {

	let enemySpawned0 = false;
	let enemySpawned1 = false;
	let enemySpawned2 = false;

	for(let i = 0; i < zombieAmmount; i++) {
		let rndX;
		let rndY;
		let rndNum = Math.floor(Math.random() * 4);
	
		if(rndNum === 0 && enemySpawned0 === false) {
			rndX = spawn1[0];
			rndY = spawn1[1];
			enemySpawned0 = true;
		} else if(rndNum === 1 && enemySpawned1 === false) {
			rndX = spawn2[0];
			rndY = spawn2[1];
			enemySpawned1 = true;
		} else if(rndNum === 2 && enemySpawned2 === false) {
			rndX = spawn3[0];
			rndY = spawn3[1];
			enemySpawned2 = true;
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


function readyWeapon() {
	weaponReady = true;
}

function killCrate(player, crate) {
	crate.kill();
	console.log(ammoCount)
	if(ammoType === 0) {
		ammoCount = ammoCount + 8;		
	} else if(ammoType === 1) {
		ammoCount = ammoCount + 30;
	}

	let crateX = crate.body.x;
	let crateY = crate.body.y;
	ar = game.add.sprite(crateX, crateY, 'ar');
	ar.enableBody = true;
	game.physics.arcade.enable(ar);
	//ar.body.velocity.x = 100;
	ar.scale.setTo(0.04, 0.04);
	ar.body.width = 20;
	ar.body.height = 20;
}

function arPickup(player, ar) {
	ar.scale.setTo(0.025, 0.025);
	hasAr = true;
	ar.fixedToCamera = true;
	ar.cameraOffset.x = inventorySlots[1][0];
	ar.cameraOffset.y = inventorySlots[1][1];
	gunSwitchAr()
}

function gunSwitchAr() {
	gunisAr = true;
	weapon.bulletSpeed = 400;
	weapon.fireRate = 60;
	weapon.trackSprite(player, 0, 0, true);
	weapon.multiFire = true;
	weapon.bulletAngleVariance = 0;
	weaponReady = true;
	ammoType = 1;
}

function gunSwitchShotgun() {
	gunisAr = false;
	weapon.bulletSpeed = 400;
	weapon.fireRate = 60;
	weapon.trackSprite(player, 0, 0, true);
	weapon.multiFire = true;
	weapon.bulletAngleVariance = 10;
	ammoType = 0;
}

function drawHealth() {
	healthGraphic.beginFill(0xFFFFFF);

    healthGraphic.clear();
    healthGraphic.endFill();
    healthGraphic.lineStyle(2, 0x0000FF, 1);
    healthGraphic.drawRect( 20, -85, 200, 20);
    healthGraphic.beginFill(0xFFFFFF);
    healthGraphic.drawRect( 20, -85, playerHealth * 2, 20);
}

function nextLine() {
    if (lineIndex === content.length) {
        return;
 	}
    line = content[lineIndex].split(' ');
    wordIndex = 0;
    game.time.events.repeat(wordDelay, line.length, nextWord, this);
    lineIndex++;
}

function nextWord() {
	//if(game.input.keyboard.isDown(Phaser.Keyboard.W).isDown) {
	//	return
	//}
    text.text = text.text.concat(line[wordIndex] + " ");
    wordIndex++;
    if (wordIndex === line.length) {
        text.text = text.text.concat("\n");
        game.time.events.add(lineDelay, nextLine, this);
        loaded = true;
    }
}

function waveSpawned() {
	spawnedWave = false;
}

function createCrates() {
	for(let i = 0; i < Math.random() * 3; i++) {
       crate = crates.create(360 + Math.random() * 2000, 120 + Math.random() * 2000, 'crate');  
       crate.body.width = 0;
   	   crate.body.height = 0;
   	   crate.body.immovable = true;
	}
}
 
function update() {

	console.log(weapon.bullets.countLiving());



	//if(loaded === true) {

	//game.time.events.add(Phaser.Timer.SECOND * 10, function() {
    	handleCrosshair();
		wakeZombie();
		drawHealth();

		oneKey.onDown.add(gunSwitchShotgun, this);

		if(hasAr) {
			twoKey.onDown.add(gunSwitchAr, this);
		}

		if(playerHealth === 0) {
			weaponReady = false;
			player.kill();
			crosshair.kill();
		}

		if(player.body.x >= 1000 && checkpointCleared === false) {
			createEnemies();
			checkpointCleared = true;
		}

		game.physics.arcade.collide(player, crate);

		game.physics.arcade.overlap(weapon.bullets, crates, killCrate, null, this);

		game.physics.arcade.overlap(player, ar, arPickup);

		ammoCountText.setText("Ammo: " + ammoCount);

		//healthText.setText("Health");


		if(gunisAr != true) {
			if(game.input.activePointer.isDown && prevFireTime + 60 <= game.time.now && ammoCount > 0 && weaponReady === true) {
				ammoCount--;
				prevFireTime = game.time.now;
				for(let i = 0; i < 6; i++) {
					weapon.fire();
					weaponReady = false;
				}

				weapon.bullets.lifeSpan = 10;

				game.time.events.add(Phaser.Timer.SECOND * 0.8, readyWeapon, this);

			}
		} else if(game.input.activePointer.isDown && prevFireTime + 60 <= game.time.now && ammoCount > 0 && weaponReady === true && gunisAr === true) {
			ammoCount--;
			prevFireTime = game.time.now;
			weapon.fire();
			arBulletsFired++;
			if(arBulletsFired === 30) {
				weaponReady = false;
				game.time.events.add(Phaser.Timer.SECOND * 0.8, readyWeapon, this);
			}
		}

		
		player.body.velocity.x = 0;
		player.body.velocity.y = 0;
		if(cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W)) {
			player.body.velocity.y = -200;
			if(walkingTrueFalse === false) {
				walkingTrueFalse = true;
				changePlayerTexture();
				
			}

			if(totalDistance % 1000 === 0 && totalDistance > 100) {
					createEnemies();
					createCrates();
			}

			totalDistance++;
		} else if(cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S)) {
			player.body.velocity.y = 200;
			if(walkingTrueFalse === false) {
				walkingTrueFalse = true;
				changePlayerTexture();
			}

			/*if(totalDistance % 1000 === 0) {
					createEnemies();
					createCrates();
			}*/

			totalDistance++;
		} else if(cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D)) {
			player.body.velocity.x = 200;
			if(walkingTrueFalse === false) {
				walkingTrueFalse = true;
				changePlayerTexture();
				
			}

			if(totalDistance % 1000 === 0) {
					createEnemies();
					createCrates();
			}

			totalDistance++;
		} else if(cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A)) {
			player.body.velocity.x = -200;
			if(walkingTrueFalse === false) {
				walkingTrueFalse = true;
				changePlayerTexture();
				
			}

			if(totalDistance % 1000 === 0) {
				createEnemies();
				createCrates();
			}


			totalDistance++;
		} else {
			walkingTrueFalse = false;
			player.loadTexture('player');
		}
   // }, this);
}


		
	
	
	
//}