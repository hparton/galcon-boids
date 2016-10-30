import {World} from './game.js';
import {rand} from './js/utils';

var world = new World(document.getElementById('galcon'), window.innerWidth, window.innerHeight);

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
		world.planets[rand(0, world.planets.length -1, 1)].spawnFighters(world, world.planets[rand(0, world.planets.length -1, 1)].id)
	}
}
