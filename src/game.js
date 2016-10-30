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

	switch (faction) {
		case 1:
			this.fill = 'rgb(216, 57, 57)';
			break;
		case 2:
			this.fill = 'rgb(39, 133, 219)';
			break;
		default:
			this.fill = 'orange';
	}

	this.body = new Body(x, y, r, this.fill);
	this.fighters = 0;
}

Planet.prototype.run = function(flocks) {
	this.produceFighters();
	this.body.run(flocks);
	this.render();
}

Planet.prototype.render = function() {
	this.drawPlanetCount();
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

Planet.prototype.produceFighters = function() {
	var inc = 0.01 * (this.body.r / 2);

	if (this.faction) {
		this.fighters += inc;
	}
}

Planet.prototype.reduceFighters = function() {
	this.fighters = this.fighters / 2;
}

Planet.prototype.spawnFighters = function(world, id) {
	var fighterCount = this.fighters / 2;
	var flock = new Flock(this.body.ctx, this.fill);
	var target = findByKey(world.planets, 'id', id);
	for (var i = 0; i < fighterCount; i++) {
		var newBoid = new Boid(this.body.ctx, this.body.position.x, this.body.position.y);
		flock.addBoid(newBoid);
	}

	world.flocks.push(flock);
	target.body.attracting.push(flock.id);

	this.reduceFighters();
}

