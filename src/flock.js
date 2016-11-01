import {guid} from './js/utils';

export const Flock = function (ctx, color, faction) {
	this.id = guid();
	this.faction = faction;
	this.ctx = ctx;
	this.color = color;
	this.boids = [];
}

Flock.prototype.run = function(bodies) {
	for (var i = 0; i < this.boids.length; i++) {
		this.boids[i].run(this.boids, bodies);
	}
}

Flock.prototype.delete = function(flocks, index) {
	if (this.boids.length <= 0) {
		flocks.splice(index, 1);
	}
}

Flock.prototype.addBoid = function(boid) {
	boid.flock_id = this.id;
	boid.fill = this.color;
	boid.faction = this.faction;
	this.boids.push(boid);
}

Flock.prototype.removeBoid = function(index) {
	this.boids.splice(index, 1);
}