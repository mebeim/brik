function _get(q) {
	if (q[0] === '*') return document.querySelectorAll(q.substr(1)); 
	else return document.querySelector(q);
}

function Game() {
	var CANVAS = _get('#game-canvas'),
		gameW = _get('#container').getBoundingClientRect().width,
		gameH = _get('#container').getBoundingClientRect().height,
		bricks = new Array,
		t = 0,
		animationID, pad, c;
	
	function Brick(x, y, w, h, color, lives) {	
		var borderW = w/15;
		
		var x1 = x, y1 = y,
			x2 = x+w, y2 = y+h;
		
		this.draw = function() {
			c.fillStyle = color;
			c.lineWidth = borderW;
			if (color === 'red') c.strokeStyle = '#B70000';
			if (color === 'gold') c.strokeStyle = '#A28000';
			if (color === 'green') c.strokeStyle = '#004200';
			
			c.fillRect(x, y, w, h);
			c.strokeRect(x1+borderW/2, y1+borderW/2, w-borderW, h-borderW);
		}
		
		this.touched = function() {
			if (--lives === 0) die();
		}
		
		this.die = function() {
			c.clearRect(x, y, w, h);
		}
	}
	
	function Pad() {
		var w = 14/100*gameW,
			h = 1/100*gameH,
			x1 = gameW/2-w/2,
			x2 = gameW/2+w/2,
			y = gameH-h;
			
		this.direction = false;
		this.speed = 10;
		
		this.update = function() {
			if (this.direction === 'left') {
				x1 -= this.speed;
				x2 -= this.speed;
				
				if (x1 < 0) {
					this.direction = false;
					x1 = 0;
					x2= w;
				}
			}
			
			if (this.direction === 'right') {
				x1 += this.speed;
				x2 += this.speed;
				
				if (x2 > gameW) {
					this.direction = false;
					x2 = gameW;
					x1 = x2-w;
				}
			}
			
			c.fillStyle = 'white';
			c.fillRect(x1, y, w, h);
		}
		
		c.fillStyle = 'white';
		c.fillRect(x1, y, w, h);
	}
	
	function spawnBricks(rows, columns, height) {
		var width = gameW/columns,
			height = height/100*gameH,
			color = 'red',
			b;
		
		for (var i=0; i < rows; i++) {
			for (var j=0; j < columns; j++) {
				if (i > 1) color = 'gold';
				if (i > 4) color = 'green';
				b = new Brick(j*width, i*height, width, height, color, 1);
				b.draw();
				bricks.push(b);
			}
		}
	}
	
	function update() {
		c.clearRect(0, 0, gameW, gameH);
		for (var i=0, b; b = bricks[i]; i++) b.draw();
		pad.update();
		
		animationID = requestAnimationFrame(update);
	}
	
	this.start = function() {
		CANVAS.width = CANVAS.height = gameW > gameH ? gameW = gameH : gameH = gameW;
		c = CANVAS.getContext('2d');
	
		spawnBricks(10, 10, 5);
		pad = new Pad();
		
		document.addEventListener('keydown', function(e) {
			if (e.keyCode === 37) pad.direction = 'left';
			if (e.keyCode === 39) pad.direction = 'right';
		});
		
		document.addEventListener('keyup', function(e) {
			if ((e.keyCode === 37 && pad.direction === 'left') || (e.keyCode === 39 && pad.direction === 'right')) pad.direction = false;
		});
		
		animationID = requestAnimationFrame(update);
	}
}

var game = new Game();
game.start();