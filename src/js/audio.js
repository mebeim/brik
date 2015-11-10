function Sounds() {
	var _self = this,
		buffers = new Object(),
		media = [
			{name: 'wall_collide', url: 'src/media/pong1.ogg'},
			{name: 'brick_collide', url: 'src/media/pong2.ogg'}
		];

	// Load sound
	function load(name, url) {
		var xhr = new XMLHttpRequest();
		console.log(this, this.Sounds);
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function() {
			_self.context.decodeAudioData(xhr.response, function(buffer) {
				buffers[name] = buffer;
			});
		};

		xhr.send();
	}

	_self.context = new (window.AudioContext || window.webkitAudioContext);
	for (var i=0; i < media.length; i++) load(media[i].name, media[i].url);

	// Play sound
	_self.play = function(name) {
		audioSource = _self.context.createBufferSource();
		audioSource.buffer = buffers[name];
		audioSource.connect(_self.context.destination);
		audioSource.start(0);
	}
}
