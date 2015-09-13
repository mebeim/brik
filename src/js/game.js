function _get(q) {
	if (q[0] === '*') return document.querySelectorAll(q.substr(1)); 
	else return document.querySelector(q);
}

function Brik() {
	var CANVAS = _get('#game-canvas'),
		c = window.c = CANVAS.getContext('2d'),
		gameW = window.gameW = CANVAS.width,
		gameH = window.gameH = CANVAS.height;
		
	
	function spawnBricks(rows, columns, height) {
		var width = parseInt(gameW/columns),
			height = parseInt(height/100*gameH);
			
		function randomColor() {
			return '#'+Math.floor(Math.random()*16777215).toString(16);
		}
		
		for (var i=0; i < rows; i++) {
			for (var j=0; j < columns; j++) {
				c.fillStyle = randomColor();
				c.fillRect(j*width, i*height, width, height);
			}
		}
	}
	
	spawnBricks(10, 10, 5);
}

var game = new Brik();