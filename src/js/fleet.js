import {guid} from './utils';

export const Fleet = function (ctx, color, faction, source, destination) {
  this.id = guid();
  this.source = source;
  this.destination = destination;
  this.faction = faction;
  this.ctx = ctx;
  this.color = color;
  this.boids = [];
  this.value = 0;
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
  boid.source = this.source;
  this.value += boid.value;
  this.boids.push(boid);
}

Fleet.prototype.removeBoid = function(index) {
  this.boids.splice(index, 1);
}