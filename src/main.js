import {World} from './game.js';
import {rand} from './js/utils';

import {Bot} from './bots/bot';

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
	// if (mouseDown) {
	// 	world.planets[rand(0, world.planets.length -1, 1)].spawnFighters(world, world.planets[rand(0, world.planets.length -1, 1)].id)
	// }
}

var bullyBot = new Bot(world, 2);

function doTurn() {
	var fleetLimit = 5;

	if (bullyBot.notMyPlanets().length === 0) {
		document.location.reload();
	}

	// Enemy AI (Placeholder) Each turn send a fighter to a random planet (friendly or enemy).
	// if (bullyBot.myFleets().length <= fleetLimit) {
		bullyBot.notMyPlanets()[rand(0, bullyBot.notMyPlanets().length -1, 1)].spawnFighters(world, world.planets[rand(0, world.planets.length -1, 1)].id)
	// }

	// (1) If we are sending a fleet, do nothing.
	if (bullyBot.myFleets().length >= fleetLimit) {
		console.log('Fleets at limit, do nothing');
		return;
	}

	// (2) Find my strongest planet;
	var myPlanets = bullyBot.myPlanets();
	var strongestPlanet = null;
	var strongestScore = 0;

	for (var i = 0; i < myPlanets.length; i++) {
		if (myPlanets[i].fighters > strongestScore) {
			strongestPlanet = myPlanets[i];
			strongestScore = strongestPlanet.fighters;
		}
	}

	// (3) Find the weakest enemy or neutral planet.
	var notMyPlanets = bullyBot.notMyPlanets();
	var weakestPlanet = null;
	var destScore = 0;

	for (var i = 0; i < notMyPlanets.length; i++) {
		var score = 1.0 / (1 + notMyPlanets[i].fighters);

		if (score > destScore) {
			destScore = score;
			weakestPlanet = notMyPlanets[i];
		}
	}

	// (4) Send half my ships from my strongest planet to the weakest planet
	// that i do not own.

	if (strongestPlanet != null && weakestPlanet != null) {
		if (strongestPlanet.fighters > 15) {
			strongestPlanet.spawnFighters(bullyBot.world, weakestPlanet.id)
		}
	}
 }

function run() {
	doTurn();

	requestAnimationFrame(function(timestamp) {
	 	run();
	})
}

run();
