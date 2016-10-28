import {guid} from './js/utils';

export const Flock = function (ctx) {
	this.id = guid();
	this.ctx = ctx;
	this.color = randomColor({luminosity: 'dark'});
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
	this.boids.push(boid);
}

Flock.prototype.removeBoid = function(index) {
	this.boids.splice(index, 1);
}