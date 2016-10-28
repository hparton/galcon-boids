import {Vector} from './vector.js';
import {findByKey} from './js/utils.js';

export const Body = function(x, y, fill) {
	this.r = 30;
	this.position = new Vector(x,y);
	this.fill = 'blue';
	this.attracting = [];
}

Body.prototype.run = function(ctx, flocks) {
	this.render(ctx);

	if (this.attracting.length) {
		this.attractedFlocks(flocks);
	}
}

Body.prototype.render = function(ctx) {
	ctx.save();
		if (this.attracting.length) {
			ctx.fillStyle = 'red';
		} else {
			ctx.fillStyle = this.fill;
		}

		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI, false);
		ctx.fill();
	ctx.restore();
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