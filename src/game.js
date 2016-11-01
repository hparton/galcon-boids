import {Body} from './body';
import {Boid} from './boid';
import {Flock} from './flock';
import {Vector} from './vector';
import {guid, findByKey, rand} from './js/utils';

export const World = function(canvas, width, height) {
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
	this.planets = [];
	this.bodies = [];
	this.flocks = [];

	this.setup(width, height);
}

World.prototype.setup = function(width, height) {
	this.ctx.canvas.width = width;
	this.ctx.canvas.height = height;

	// Do everything we need to on first load to get the game ready.
	for (var i = 0; i < 10; i++) {

		var newCords = this.generateRandomPosition(width, height, true);

		if (i == 1) {
			console.log(newCords)
			this.addPlanet(newCords.x, newCords.y, 60, 1, 100);
		} else if (i == 2) {
			this.addPlanet(newCords.x, newCords.y, 60, 2, 100);
		} else {
			this.addPlanet(newCords.x, newCords.y, rand(20, 40), null);
		}



		// if (i == 3) {
		// 	var newPlanet = new Planet(this.ctx, rand(0,width,30), rand(0,height,30), 60, 3, 100);
		// }
	}
}

World.prototype.generateRandomPosition = function(width, height, unique) {
	var cords = {};
	cords.x = rand(70, (width - 70), 1);
	cords.y = rand(70, (height - 70), 1);

	if (unique && this.planets.length) {
		for (var i = 0; i < this.planets.length; i++) {
			if (
				this.planets[i].body.position.x < cords.x + this.planets[i].body.r && this.planets[i].body.position.x > cords.x - this.planets[i].body.r  ||
				this.planets[i].body.position.y < cords.y + this.planets[i].body.r && this.planets[i].body.position.y > cords.y - this.planets[i].body.r
			) {
				cords = this.generateRandomPosition(width, height, true);
			}
		}
	}

	return cords;
}

World.prototype.step = function() {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	for (var i = 0; i < this.flocks.length; i++) {
		this.flocks[i].run(this.bodies);
		this.flocks[i].delete(this.flocks, i);
	}

	for (var i = 0; i < this.planets.length; i++) {
		this.planets[i].run(this.flocks);
	}

	var self = this;
    requestAnimationFrame(function(timestamp) {
      self.step()
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
	this.bodies.push(newPlanet.body);
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

World.prototype.issueOrder = function(planet, target) {
	planet.spawnFighters(this, target.id);
}

World.prototype.findClosestPlanet = function(x,y) {
	var mousePosition = new Vector(x, y);
	var lowest = 0;
	var index = 0;
	var closest = null;

	for (var i = 0; i < this.planets.length; i++) {
		var distance = Vector.distance(mousePosition, this.planets[i].body.position);

		if (lowest === 0 || distance < lowest) {
			lowest = distance;
			closest = this.planets[i];
			index = [i];
		}
	}

	var distance = Vector.distance(mousePosition, closest.body.position);

	if ((distance > 0) && (distance < closest.body.r)) {
		return closest;
	} else {
		return null;
	}
}


export const Planet = function(ctx, x, y, r, faction, fighters) {
	this.id = guid();
	this.selected = false;

	if (faction) {
		this.faction = faction;
	} else {
		this.faction = false;
	}

	this.updateFactionColor();
	this.body = new Body(ctx, x, y, r, this.fill);

	if (fighters) {
		this.fighters = fighters;
	} else {
		this.fighters = rand(1,30,1);
	}
}

Planet.prototype.run = function(flocks) {
	this.incrementFighterCount();
	var self = this;
	this.body.run(flocks, function(i, flock) {
		self.calculateFighterHit(i, flock);
	});
	this.render();
}

Planet.prototype.render = function() {
	this.drawPlanetCount();
	this.updateFactionColor();

	if (this.selected) {
		this.drawSelectedIndicator();
	}
}

Planet.prototype.drawSelectedIndicator = function() {
	this.body.ctx.save();
	  this.body.ctx.beginPath();
      this.body.ctx.arc(this.body.position.x, this.body.position.y, this.body.r, 0, 2 * Math.PI, false);
      this.body.ctx.lineWidth = 5;
      this.body.ctx.strokeStyle = '#003300';
      this.body.ctx.stroke();
    this.body.ctx.restore();
}

Planet.prototype.drawPlanetCount = function() {
	this.body.ctx.save();
	  this.body.ctx.fillStyle = "#FFFFFF";
	  this.body.ctx.font = "24px sans-serif";
	  this.body.ctx.textAlign = 'center';
	  this.body.ctx.textBaseline = 'middle';
	  this.body.ctx.fillText(Math.floor(this.fighters), this.body.position.x, this.body.position.y);
	this.body.ctx.restore();
}

Planet.prototype.updateFactionColor = function() {
	switch (this.faction) {
		case 1:
			this.fill = 'rgb(216, 57, 57)';
			if (this.body) {
				this.body.fill = this.fill;
			}
			break;
		case 2:
			this.fill = 'rgb(39, 133, 219)';
			if (this.body) {
				this.body.fill = this.fill;
			}
			break;
		case 3:
			this.fill ='rgb(136, 70, 221)';
			if(this.body) {
				this.body.fill = this.fill;
			}
			break;
		default:
			this.fill = 'grey';
			if (this.body) {
				this.body.fill = this.fill;
			}
	}

}

Planet.prototype.incrementFighterCount = function(inc) {
	if (this.faction) {
		if (!inc) {
			var inc = 0.001 * (this.body.r / 2);
		}

		if (this.faction) {
			this.fighters += inc;
		}
	}
}

Planet.prototype.decrementFighterCount = function(inc) {
	this.fighters -= inc;
}

Planet.prototype.spawnFighters = function(world, id) {
	if (this.faction && this.fighters >= 2) {
		var fighterCount = this.fighters / 2;
		var target = findByKey(world.planets, 'id', id);

		var flock = new Flock(this.body.ctx, this.fill, this.faction);

		for (var i = 0; i < fighterCount; i++) {
			var newBoid = new Boid(this.body.ctx, this.body.position.x, this.body.position.y);
			flock.addBoid(newBoid);
		}

		world.flocks.push(flock);
		target.body.attracting.push(flock.id);

		this.decrementFighterCount(fighterCount);
	}
}

Planet.prototype.calculateFighterHit = function(i, flock) {

		// If its friendly we can just add it to the fighter count.
		if (flock.boids[i].faction == this.faction) {
			this.incrementFighterCount(1);
		}

		// If not take a hit.
		if (flock.boids[i].faction !== this.faction) {
			this.decrementFighterCount(1);
		}

		// If it puts us under 1, switch faction and reset the fighter count.
		if (this.fighters <= 0.9) {
			this.faction = flock.boids[i].faction;
			this.incrementFighterCount(1);
		}

		// It crashed so remove it.
		flock.removeBoid(i);

		// If the flock has no boids left, remove the flock from attracted list.
		if (!flock.boids.length) {
			this.body.attracting.splice(this.body.attracting.indexOf(flock.id), 1);
		}
}

