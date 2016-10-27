import {Vector} from './vector.js';
import {rand, radians, map} from './js/utils';

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

var canvas = document.getElementById('galcon');
var ctx = canvas.getContext('2d');

ctx.canvas.width = windowWidth;
ctx.canvas.height = windowHeight;


var flock = new Flock();
var death = new Sphere(800,800,true);
var obstacle = new Sphere(300,300);
var obstacle2 = new Sphere(500,500);
var obstacle3 = new Sphere(500,650);

function Flock() {
	this.boids = [];
}

Flock.prototype.run = function() {
	for (var i = 0; i < this.boids.length; i++) {
		this.boids[i].run(this.boids);
	}
}

Flock.prototype.addBoid = function(boid) {
	this.boids.push(boid);
}

Flock.prototype.removeBoid = function(index) {
	this.boids.splice(index, 1);
}

function Sphere(x, y, type) {
	this.r = 30;
	this.position = new Vector(x,y);
	if (!type) {
		this.type = 'avoid';
	} else {
		this.type = 'void';
	}
}

Sphere.prototype.run = function() {
	var voidzone = this.r;

	if (this.type == 'void') {
		for (var i = 0; i < flock.boids.length; i++) {
			flock.boids[i].applyForce(flock.boids[i].seek(this.position).multiply(2))

			var distance = Vector.distance(this.position, flock.boids[i].position);

			if ((distance > 0) && (distance < voidzone)) {
				flock.removeBoid(i);
			}
		}
	}

	this.render();
}

Sphere.prototype.render = function() {
	ctx.save();
		if (this.type == 'void') {
			ctx.fillStyle == 'black';
		} else {
			ctx.fillStyle = 'blue';
		}
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI, false);
		ctx.fill();
	ctx.restore();
}

function Boid(x,y) {
	this.acceleration = new Vector(0,0);
	this.velocity = new Vector(rand(-1,1,0.1), rand(-1,1,0.1));
	this.position = new Vector(x,y);
	this.r = 3.0;
	this.maxspeed = 3; // Max Speed
	this.maxforce = 0.05; // Max steering force
	this.fill = randomColor();
}

Boid.prototype.run = function(boids) {
	this.flock(boids);
	this.update();
	this.borders();
	this.render();
}

Boid.prototype.render = function() {
  	var theta = this.velocity.toAngles() + radians(90);

	ctx.strokeStyle = this.fill;
	ctx.save();
		ctx.translate(this.position.x + this.r/2,this.position.y + this.r/2);
		ctx.rotate(theta);
		ctx.beginPath();
		ctx.moveTo(0, -this.r*2)
		ctx.lineTo(-this.r,this.r*2);
		ctx.lineTo(this.r,this.r*2);
		ctx.closePath();
		ctx.stroke();
	ctx.restore();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = windowWidth +this.r;
  if (this.position.y < -this.r)  this.position.y = windowHeight+this.r;
  if (this.position.x > windowWidth +this.r) this.position.x = -this.r;
  if (this.position.y > windowHeight+this.r) this.position.y = -this.r;
}

Boid.prototype.flock = function(boids) {
	var sep = this.seperate(boids);
	var coh = this.cohesion(boids);
	var ali = this.align(boids);
	var avo = this.avoid([obstacle3, obstacle2, obstacle]);

	sep.multiply(3);
	coh.multiply(1);
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



		if (lowest < closest.r + 40) {
			// this.fill = 'green';

			// start checking 25px ahead
			var predict = this.velocity.clone();
			predict.multiply(40);
			var futureposition = Vector.add(this.position, predict);
			var futuredistance = Vector.distance(futureposition, closest.position);

	        // ctx.beginPath();
	        // ctx.arc(futureposition.x, futureposition.y, 3, 0, 2 * Math.PI, false);
	        // ctx.fillStyle = 'green';
	        // ctx.fill();

			if (futuredistance > closest.r) {
				var toCenter = Vector.subtract(closest.position, this.position);
				toCenter.normalize();
				toCenter.multiply(this.velocity.mag());

				var desired = Vector.add(this.velocity, toCenter.negative());
				desired.normalize();
				desired.multiply(this.maxspeed);
			}

			if (desired != null) {
				steer = Vector.subtract(desired, this.velocity);
				steer.limit(this.maxforce);
				return steer.multiply(7);
			} else {
				return new Vector(0,0);
			}

		} else {
			this.fill = 'red';
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


function setup () {

	// Do everything we need to on first load to get the game ready.



	for (var i = 0; i < 200; i++) {
		var newBoid = new Boid(100,150);
		flock.addBoid(newBoid);
	}

    requestAnimationFrame(function(timestamp) {
      step()
    })
}

function step () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// update all logic for the game
	for (var i = 0; i < flock.boids.length; i++) {
		flock.boids[i].run(flock.boids)
	}

	death.run();
	obstacle.run();
	obstacle2.run();
	obstacle3.run();

    requestAnimationFrame(function(timestamp) {
      step()
    })
}

function draw () {

}

setup()
