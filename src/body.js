import {Vector} from './vector.js';

export const Body = function(x, y, fill) {
	this.r = 30;
	this.position = new Vector(x,y);
	this.fill = 'blue';
	this.attracter = false;
	this.repeller = true;
}

Body.prototype.run = function(ctx) {
	this.render(ctx);
}

Body.prototype.render = function(ctx) {
	ctx.save();
		ctx.fillStyle = this.fill;
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