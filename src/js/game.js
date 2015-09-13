function _get(q) {
	if (q[0] === '*') return document.querySelectorAll(q.substr(1)); 
	else return document.querySelector(q);
}

function Brik() {
	var CANVAS = _get('#game-canvas'),
		c = CANVAS.getContext('2d'),
		gameW = CANVAS.width,
		gameH = CANVAS.height;
		
	
	function spawnBricks(rows, columns, height) {
		var width = gameW/columns,
			height = height/100*gameH;
			
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