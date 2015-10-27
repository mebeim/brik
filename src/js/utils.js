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
	},

	limitTo: {
		value: function(a, b) {
			if (this <= a) return a;
			if (this >= b) return b;
			return this.valueOf();
		}
	}
});

Object.defineProperties(Math, {
	normAngle: {
		value: function(a) {
			return (a < 0 ? 2*this.PI : 0) + a%(2*this.PI);
		}
	},
	reflect: {
		value: function(tg, teta) {
			return this.normAngle(2*Math.atan(tg) - teta);
		}
	}
});

Object.defineProperties(CanvasRenderingContext2D.prototype, {
	fastLine: {
		value: function(x1, y1, x2, y2, color, width) {
			var obj = this;
			function drawer() {
				obj.beginPath();
				if (color) obj.strokeStyle = color;
				if (width) obj.lineWidth = width;
				obj.moveTo(x1, y1);
				obj.lineTo(x2, y2);
				obj.closePath();
				obj.stroke();
			}
			drawer();
			return drawer;
		}
	}
});

function _get(q) {
	if (q[0] === '*') return document.querySelectorAll(q.substr(1));
	else return document.querySelector(q);
}