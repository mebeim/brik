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
		debugLines 	= new Array(),
		animationID, pad, c, Ytreshold;

	function Brick(x, y, w, h, color, health, position) {
		var borderW = w/15,
			x2 = x+w,
			y2 = y+h;


		this.x = x;
		this.y = y;
		this.x2 = x2;
		this.y2 = y2;
		this.dead = false;
		this.tan = 0;

		Object.defineProperties(this, {
			health: {
				get: function() {
					return health;
				},
				set: function(n) {
					health = n;
					if (health==0) this.dead = true;
				}
			}
		});

		this.draw = function() {
			c.fillStyle = colors[color][health-1];
			c.lineWidth = borderW;
			c.strokeStyle = colors['dark_' + color][health-1];

			c.fillRect(x, y, w, h);
			c.strokeRect(x+borderW/2, y+borderW/2, w-borderW, h-borderW);

			/* DEBUG
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
			} */
		}

		this.collision = function(ballX, ballY, ballR, ballTeta) {

			/*
			 * This function returns true if the ball hits the brick, false otherwise.
			 * It also decreases the brick's health until 0, when the brick dies.
			 *
			 * this.tan: angular coefficient of the tangent line against which the ball should reflect
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
				// Fixing bug: move ball outside the brick
				while (dX2 + dY2 < R2) {
					ballX	= (ballX - Math.cos(ballTeta)).limitTo(ballR,gameW-ballR);
					ballY	= (ballY + Math.sin(ballTeta)).limitTo(ballR,gameH-ballR);
					dX		= Math.abs(ballX - x - w/2) - w/2;
					dY		= Math.abs(ballY - y - h/2) - h/2;
					dX2		= (dX < 0) ? 0 : dX*dX;
					dY2		= (dY < 0) ? 0 : dY*dY;
				}

				// Check collision for vertical borders, horizontal borders and vertexes
				if (dY < 0) this.tan = Infinity;
				else if (dX < 0) this.tan =  0;
				else {
					// Find which vertex is involved
					vX = Math.abs(x-ballX) < Math.abs(x2-ballX) ? x : x2;
					vY = Math.abs(y-ballY) < Math.abs(y2-ballY) ? y : y2;

					// Check the siblings before reflecting from the vertex
					var	near_ud = (position.y + (vY==y ? -1 : +1)).between(0,bricks.length-1)				&& bricks[position.y+(vY==y?-1:1)][position.x],
						near_rl = (position.x + (vX==x ? -1 : +1)).between(0,bricks[position.y].length-1)	&& bricks[position.y][position.x+(vX== x?-1:1)],
						color;

					if (near_rl || near_ud) {
						// If there's a sibling brick the ball should be reflected using the border
						this.tan = (near_rl ? 0 : Infinity);
						(near_rl || near_ud).health--;
						//color = (near_rl ? "red" : "blue");	// DEBUG
					} else {
						// Reflect the ball (-(-deltaX/deltaY) because canvases have inverted Y axis)
						this.tan = (vX-ballX)/(vY-ballY);
						//color = "lightgrey";					// DEBUG
					}
					/*var alfa = Math.atan(this.tan);			// DEBUG
					debugLines.push(c.fastLine(vX-10*Math.cos(alfa), vY+10*Math.sin(alfa), vX+10*Math.cos(alfa), vY-10*Math.sin(alfa), color, 2));*/
				}

				this.health--;
				return true;
			} else return false;
		}
	}

	function Pad() {
		var r = 7e-2*gameW,
			h = 1e-2*gameH,
			x = gameW/2,
			y = gameH-h;

		this.height = h;

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

	function Ball(initX, initY, r, speed) {
		var x = initX,
			y = initY,
			teta = Math.random()*4*pi/6 + pi/6;

		this.x = x;
		this.y = y;
		this.teta = teta;
		this.speed = speed;

		function draw() {
			c.fillStyle = 'lightgrey';
			c.beginPath();
			c.arc(x, y, r, 0, pi*2);
			c.closePath();
			c.fill();

			/* DEBUG
			c.fastLine(x, 0, x, gameH, 'lightgrey', 2);
			c.fastLine(0, y, gameW, y, 'lightgrey', 2);
			c.fillText('## DEBUG MODE ##', 50, gameH - 200);
			c.fillText('θ = ' + (teta/pi*180).toFixed(3) + '°', 50, gameH - 180);
			c.fillText('m = ' + Math.tan(teta).toFixed(3), 50, gameH - 170);
			c.fastLine(x, y, x + 1000*Math.cos(-teta), y + 1000*Math.sin(-teta), 'pink', 2);*/
		}

		this.update = function() {
			// Walls
			if (x+r >= gameW || x-r <= 0) teta = Math.reflect(Infinity, teta);		// Right and left walls
			if (y-r <= 0) teta = Math.reflect(0, teta);								// Top wall
			if (pad.collision(x, y, r, teta)) teta = pad.newTeta;					// Pad
			/* DEBUG	if (y+r >= gameH) teta = Math.reflect(0, teta);				// Make pad unnecessary */

			// Bricks
			if (y <= Ytreshold) // start checking for collisions with bricks only when the ball is close to the lowest one
			for (var i=bricks[0].length-1, found=false; i >= 0 && !found; i--) { // loop optimization: start from lower ones (bottom)
				for (var j=bricks.length-1; j >= 0 && !found; j--) {
					if (bricks[i][j] && bricks[i][j].collision(x, y, r, teta)) {
						teta = Math.reflect(bricks[i][j].tan, teta);
						found = true; // loop optimization: don't bother checking the other bricks after collision (found=true → breaks both loops)
					}
				}
			}

			// Canvases have inverted Y axis
			this.y = y = (y - this.speed*Math.sin(teta)).limitTo(r,gameH+r);
			this.x = x = (x + this.speed*Math.cos(teta)).limitTo(r,gameW-r);
			this.teta = teta;

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

		for (var i=0; i < rows; i++) {
			bricks.push(new Array);
			for (var j=0; j < columns; j++) {
				if (i > 1) { color = 'yellow'; health = 2; }
				if (i > 4) { color = 'green'; health = 1; }
				b = new Brick(j*width, i*height, width, height, color, health, {x: j, y: i});
				b.draw();
				bricks[i].push(b);
			}
			if (i == rows-1) Ytreshold = (i+2)*height;
		}

		/* DEBUG
		// Spawn only one red brick
		b = new Brick(4*width, 7*height, width, height, 'red', 3);
		b.draw();
		bricks.push(b); */
	}

	function update() {
		c.clearRect(0, 0, gameW, gameH);

		for (var i=0; i < bricks.length; i++) {
			for (var j=0, b; j < bricks[i].length; j++) {
				if (bricks[i][j]) {
					if (bricks[i][j].dead)
						delete bricks[i][j];
					else
						bricks[i][j].draw();
				}
			}
		}

		pad.update();
		ball.update();

		// for (var i=0; i < debugLines.length; i++) debugLines[i]();		// DEBUG

		animationID = requestAnimationFrame(update);
	}

	this.start = function() {
		CANVAS.width = CANVAS.height = gameW > gameH ? gameW = gameH : gameH = gameW;
		c = CANVAS.getContext('2d');

		spawnBricks(10, 10, 5);
		pad = new Pad();
		ball = new Ball(gameW/2, gameH-(pad.height+1.5e-2*gameW), 1.5e-2*gameW, 1e-2*gameH);	// x, y, radius, speed

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
