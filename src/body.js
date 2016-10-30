import {Vector} from './vector.js';
import {findByKey} from './js/utils.js';

var debug = false;

export const Body = function(ctx, x, y, fill) {
	this.ctx = ctx;
	this.r = 30;
	this.position = new Vector(x,y);
	this.fill = fill;
	this.attracting = [];
}

Body.prototype.run = function(flocks) {
	this.render();

	if (this.attracting.length) {
		this.attractedFlocks(flocks);
	}
}

Body.prototype.render = function() {
	this.ctx.save();
		this.ctx.fillStyle = this.fill;

		if (this.debug) {
			if (this.attracting.length) {
				this.ctx.fillStyle = 'red';
			} else {
				this.ctx.fillStyle = this.fill;
			}
		}

		this.ctx.beginPath();
		this.ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI, false);
		this.ctx.fill();
	this.ctx.restore();
}

Body.prototype.attract = function(flock, callback) {
	var zone = this.r;

	for (var i = 0; i < flock.boids.length; i++) {
		flock.boids[i].applyForce(flock.boids[i].seek(this.position).multiply(2))
		if (callback) {
			// No point checking distance if we don't have a callback.
			var distance = Vector.distance(this.position, flock.boids[i].position);
			// If its in the 'zone', e.g planet radius
			if ((distance > 0) && (distance < zone)) {
				callback(i);
			}
		}
	}
}

Body.prototype.attractedFlocks = function(flocks) {
	for (var i = 0; i < this.attracting.length; i++) {
		var attractedFlock = findByKey(flocks, 'id', this.attracting[i]);

		if (debug) {
			this.ctx.beginPath();
			this.ctx.strokeStyle = 'black';
			this.ctx.moveTo(attractedFlock.boids[0].position.x,attractedFlock.boids[0].position.y);
			this.ctx.lineTo(this.position.x, this.position.y);
			this.ctx.stroke();
		}
		// Set this as self because javascript gets a bit forgetful in callbacks.
		var self = this;
		this.attract(attractedFlock, function(e) {
			attractedFlock.removeBoid(e);

			if (!attractedFlock.boids.length) {
				self.attracting.splice(self.attracting.indexOf(attractedFlock.id), 1);
			}
		})
	}
}