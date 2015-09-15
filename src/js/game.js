Object.defineProperties(Number.prototype, {
	between: {
		value: function(a, b) {
			if (this >= a && this <= b) return true;
			return false;
		}
	},
	
	outside: {
		value: function(a, b) {
			if (this <= a || this >= b) return true;
			return false;
		}
	}
});

Object.defineProperties(Math, {
	atanP : {
		value: function(m) {
			return (m < 0 ? this.PI : 0) + this.atan(m);
		}
	}
});

Object.defineProperties(CanvasRenderingContext2D.prototype, {
	fastLine: {
		value: function(x1, y1, x2, y2, color, width) {
			this.beginPath();
			if (color) this.strokeStyle = color;
			if (width) this.lineWidth = width;
			this.moveTo(x1, y1);
			this.lineTo(x2, y2);
			this.closePath();
			this.stroke();
		}
	}
});

function _get(q) {
	if (q[0] === '*') return document.querySelectorAll(q.substr(1)); 
	else return document.querySelector(q);
}

function Game() {
	var CANVAS		= _get('#game-canvas'),
		gameW		= _get('#container').getBoundingClientRect().width,
		gameH		= _get('#container').getBoundingClientRect().height,
		bricks		= new Array,
		pi			= Math.PI,
		colors = {
			red			: ['hsl(0, 100%, 15%)',			'hsl(0, 100%, 30%)',		'hsl(0, 100%, 50%)'		],
			yellow		: [/*'hsl(51, 100%, 15%)',*/	'hsl(51, 100%, 30%)',		'hsl(51, 100%, 50%)'	],
			green		: [/*'hsl(120, 100%, 10%)',		'hsl(120, 100%, 15%)',*/	'hsl(120, 100%, 25%)'	],
			dark_red	: ['hsl(0, 100%, 10%)',			'hsl(0, 100%, 20%)',		'hsl(0, 100%, 35%)'		],
			dark_yellow : [/*'hsl(47, 100%, 10%)',*/	'hsl(47, 100%, 20%)',		'hsl(47, 100%, 35%)'	],
			dark_green	: [/*'hsl(120, 100%, 5%)',		'hsl(120, 100%, 10%)',*/	'hsl(120, 100%, 15%)'	],
		},
		animationID, pad, c;
	
	function Brick(x, y, w, h, color, health) {	
		var borderW = w/15,
			x2 = x+w,
			y2 = y+h;
			
			
		this.dead = false;
		this.newTeta = 0;
		
		this.draw = function() {
			c.fillStyle = colors[color][health-1];
			c.lineWidth = borderW;
			c.strokeStyle = colors['dark_' + color][health-1];
			
			c.fillRect(x, y, w, h);
			c.strokeRect(x+borderW/2, y+borderW/2, w-borderW, h-borderW);
			
			// DEBUG 
			// Ball hitbox on the brick (to be done with only 1 brick)
			var dX, dY, R = 1.5/100*gameW;
			for (var i=x-R; i<x2+R; i++) {
				for (var j=y-R; j<y2+R; j++) {
					dX = Math.abs(i - x - w/2) - w/2;
					dY = Math.abs(j - y - h/2) - h/2;
					
					dX = dX >= 0 ? dX : 0;
					dY = dY >= 0 ? dY : 0;
					
					if (dX*dX + dY*dY <= R*R && (dX || dY)) { 
						if (dX && dY) c.fillStyle = 'rgba(0, 0, 0, 1)';
						else c.fillStyle = 'rgba(0, 0, 0, 0.5)';
						c.fillRect(i, j, 1, 1);
					}					
				}
			} 
		}
		
		this.collision = function(ballX, ballY, ballR, ballTeta) {
			
			/*
			 * This function returns true if the ball hits the brick, false otherwise.
			 * It also decreases the brick's health until 0, when the brick dies.
			 *
			 * this.newTeta: new angle of the ball after the collision
			 * dX: distance from the center of the ball and the nearest vertical border
			 * dY: distance from the center of the ball and the nearest horizontal border
			 * vX: x of the nearest vertex
			 * vY: y of the nearest vertex
			 *
			 */
			
			var dX = Math.abs(ballX - x - w/2) - w/2,
				dY = Math.abs(ballY - y - h/2) - h/2,
				R2 = ballR*ballR,
				vX, vY, dX2, dY2;
				
			dX2 = (dX < 0) ? 0 : dX*dX;
			dY2 = (dY < 0) ? 0 : dY*dY;
			
			// If collision
			if (dX2 + dY2 <= R2) {				
				// Check collision for vertical borders, horizontal borders and vertexes
				if (!dY2) this.newTeta = ballTeta <= pi ? pi - ballTeta : 3*pi - ballTeta;
				else if (!dX2) this.newTeta =  2*pi - ballTeta;		
				else {
					// Find which vertex is involved
					vX = Math.abs(x-ballX) < Math.abs(x2-ballX) ? x : x2;
					vY = Math.abs(y-ballY) < Math.abs(y2-ballY) ? y : y2;
					
					// To do: this still generates negative angles
					this.newTeta = 2*Math.atanP((vY-ballY)/(vX-ballX)) - ballTeta - pi;
				}
				
				if (--health === 0) this.dead = true;
				return true;
			} else return false;
		}
	}
	
	function Pad() {
		var r = 7e-2*gameW,
			h = 1e-2*gameH,
			x = gameW/2,
			y = gameH-h;
	
		function draw() {
			c.fillStyle = 'white';
			c.fillRect(x-r, y, 2*r, h);
		}

		this.speed = 1.5e-2*gameH;
		this.direction = false;
		this.newTeta = 0;
		
		this.collision = function(ballX, ballY, ballR, ballTeta) {
			var dX = ballX - x;
			
			if (Math.abs(dX) <= r && ballY+ballR >= y && ballTeta.between(pi, 2*pi)) {
				this.newTeta = pi/2 - dX*(pi/3)/r;
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
		var r = 1.5e-2*gameW,
			x = gameW/2,
			y = gameH - gameH/100*5,
			teta = Math.random()*4*pi/6 + pi/6;

		this.speed = 1e-2*gameH;
			
		function draw() {
			c.fillStyle = 'lightgrey';
			c.beginPath();
			c.arc(x, y, r, 0, pi*2);
			c.closePath();
			c.fill();
			
			/* DEBUG
			c.fastLine(x, 0, x, gameH, 'lightgrey', 2);
			c.fastLine(0, y, gameW, y, 'lightgrey', 2);*/
			c.fillText('## DEBUG MODE ##', 50, gameH - 200);
			c.fillText('θ = ' + (teta/pi*180).toFixed(3) + '°', 50, gameH - 180);
			c.fillText('m = ' + Math.tan(teta).toFixed(3), 50, gameH - 170);
			c.fastLine(x, y, x + 1000*Math.cos(-teta), y + 1000*Math.sin(-teta), 'pink', 2);
		}
			
		this.update = function() {
			// Walls
			if (x+r >= gameW || x-r <= 0) teta = teta <= pi ? pi - teta : 3*pi - teta;	// Right and left walls
			if (y-r <= 0) teta = 2*pi - teta;											// Top wall
			if (pad.collision(x, y, r, teta)) teta = pad.newTeta;						// Pad
			
			// Bricks
			for (var i=0, b; b = bricks[i]; i++) if (b.collision(x, y, r, teta)) {
				teta = b.newTeta;
				if (b.dead) bricks.splice(i--, 1);
			}
			
			x += this.speed*Math.cos(teta);
			y -= this.speed*Math.sin(teta);
			
			draw();
		}

		draw();
	}
	
	function spawnBricks(rows, columns, height) {
		var width = gameW/columns,
			height = height/100*gameH,
			color = 'red',
			health = 3,
			b;
		
		/*
		for (var i=0; i < rows; i++) {
			for (var j=0; j < columns; j++) {
				if (i > 1) { color = 'yellow'; health = 2; }
				if (i > 4) { color = 'green'; health = 1; }
				b = new Brick(j*width, i*height, width, height, color, health);
				b.draw();
				bricks.push(b);
			}
		}
		*/
		
		// DEBUG
		// Spawn only one red brick
		b = new Brick(4*width, 7*height, width, height, 'red', 3);
		b.draw();
		bricks.push(b);
	}
	
	function update() {
		c.clearRect(0, 0, gameW, gameH);
		
		pad.update();
		ball.update();
		for (var i=0, b; b = bricks[i]; i++) b.draw();
		
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