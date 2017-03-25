import {Planet} from './planet';
import {Vector} from './vector';
import {rand} from './utils';
import Stats from 'stats-js';

// eslint-disable-next-line no-undef
var stats = new Stats();
stats.setMode( 0 );
document.body.appendChild( stats.domElement );


export const World = function(canvas, width, height) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.planets = [];
  this.fleets = [];

  this.setup(width, height);
}

World.prototype.setup = function(width, height) {
  this.ctx.canvas.width = width;
  this.ctx.canvas.height = height;

	// Do everything we need to on first load to get the game ready.
  for (var i = 0; i < 15; i++) {
    var newCords = this.generateRandomPosition(width, height, true);

    if (i == 1) {
      this.addPlanet(rand(width - 200, width - 70), rand(70, height - 70), 60, 1, 100);
    } else if (i == 2) {
      this.addPlanet(rand(70, 200), rand(70, height - 70), 60, 2, 100);
    } else {
      this.addPlanet(newCords.x, newCords.y, rand(20, 40), 0);
    }
  }
}

World.prototype.generateRandomPosition = function(width, height, unique) {
  var cords = {};
  cords.x = rand(70, (width - 70), 1);
  cords.y = rand(70, (height - 70), 1);

  if (unique && this.planets.length) {
    for (var i = 0; i < this.planets.length; i++) {
      if (
				this.planets[i].position.x < cords.x + this.planets[i].r && this.planets[i].position.x > cords.x - this.planets[i].r  ||
				this.planets[i].position.y < cords.y + this.planets[i].r && this.planets[i].position.y > cords.y - this.planets[i].r
			) {
        cords = this.generateRandomPosition(width, height, true);
      }
    }
  }

  return cords;
}

World.prototype.step = function() {
  stats.begin();
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  for (let i = 0; i < this.fleets.length; i++) {
    this.fleets[i].run(this.planets);
    this.fleets[i].delete(this.fleets, i);
  }

  for (let i = 0; i < this.planets.length; i++) {
    this.planets[i].run(this.fleets);
  }

  stats.end();

  requestAnimationFrame(() => {
    this.step()
  })
}

World.prototype.run = function(callback) {
  if (callback) {
    callback();
  }
  this.step()
}

World.prototype.addPlanet = function(x, y, radius, faction, fighters) {
  var newPlanet = new Planet(this.ctx, x, y, radius, faction, fighters);
  this.planets.push(newPlanet);
}

World.prototype.selectPlanets = function(planets) {
  for (var i = 0; i < planets.length; i++) {
    planets[i].selected = true;
  }
}

World.prototype.deselectPlanets = function(planets) {
  for (var i = 0; i < planets.length; i++) {
    planets[i].selected = false;
  }
}

World.prototype.issueOrder = function(planet, target, count) {
  planet.spawnFighters(this, target.id, count);
}

World.prototype.getMousePosition = function(x,y) {
  return new Vector(x, y);
}

World.prototype.findClosestPlanet = function(x,y) {
  var mousePosition = this.getMousePosition(x, y);
  var lowest = 0;
  var closest = null;

  for (var i = 0; i < this.planets.length; i++) {
    let distance = Vector.distance(mousePosition, this.planets[i].position);

    if (lowest === 0 || distance < lowest) {
      lowest = distance;
      closest = this.planets[i];
    }
  }

  let closestDistance = Vector.distance(mousePosition, closest.position);

  if ((closestDistance > 0) && (closestDistance < closest.r)) {
    return closest;
  } else {
    return null;
  }
}


