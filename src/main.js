import {World} from './game';
import {bullyBot} from './bots/bullyBot';

var world = new World(document.getElementById('galcon'), window.innerWidth, window.innerHeight);

// Game variables
var playerFaction = 1;

// Controls variables
var selectedPlanets = [];
var mouseDown = false;
var dragStart = null;
var dragEnd = null;

document.onmousedown = function(e) {
	console.log(world);
	mouseDown = true;
	// Find the closest planet, returns null if the mouse is not inside
	// the radius of the planet.
	var selectedPlanet = world.findClosestPlanet(e.clientX, e.clientY);

	if (selectedPlanet != null) {
		// if its our planet and we dont have any planets already selected add it to
		// selectedPlanets
		if (selectedPlanet.faction == playerFaction && !selectedPlanets.length) {
			selectedPlanets.push(selectedPlanet);
			world.selectPlanets(selectedPlanets);
		} else if (selectedPlanets.length) {
			// If its not our faction and we have some planets in selectedPlanets then send them at
			// the selectedPlanet.
			for (var i = 0; i < selectedPlanets.length; i++) {
				world.issueOrder(selectedPlanets[i], selectedPlanet);
			}
			// We've issued a command so we can forget about the planets we selected.
			world.deselectPlanets(selectedPlanets);
			selectedPlanets = [];
		}
	} else {
		// If we didn't select anything then set a dragStart point and forget about any planets we selected.
		dragStart = world.getMousePosition(e.clientX, e.clientY);
		if (selectedPlanets.length) {
			world.deselectPlanets(selectedPlanets);
			selectedPlanets = [];
		}
	}
}

document.onmouseup = function(e) {
	mouseDown = false;
	// If we have planets selected and aren't dragging a selection box.
	if (selectedPlanets.length && dragEnd == null) {
		var selectedPlanet = world.findClosestPlanet(e.clientX, e.clientY);

		// If we have a planet selected and its not the one we just clicked on.
		if (selectedPlanet != null && selectedPlanet.id != selectedPlanets[selectedPlanets.length - 1].id) {
			// Send all the ships!
			for (var i = 0; i < selectedPlanets.length; i++) {
				if (selectedPlanets[i].faction == playerFaction) {
					world.issueOrder(selectedPlanets[i], selectedPlanet);
				}
			}
			// Then forget about everything we had selected.
			world.deselectPlanets(selectedPlanets);
			selectedPlanets = [];
		}
	}

	// If we are dragging reset it.
	if (dragStart != null) {
		dragEnd = null;
		dragStart = null;
	}
}

document.onmousemove = function(e) {
	// Keep updating this as we move.
	dragEnd = world.getMousePosition(e.clientX, e.clientY);

	if (dragStart !== null) {

		for (var i = 0; i < world.planets.length; i++) {
			// No point checking a planet if its not ours cause we can't do anything with it.
			if (world.planets[i].faction == playerFaction) {
				var planet = world.planets[i];

				// Check if the planet fits in the area we are dragging.
				// This is a monstrosity but not sure of a better way right now.
				if (Math.abs(planet.position.x) >= dragStart.x
					&& Math.abs(planet.position.y) >= dragStart.y
					&& Math.abs(planet.position.x) <= dragEnd.x
					&& Math.abs(planet.position.y) <= dragEnd.y) {

					// Check if the planet is already selected, if so we don't need to add it again
					// or we will end up sending multiple commands to send ships.
					var duplicate = false;

					for (var c = 0; c < selectedPlanets.length; c++) {
						if (selectedPlanets[c].id == planet.id) {
							duplicate = true;
						}
					}

 		        	// Not a duplicate so add it.
 		        	if (!duplicate) {
 		        		selectedPlanets.push(planet);
 		        		world.selectPlanets(selectedPlanets);
 		        	}
 		        } else {
		        	// Check if we have some selected before trying to remove anything.
		        	if (selectedPlanets.length) {
		        		// Remove it from the array of selectedPlanets
		        		for (var b = 0; b < selectedPlanets.length; b++) {
		        			if (selectedPlanets[b].id == planet.id) {
		        				selectedPlanets.splice(b, 1);
		        			}
		        		}
	 		        	// Tell the world to de-select it.
	 		        	world.deselectPlanets([planet]);
	 		        }
	 		    }
	 		}
	 	}
	}
}

var blueBot = new bullyBot(world, 2);
var redBot = new bullyBot(world, 1);

world.run(function() {
	blueBot.run();
	redBot.run();
});


// IMPORTANT NOTE:
// Running this after world so the bounding box doesn't get drawn then removed
// when the world.run clears the canvas, need to move this into the games loop instead.

function run() {
	// Check every frame if we have any planets selected that changed
	// faction whilst we were dragging, we don't want to be able to send
	// orders on enemy planets.
	if (selectedPlanets.length) {
		for (var i = 0; i < selectedPlanets.length; i++) {
			if (selectedPlanets[i].faction != playerFaction) {
				world.deselectPlanets([selectedPlanets[i]]);
				selectedPlanets.splice(i, 1);
			}
		}
	}

	// if we are dragging then render the selection box.
	if (dragStart != null && dragEnd != null) {
		world.ctx.save();
		world.ctx.strokeStyle = 'black';
		world.ctx.beginPath();
		world.ctx.moveTo(dragStart.x, dragStart.y);
		world.ctx.lineTo(dragEnd.x, dragStart.y);
		world.ctx.lineTo(dragEnd.x, dragEnd.y);
		world.ctx.lineTo(dragStart.x, dragEnd.y);
		world.ctx.lineTo(dragStart.x, dragStart.y);
		world.ctx.stroke();
		world.ctx.restore();
	}

	requestAnimationFrame(function(timestamp) {
		run();
	})
}

run();