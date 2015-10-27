function Audio() {
	var self = this,
		sounds = new Object();
		
	// Load sound
	function loadSound(name, url) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function() {
			self.context.decodeAudioData(xhr.response, function(buffer) {
				sounds[name] = buffer;
			});
		}
		
		xhr.send();
	}
	
	// Play sound
	self.playSound = function(name) {
		var source = self.context.createBufferSource();
		source.buffer = sounds[name];
		source.connect(self.context.destination);
		source.start(0);
	}
	
	self.context = new (window.AudioContext || window.webkitAudioContext);
	loadSound('pong', '/src/media/pong1.ogg');
}