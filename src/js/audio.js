function Audio() {
	var self = this,
		sounds = new Object(),
		media = [
			{name: 'pong', url: 'src/media/pong1.ogg'}
		],
		audioSource;
		
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
	audioSource = self.context.createBufferSource();
	audioSource.connect(self.context.destination);
	
	for (var i=0; i < media.length; i++) loadSound(media[i].name, media[i].url);
	
	// Play sound
	self.playSound = function(name) {
		if (audioSource.buffer != sounds[name]) audioSource.buffer = sounds[name];
		audioSource.start(0);
	}
}