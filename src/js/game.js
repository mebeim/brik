Object.defineProperties(Number.prototype, {
	'between': {
		value: function(a, b) {
			if (this >= a && this <= b) return true;
			return false;
		}
	},
	
	'outside': {
		value: function(a, b) {
			if (this <= a || this >= b) return true;
			return false;
		}
	}
});

Object.defineProperties(Math, {
	'atanP' : {
		value: function(m) {
			return (m < 0 ? this.PI : 0) + this.atan(m);
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
		
	function fastLine(x1, y1, x2, y2, color, width) {
		c.beginPath();
		c.strokeStyle = color;
		c.lineWidth = width;
		c.moveTo(x1, y1);
		c.lineTo(x2, y2);
		c.closePath();
		c.stroke();
	}
	
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
		}
		
		this.collision = function(ballX, ballY, R, ballTeta) {
			var dX = Math.abs(ballX - x - w/2) - w/2,
				dY = Math.abs(ballY - y - w/2) - h/2,
				dX2 = dX*dX,
				dY2 = dY*dY,
				R2 = R*R,
				vX, vY;
				
			vX = Math.abs(x-ballX) < Math.abs(x2-ballX) ? x : x2;
			vY = Math.abs(y-ballY) < Math.abs(y2-ballY) ? y : y2;
			fastLine(vX, vY, ballX, ballY, 'black', 2);
			
			if (dX <= R && dY <= R) {
				void(0);
				
				if (dX <= R /*ballX.between(x-ballR, x2+ballR) && ballY.between(y, y2)*/)			// Vertical borders
					this.newTeta = ballTeta <= pi ? pi - ballTeta : 3*pi - ballTeta;
				else if (dY <= R /*ballY.between(y-ballR, y2+ballR) && ballX.between(x, x2)*/)	// Horizontal borders
					this.newTeta =  2*pi - ballTeta;
				else if (dX2 + dY2 <= R2) {															// Vertexes
					// Find which vertex is involved
					
					// Reflect
					this.newTeta = 2*Math.atanP((vY-ballY)/(vX-ballX)) - ballTeta - pi;
				}
				
				if (--health === 0) this.dead = true;
				return true;
			} else return false;
		}
	}
	
	function Pad() {
		var r = 7/100*gameW,
			h = 1/100*gameH,
			x = gameW/2,
			y = gameH-h;
	
		function draw() {
			c.fillStyle = 'white';
			c.fillRect(x-r, y, 2*r, h);
			
			// DEBUG
			fastLine(x, y, x, 0, 'white', 2);
		}
		
		// To do: make speeds relative to canvas size
		this.speed = 15;
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
		var r = 1.5/100*gameW,
			x = gameW/2,
			y = gameH - gameH/100*5,
			teta = Math.random()*4*pi/6 + pi/6;
		
		// To do: make speeds relative to canvas size
		this.speed = 10;
			
		function draw() {
			c.fillStyle = 'lightgrey';
			c.beginPath();
			c.arc(x, y, r, 0, pi*2);
			c.closePath();
			c.fill();
			
			/* DEBUG
			fastLine(x, 0, x, gameH, 'lightgrey', 2);
			fastLine(0, y, gameW, y, 'lightgrey', 2);*/
			c.fillText('ballTeta = ' + teta/pi*180, 50, gameH - 200); 
			fastLine(x, y, x + 1000*Math.cos(-teta), y + 1000*Math.sin(-teta), 'pink', 2);
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
		
		// Only one brick:
		b = new Brick(3*width, 4*height, width, height, 'red', 3);
		b.draw();
		bricks.push(b);
	}
	
	function update() {
		c.clearRect(0, 0, gameW, gameH);
		
		for (var i=0, b; b = bricks[i]; i++) b.draw();
		pad.update();
		ball.update();
		
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