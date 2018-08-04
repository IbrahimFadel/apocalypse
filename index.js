const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res, next) => {
	res.sendFile(__dirname + '/index.html');
});

app.get('/phaser.js', (req, res, next) => {
	res.sendFile(__dirname + '/phaser.js');
});

app.get('/test.js', (req, res, next) => {
	res.sendFile(__dirname + '/test.js');
});

app.get('/assets/bullet2.png', (req, res, next) => {
	res.sendFile(__dirname + '/assets/bullet2.png');
});

app.get('/assets/enemies/zombiebasic.png', (req, res, next) => {
	res.sendFile(__dirname + '/assets/enemies/zombiebasic.png');
});

app.get('/assets/player/player_pumpgun_stand.png', (req, res, next) => {
	res.sendFile(__dirname + '/assets/player/player_pumpgun_stand.png');
});

app.get('/assets/player/player_run_strip6.png', (req, res, next) => {
	res.sendFile(__dirname + '/assets/player/player_run_strip6.png');
});

app.get('/assets/crosshairs/blue_ball.png', (req, res, next) => {
	res.sendFile(__dirname + '/assets/crosshairs/blue_ball.png');
	console.log("hellooo");
});;

app.listen(PORT, () => {
	console.log("Server listening on port: " + PORT + "");
});