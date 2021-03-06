function Sounds() {
	var _self = this,
		buffers = new Object(),
		media = [
			{name: 'wall_collide', url: 'src/media/pong1.mp3'},
			{name: 'brick_collide', url: 'src/media/pong2.mp3'}
		];

	// Load sound
	function load(name, url) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function() {
			_self.context.decodeAudioData(xhr.response, function(buffer) {
				buffers[name] = buffer;
			}, function(err) {
				_self.supported = false;
			});
		};

		xhr.send();
	}
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	_self.context = window.AudioContext && new (window.AudioContext);
	_self.supported = !!_self.context;
	
	if (_self.supported) {
		for (var i=0; i < media.length; i++)
			load(media[i].name, media[i].url);
	}

	// Play sound
	_self.play = function(name) {
		if (_self.supported) {
			audioSource = _self.context.createBufferSource();
			audioSource.buffer = buffers[name];
			audioSource.connect(_self.context.destination);
			audioSource.start(0);
		}
	}
}
