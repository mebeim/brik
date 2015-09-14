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
		pi = Math.PI,
		animationID, pad, c;
		
	function fastLine(x1, y1, x2, y2, color, width) {
		c.beginPath();
		c.strokeStyle = color;
		c.lineWidth = width;
		c.moveTo(x1, y1);
		c.lineTo(x2, y2);
		c.closePath();
		c.stroke();
	}
	
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
		var r = 7/100*gameW,
			h = 1/100*gameH,
			x = gameW/2,
			y = gameH-h,
			hitbox = false; // hitbox prevents the ball from hitting the pad more than once
	
		function draw() {
			c.fillStyle = 'white';
			c.fillRect(x-r, y, 2*r, h);
			
			// DEBUG
			fastLine(x, y, x, 0, 'white', 2);
		}

		this.direction = false;
		this.speed = 15;
		this.newTeta = 0;
		
		this.collision = function(ballX, ballY, ballR, ballTeta) {
			var dX = ballX - x;

			// DEBUG
			c.fillText('ballTeta = ' + ballTeta/pi*180, 50, gameH - 200); 
			c.fillStyle = 'red';
			c.fillRect(x, y, dX, h);
			fastLine(ballX, ballY, ballX + 1000*Math.cos(-ballTeta), ballY + 1000*Math.sin(-ballTeta), 'pink', 2);
			
			if (!(Math.abs(dX) <= r || ballY+ballR >= y)) hitbox = false;
			
			if (!hitbox && Math.abs(dX) <= r && ballY+ballR >= y) {
				hitbox = true;
				this.newTeta = 2*pi - ballTeta;
				
				// Deviation of the ball 
				if (dX > r/5) this.newTeta -= (this.newTeta-pi/72)*dX/r;
				else if (dX < r/5) this.newTeta -= (pi-this.newTeta-pi/72)*dX/r
				
				return true;
			}
			return false;
		}
		
		this.update = function() {
			if (this.direction === 'left') {
				x -= this.speed;
				
				if (x-r < 0) {
					this.direction = false;
					x = r;
				}
			}
			
			if (this.direction === 'right') {
				x += this.speed;
				
				if (x+r > gameW) {
					this.direction = false;
					x = gameW-r;
				}
			}
			
			draw();
		}
		
		draw();
	}
	
	function Ball() {
		var r = 1.5/100*gameW,
			x = gameW/2,
			y = gameH - gameH/100*5,
			teta = Math.random()*4*pi/6 + pi/6,
			speed = 15;
			
		function draw() {
			c.fillStyle = 'lightgrey';
			c.beginPath();
			c.arc(x, y, r, 0, pi*2);
			c.closePath();
			c.fill();
		}
			
		this.update = function() {
			// Walls
			if (x+r >= gameW) teta = teta <= pi ? pi - teta : 3*pi - teta;	// right
			if (x-r <= 0) teta = teta <= pi ? pi - teta : 3*pi - teta;		// left
			if (y-r <= 0) teta = 2*pi - teta;								// top
			if (pad.collision(x, y, r, teta)) teta = pad.newTeta;			// pad
			
			x += speed*Math.cos(teta);
			y -= speed*Math.sin(teta);
			
			draw();
		}

		draw();
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
		ball.update();
		
		t++;
		animationID = requestAnimationFrame(update);
	}
	
	this.start = function() {
		CANVAS.width = CANVAS.height = gameW > gameH ? gameW = gameH : gameH = gameW;
		c = CANVAS.getContext('2d');
	
		spawnBricks(10, 10, 5);
		pad = new Pad();
		ball = new Ball();
		
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