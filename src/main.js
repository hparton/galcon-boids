import {Vector} from './vector.js';
import {Boid} from './boid.js';
import {Body} from './body.js';
import {rand, map, guid} from './js/utils';

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

var canvas = document.getElementById('galcon');
var ctx = canvas.getContext('2d');

ctx.canvas.width = windowWidth;
ctx.canvas.height = windowHeight;

var flocks = [];
var bodies = [];

function Flock() {
	this.id = guid();
	this.color = randomColor({luminosity: 'dark'});
	this.boids = [];
}

Flock.prototype.run = function(bodies) {
	for (var i = 0; i < this.boids.length; i++) {
		this.boids[i].run(ctx, this.boids, bodies);
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

// USEFUL FOR SELECTING TARGET LATER.
// var mousePosition = new Vector(e.clientX, e.clientY);
// 	var lowest = 0;
// 	var index = 0;
// 	var closest = {};

// for (var i = 0; i < bodies.length; i++) {
// 	var distance = Vector.distance(mousePosition, bodies[i].position);

// 	if (lowest === 0 || distance < lowest) {
// 		lowest = distance;
// 		closest = bodies[i];
// 		index = [i];
// 	}
// }

document.onmousedown = function(e) {
	console.log(e);
	var flock = new Flock();
	for (var i = 0; i < rand(10, 30, 1); i++) {
		var newBoid = new Boid(e.clientX,e.clientY);
		flock.addBoid(newBoid);
	}
	flocks.push(flock);
	bodies[rand(0,bodies.length -1,1)].attracting.push(flock.id);
	console.log(flocks);
}


function setup () {

	// Do everything we need to on first load to get the game ready.
	for (var i = 0; i < 10; i++) {
		var newBody = new Body(rand(0,windowWidth,30), rand(0,windowHeight,30))
		bodies.push(newBody);
	}

    requestAnimationFrame(function(timestamp) {
      step()
    })
}

function step () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (var i = 0; i < bodies.length; i++) {
		bodies[i].run(ctx, flocks);
	}

	for (var i = 0; i < flocks.length; i++) {
		flocks[i].run(bodies);
		flocks[i].delete(flocks, i);
	}

    requestAnimationFrame(function(timestamp) {
      step()
    })
}

function getByValue(arr, value) {

  for (var i=0, iLen=arr.length; i<iLen; i++) {

    if (arr[i].b == value) return arr[i];
  }
}

setup()
