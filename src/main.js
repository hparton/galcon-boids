import {World} from './game';
import {rand} from './js/utils';
import {bullyBot} from './bots/bullyBot';

var world = new World(document.getElementById('galcon'), window.innerWidth, window.innerHeight);

var playerFaction = 1;
var selectedPlanets = [];

var mouseDown = false;

document.onmousedown = function(e) {
	mouseDown = true;
	var selectedPlanet = world.findClosestPlanet(e.clientX, e.clientY);

	if (selectedPlanet != null) {
		if (selectedPlanet.faction == playerFaction && !selectedPlanets.length) {
			selectedPlanets.push(selectedPlanet);
			world.selectPlanets(selectedPlanets);
		} else {
			for (var i = 0; i < selectedPlanets.length; i++) {
				world.issueOrder(selectedPlanets[i], selectedPlanet);
			}
			world.deselectPlanets(selectedPlanets);
			selectedPlanets = [];
		}
	} else {
		world.deselectPlanets(selectedPlanets);
		selectedPlanets = [];
	}
}

document.onmouseup = function(e) {
	mouseDown = false;
	if (selectedPlanets.length) {
		var selectedPlanet = world.findClosestPlanet(e.clientX, e.clientY);

		if (selectedPlanet != null && selectedPlanet.id != selectedPlanets[selectedPlanets.length - 1].id) {
			for (var i = 0; i < selectedPlanets.length; i++) {
				if (selectedPlanets[i].faction == playerFaction) {
					world.issueOrder(selectedPlanets[i], selectedPlanet);
				}
			}
			world.deselectPlanets(selectedPlanets);
			selectedPlanets = [];
		}
	}
}

document.onmousemove = function(e) {
	if (mouseDown) {

	}
}

var bot = new bullyBot(world, 2);
// var bottwo = new bullyBot(world, 1);

world.run(function() {
	bot.run();
	// bottwo.run();
});

