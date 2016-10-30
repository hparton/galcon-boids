import { Vector } from './vector.js';
import { rand, radians } from './js/utils';

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

export const Boid = function(ctx, x, y) {
	this.ctx = ctx;
	this.flock_id = {}
	this.acceleration = new Vector(0,0);
	this.velocity = new Vector(rand(-1,1,0.1), rand(-1,1,0.1));
	this.position = new Vector(x,y);
	this.r = 3.0;
	this.maxspeed = 3; // Max Speed
	this.maxforce = 0.05; // Max steering force
}

Boid.prototype.run = function(boids, objects) {
	this.flock(boids, objects);
	this.update();
	this.borders();
	this.render();
}

Boid.prototype.render = function() {
  	var theta = this.velocity.toAngles() + radians(90);

	this.ctx.strokeStyle = this.fill;
	this.ctx.save();
		this.ctx.translate(this.position.x + this.r/2,this.position.y + this.r/2);
		this.ctx.rotate(theta);
		this.ctx.beginPath();
		this.ctx.moveTo(0, -this.r*2)
		this.ctx.lineTo(-this.r,this.r*2);
		this.ctx.lineTo(this.r,this.r*2);
		this.ctx.closePath();
		this.ctx.stroke();
	this.ctx.restore();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = this.ctx.canvas.width +this.r;
  if (this.position.y < -this.r)  this.position.y = this.ctx.canvas.height+this.r;
  if (this.position.x > this.ctx.canvas.width +this.r) this.position.x = -this.r;
  if (this.position.y > this.ctx.canvas.height+this.r) this.position.y = -this.r;
}

Boid.prototype.flock = function(boids, objects) {
	var sep = this.seperate(boids);
	var coh = this.cohesion(boids);
	var ali = this.align(boids);
	var avo = this.avoid(objects);

	sep.multiply(3);
	coh.multiply(1.5);
	ali.multiply(1);
	// avo.multiply(5);

	this.applyForce(sep);
	this.applyForce(ali);
	this.applyForce(coh);
	this.applyForce(avo);
}


Boid.prototype.seek = function(target) {
	var desired = Vector.subtract(target, this.position);
	desired.normalize();
	desired.multiply(this.maxspeed);

	var steer = Vector.subtract(desired, this.velocity);
	steer.limit(this.maxforce);
	return steer;
}

// Alignment
Boid.prototype.align = function(boids) {
	var sum = new Vector(0,0);
	var count = 0;

	for (var i = 0; i < boids.length; i++) {
		sum.add(boids[i].velocity);
		count++;
	}

	if (count > 0) {
		sum.divide(count);
		sum.normalize();
		sum.multiply(this.maxspeed);

		var steer = Vector.subtract(sum, this.velocity);
		steer.limit(this.maxforce);
		return steer;
	} else {
		return new Vector(0,0);
	}
}

// Cohesion
Boid.prototype.cohesion = function(boids) {
	var sum = new Vector(0,0);
	var count = 0;

	for (var i = 0; i < boids.length; i++) {
		sum.add(boids[i].position);
		count++;
	}

	if (count > 0) {
		sum.divide(count);
		return this.seek(sum);
	} else {
		return new Vector(0,0);
	}
}


// Seperate
Boid.prototype.seperate = function(boids) {
	var desiredSeperation = this.r * 8;
	var steer = new Vector(0,0);
	var count = 0;

	for (var i = 0; i < boids.length; i++) {
		var distance = Vector.distance(this.position, boids[i].position);
		if ((distance > 0) && (distance < desiredSeperation)) {
			var diff = Vector.subtract(this.position, boids[i].position);
			diff.normalize();
			diff.divide(distance);
			steer.add(diff);
			count++;
		}
	}

	if (count > 0) {
		steer.divide(count);
	}

	if (steer.mag() > 0) {
		steer.normalize();
		steer.multiply(this.maxspeed);
		steer.subtract(this.velocity);
		steer.limit(this.maxforce);
	}

	return steer;
 }

 Boid.prototype.avoid = function(objects) {
 	var lowest = 0;
 	var closest = {};
 	var steer = new Vector(0,0);

	for (var i = 0; i < objects.length; i++) {
		var distance = Vector.distance(this.position, objects[i].position);

		if (lowest === 0 || distance < lowest) {
			lowest = distance;
			closest = objects[i];
		}
	}
	// Check if we are attracting anything, we don't need to do anything if its an attracter
	// because we want to smash into the planet anyway.
	if (closest.attracting.indexOf(this.flock_id) == -1 && lowest < closest.r + closest.r * 1.2) {
		// this.fill = 'green';

		// start checking 40px ahead
		var predict = this.velocity.clone();
		predict.multiply(50);
		var futureposition = Vector.add(this.position, predict);
		var futuredistance = Vector.distance(futureposition, closest.position);

        // ctx.beginPath();
        // ctx.arc(futureposition.x, futureposition.y, 3, 0, 2 * Math.PI, false);
        // ctx.fillStyle = 'green';
        // ctx.fill();

		if (futuredistance > closest.r) {
			var diff = Vector.subtract(closest.position, this.position);
			diff.normalize();
			diff.multiply(this.velocity.mag());
			diff.negative();

			var desired = Vector.add(this.velocity, diff);
			desired.normalize();
			desired.multiply(lowest);
			// desired.multiply(this.maxspeed);
		}

		if (desired != null) {
			steer = Vector.subtract(desired, this.velocity);
			steer.limit(this.maxforce);
			return steer.multiply(1.3 * (lowest /7.5) );
		} else {
			return new Vector(0,0);
		}

	} else {
		return new Vector(0,0);
	}

 }

Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.set(0,0);
}