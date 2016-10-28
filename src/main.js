import {Vector} from './vector.js';
import {Flock} from './flock.js';
import {Boid} from './boid.js';
import {Body} from './body.js';
import {rand, map} from './js/utils';

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

var canvas = document.getElementById('galcon');
var ctx = canvas.getContext('2d');

ctx.canvas.width = windowWidth;
ctx.canvas.height = windowHeight;

var flocks = [];
var bodies = [];

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
var mouseDown = false;
document.onmousedown = function(e) {
	mouseDown = true;
}

document.onmouseup = function() {
	mouseDown = false;
}

document.onmousemove = function(e) {
	if (mouseDown) {
		var flock = new Flock(ctx);
		for (var i = 0; i < rand(10, 30, 1); i++) {
			var newBoid = new Boid(ctx, e.clientX,e.clientY);
			flock.addBoid(newBoid);
		}
		flocks.push(flock);
		bodies[rand(0,bodies.length -1,1)].attracting.push(flock.id);
	}
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
