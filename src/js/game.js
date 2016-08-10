function Game() {

	var CANVAS		= _get('#game-canvas'),
		gameW		= _get('#container').getBoundingClientRect().width,
		gameH		= _get('#container').getBoundingClientRect().height,
		gameSize	= gameW > gameH ? gameW = gameH : gameH = gameW,
		pi = Math.PI,
		colors = {
			red			: ['hsl(0, 100%, 15%)',			'hsl(0, 100%, 30%)',		'hsl(0, 100%, 50%)'		],
			yellow		: [/*'hsl(51, 100%, 15%)',*/	'hsl(51, 100%, 30%)',		'hsl(51, 100%, 50%)'	],
			green		: [/*'hsl(120, 100%, 10%)',		'hsl(120, 100%, 15%)',*/	'hsl(120, 100%, 25%)'	],
			dark_red	: ['hsl(0, 100%, 10%)',			'hsl(0, 100%, 20%)',		'hsl(0, 100%, 35%)'		],
			dark_yellow : [/*'hsl(47, 100%, 10%)',*/	'hsl(47, 100%, 20%)',		'hsl(47, 100%, 35%)'	],
			dark_green	: [/*'hsl(120, 100%, 5%)',		'hsl(120, 100%, 10%)',*/	'hsl(120, 100%, 15%)'	],
		},
		game_ns = this;
		//game, bricks, pad, ball, cursors, pointer;


	/**
	 * Brick(s) stuff
	 */
	function createBrick(x, y, w, h, color, health) {

		var borderW = w/15;
		var bmd = game.add.bitmapData(w, h);
		
		bmd.ctx.fillStyle = colors[color][health-1];
		bmd.ctx.lineWidth = borderW;
		bmd.ctx.strokeStyle = colors['dark_' + color][health-1];

		bmd.ctx.fillRect(0, 0, w, h);
		bmd.ctx.strokeRect(borderW/2+0.5, borderW/2+0.5, w-borderW-0.5, h-borderW-0.5);
		
		var obj = game.add.sprite(x, y, bmd);
		obj.bmd = bmd;
		obj.color = color;
		obj.health = health;
		
		game.physics.arcade.enable(obj);
		obj.anchor.setTo(0, 0);
		obj.body.immovable = true;
		obj.body.bounce.set(1);
		
		return obj;

	}
	
	function spawnBricks(group, rows, columns, height) {
		var width = gameW/columns,
			height = height/100*gameH,
			color = 'red',
			health = 3,
			b;

		for (var i=0; i < rows; i++) {
			for (var j=0; j < columns; j++) {
				if (i > 1) { color = 'yellow'; health = 2; }
				if (i > 4) { color = 'green'; health = 1; }
				b = createBrick(j*width, i*height, width, height, color, health);
				group.add(b);
			}
		}
	}
	
	function updateBrick(ball, brick) {
	
		var l = brick.health,
		    c = brick.color,
		    x = brick.x,
		    y = brick.y,
		    w = brick.width,
		    h = brick.height,
		    g = brick.parent,
		    b;
		
		brick.destroy();
		brick.bmd.destroy();
		
		if (--l) {
			b = createBrick(x, y, w, h, c, l);
			g.add(b);
		}
	
	}


	/**
	 * Pad stuff
	 */
	function createPad(r, h, speed) {

		var bmd = game.add.bitmapData(2*r, h);

		bmd.ctx.fillStyle = 'white';
		bmd.ctx.fillRect(0, 0, 2*r, h);

		var obj = game.add.sprite(gameW/2, gameH, bmd);
		
		obj.r = r;
		obj.setSpeed = speed;
		
		game.physics.arcade.enable(obj);
		obj.anchor.setTo(0.5, 1);
		obj.body.immovable = true;
		obj.body.bounce.set(1);
		obj.body.collideWorldBounds = true;
		
		return obj;

	}
	
	function updatePad(ball, pad) {
	
		var dx   = ball.x - pad.x;
			teta = pi/2 - dx*(pi/3)/pad.r;
		
		ball.body.velocity.x = Math.cos(teta) * ball.body.speed;
		ball.body.velocity.y = -Math.sin(teta) * ball.body.speed;
	
	}

	
	/**
	 * Ball stuff
	 */
	function createBall(x, y, r, speed) {
	
		var bmd = game.add.bitmapData(2*r, 2*r);
	
		bmd.ctx.fillStyle = 'lightgrey';
		bmd.ctx.beginPath();
		bmd.ctx.arc(r, r, r, 0, pi*2);
		bmd.ctx.closePath();
		bmd.ctx.fill();
		
		var obj = game.add.sprite(x, y, bmd);
		
		var teta = Math.random()*4*pi/6 + pi/6;
		
		game.physics.arcade.enable(obj);
		obj.anchor.setTo(0.5, 0.5);
		obj.body.setCircle(r);
		obj.body.bounce.set(1);
		obj.body.collideWorldBounds = true;
		obj.body.velocity.x = speed*Math.cos(teta);
		obj.body.velocity.y = -speed*Math.sin(teta);
		
		return obj;
	
	}


	/**
	 * Other stuff
	 */

	function handleResize() {
	
		gameW		= _get('#container').getBoundingClientRect().width;
		gameH		= _get('#container').getBoundingClientRect().height;
		gameSize	= gameW > gameH ? gameW = gameH : gameH = gameW;
		
		game.scale.setGameSize(gameSize, gameSize);
	
	}
	
	function init() {
		
		cursors = game.input.keyboard.createCursorKeys();
		pointer = game.input.pointer1;
		
		game.physics.startSystem(Phaser.Physics.ARCADE);
		
		bricks = game.add.group();
		spawnBricks(bricks, 10, 10, 5);
	
		pad = createPad(7e-2*gameW, 1e-2*gameH, 0.65*gameH-10);
		ball = createBall(gameW/2, gameH-(1e-2*gameH+1.5e-2*gameW), 1.5e-2*gameW, 0.65*gameH);
		
	}
	
	function update() {
	
	    game.physics.arcade.collide(ball, bricks, updateBrick);
	    game.physics.arcade.collide(ball, pad, updatePad);

    	pad.body.velocity.x = 0;

		if (cursors.left.isDown || (pointer.isDown && pointer.x < gameW/2))
			pad.body.velocity.x = -pad.setSpeed;

		else if (cursors.right.isDown || (pointer.isDown && pointer.x >= gameW/2))
			pad.body.velocity.x = pad.setSpeed;

	}

	var game = this.phaser = new Phaser.Game(gameSize, gameSize, Phaser.AUTO, 'container', {create: init, update: update}, true);
	
	//window.addEventListener("resize", handleResize);

}
