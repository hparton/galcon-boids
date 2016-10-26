import {Vector} from './vector.js';
import {rand, radians} from './js/utils';

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

var canvas = document.getElementById('galcon');
var ctx = canvas.getContext('2d');

ctx.canvas.width = windowWidth;
ctx.canvas.height = windowHeight;


var flock = new Flock();

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

function Boid(x,y) {
	this.acceleration = new Vector(0,0);
	this.velocity = new Vector(rand(-1,1,0.1), rand(-1,1,0.1));
	this.position = new Vector(x,y);
	this.r = 3.0;
	this.maxspeed = 3; // Max Speed
	this.maxforce = 0.05; // Max steering force
}

Boid.prototype.run = function(boids) {
	this.flock(boids);
	this.update();
	this.borders();
	this.render();
}

Boid.prototype.render = function() {
  	var theta = this.velocity.toAngles() + radians(90);

	ctx.strokeStyle = "red";
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

	sep.multiply(1.5);
	coh.multiply(1);
	ali.multiply(1);

	this.applyForce(sep);
	this.applyForce(ali);
	this.applyForce(coh);
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
	var neighbordist = 20;
	var sum = new Vector(0,0);
	var count = 0;

	for (var i = 0; i < boids.length; i++) {
		var distance = Vector.distance(this.position, boids[i].position);

		if ((distance > 0) && (distance < neighbordist)) {
			sum.add(boids[i].velocity);
			count++;
		}
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
	var neighbordist = 20;
	var sum = new Vector(0,0);
	var count = 0;

	for (var i = 0; i < boids.length; i++) {
		var distance = Vector.distance(this.position, boids[i].position);

		if ((distance > 0) && (distance < neighbordist)) {
			sum.add(boids[i].position);
			count++;
		}
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
		var newBoid = new Boid(rand(100,windowWidth,0.1),rand(100,windowHeight,0.1));
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

    requestAnimationFrame(function(timestamp) {
      step()
    })
}

function draw () {

}

setup()
