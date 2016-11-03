import {guid} from './js/utils';

export const Fleet = function (ctx, color, faction) {
	this.id = guid();
	this.faction = faction;
	this.ctx = ctx;
	this.color = color;
	this.boids = [];
}

Fleet.prototype.run = function(bodies) {
	for (var i = 0; i < this.boids.length; i++) {
		this.boids[i].run(this.boids, bodies);
	}
}

Fleet.prototype.delete = function(fleets, index) {
	if (this.boids.length <= 0) {
		fleets.splice(index, 1);
	}
}

Fleet.prototype.addBoid = function(boid) {
	boid.fleet_id = this.id;
	boid.fill = this.color;
	boid.faction = this.faction;
	this.boids.push(boid);
}

Fleet.prototype.removeBoid = function(index) {
	this.boids.splice(index, 1);
}