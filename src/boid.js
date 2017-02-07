import { Vector } from './vector.js';
import { rand, radians, clamp } from './js/utils';

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

export const Boid = function(ctx, x, y) {
	this.ctx = ctx;
	this.acceleration = new Vector(0,0);
	this.velocity = new Vector(rand(-1,1,0.1), rand(-1,1,0.1));
	this.position = new Vector(x,y);
	this.r = 3.0;
	this.maxspeed = 2; // Max Speed
	this.maxforce = 0.05; // Max steering force
	this.viewDistance = 50;
	this.separationDistance = 30.0;
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

	this.renderAvoidanceArea();
}

Boid.prototype.renderAvoidanceArea = function(){
	this.ctx.save();
		this.ctx.strokeStyle = 'rgba(255,0,0,0.2)'
	    //Field of view
		this.ctx.beginPath();
	    this.ctx.moveTo(this.position.x+this.viewDistance,this.position.y);
	    this.ctx.arc(this.position.x, this.position.y, this.viewDistance, 0, 2 * Math.PI);
	    this.ctx.stroke();
	    this.ctx.closePath();

		this.ctx.beginPath();
		this.ctx.strokeStyle = 'rgba(0,0,255,0.2)'
	    //Separation distance
	    this.ctx.moveTo(this.position.x+this.separationDistance,this.position.y);
	    this.ctx.arc(this.position.x, this.position.y, this.separationDistance, 0, 2 * Math.PI);
	    this.ctx.stroke();
	    this.ctx.closePath();


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
	avo.multiply(5);

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
	var desiredSeperation = this.r + this.separationDistance;
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
	var obstacles = objects;

	for (var i = 0; i < obstacles.length; i++) {
		var r = Vector.subtract(obstacles[i].position, this.position);

		if (r.length() < (this.viewDistance + obstacles[i].r)) {
			if (this.source !== obstacles[i].id) {
				if (obstacles[i].attracting.indexOf(this.fleet_id) == -1) {
					var safetyDistance = obstacles[i].r*1.80;
					var theta = r.angleTo(this.velocity);
					var z = r.length() * Math.sin(theta);

					if (Math.abs(z) < safetyDistance) {
						if (Math.abs(theta) < Math.PI / 2) {
          
							var ratio = safetyDistance / r.length();
          
							var newTheta = Math.asin(clamp(ratio, -1, 1));
          
							newTheta = Math.abs(theta - newTheta) * (theta > 0 ? 1 : -1);
          
							var newDir = new Vector(
								this.velocity.x * Math.cos(newTheta) - this.velocity.y * Math.sin(newTheta),
								this.velocity.x * Math.sin(newTheta) + this.velocity.y * Math.cos(newTheta)
							);
          
              newDir.normalize();
              newDir.multiply(this.maxspeed);
              newDir.subtract(this.velocity);
              newDir.limit(this.maxforce);
              return newDir;
						}
					}
				}
			}
		}
	}

	return new Vector(0,0);
}

Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
	// Add Velocity
  this.position.add(this.velocity);
  // Reset acceleration to 0 each cycle
  this.acceleration.set(0,0);
}