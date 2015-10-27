function Audio() {
	var self = this,
		sounds = new Object(),
		media = [
			{name: 'pong', url: 'src/media/pong1.ogg'}
		];
		
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
	
	self.context = new (window.AudioContext || window.webkitAudioContext);
	for (var i=0; i < media.length; i++) loadSound(media[i].name, media[i].url);
	
	// Play sound
	self.playSound = function(name) {
		audioSource = self.context.createBufferSource();
		audioSource.buffer = sounds[name];
		audioSource.connect(self.context.destination);
		audioSource.start(0);
	}
}