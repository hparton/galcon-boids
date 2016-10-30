import {Body} from './body';
import {Boid} from './boid';
import {Flock} from './flock';
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
		var newPlanet = new Planet(this.ctx, rand(0,width,30), rand(0,height,30), rand(1,2,1), 1);
		this.planets.push(newPlanet);
		this.bodies.push(newPlanet.body);
	}

    this.step()
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

World.prototype.addPlanet = function() {

}

World.prototype.run = function () {

}


export const Planet = function(x, y, r, faction) {
	this.id = guid();

	if (faction) {
		this.faction = faction;
	} else {
		this.faction = false;
	}

	this.updateFactionColor();

	this.body = new Body(x, y, r, this.fill);

	this.fighters = 0;
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
		default:
			this.fill = 'orange';
			if (this.body) {
				this.body.fill = this.fill;
			}
	}

}

Planet.prototype.incrementFighterCount = function(inc) {
	if (!inc) {
		var inc = 0.001 * (this.body.r / 2);
	}

	if (this.faction) {
		this.fighters += inc;
	}
}

Planet.prototype.decrementFighterCount = function(inc) {
	this.fighters -= inc;
}

Planet.prototype.spawnFighters = function(world, id) {
	if (this.fighters >= 2) {
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

