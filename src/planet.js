import {guid, findByKey, rand} from './js/utils';
import {Vector} from './vector';
import {Fleet} from './fleet';
import {Boid} from './boid';


export const Planet = function(ctx, x, y, r, faction, fighters) {
	this.id = guid();
	this.r = r;
	this.ctx = ctx;
	this.selected = false;
	this.attracting = [];
	this.position = new Vector(x,y);
	this.fill = false;

	if (faction) {
		this.faction = faction;
	} else {
		this.faction = false;
	}

	this.updateFactionColor();

	if (fighters) {
		this.fighters = fighters;
	} else {
		this.fighters = rand(1,30,1);
	}
}

Planet.prototype.run = function(fleets, callback) {
	this.incrementFighterCount();

	if (this.attracting.length) {
		var self = this;
		this.attractedFleets(fleets, function(i, fleet) {
			self.calculateFighterHit(i, fleet);
		});
	}

	this.render();
}

Planet.prototype.render = function() {
	this.updateFactionColor();
	this.renderPlanet();
	this.renderPlanetCount();

	if (this.selected) {
		this.renderSelectedIndicator();
	}
}

Planet.prototype.renderSelectedIndicator = function() {
	this.ctx.save();
	  this.ctx.beginPath();
      this.ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI, false);
      this.ctx.lineWidth = 5;
      this.ctx.strokeStyle = '#003300';
      this.ctx.stroke();
    this.ctx.restore();
}

Planet.prototype.renderPlanetCount = function() {
	this.ctx.save();
	  this.ctx.fillStyle = "#FFFFFF";
	  this.ctx.font = "24px sans-serif";
	  this.ctx.textAlign = 'center';
	  this.ctx.textBaseline = 'middle';
	  this.ctx.fillText(Math.floor(this.fighters), this.position.x, this.position.y);
	this.ctx.restore();
}

Planet.prototype.updateFactionColor = function() {
	switch (this.faction) {
		case 1:
			this.fill = 'rgb(216, 57, 57)';
			if (this) {
				this.fill = this.fill;
			}
			break;
		case 2:
			this.fill = 'rgb(39, 133, 219)';
			if (this) {
				this.fill = this.fill;
			}
			break;
		case 3:
			this.fill ='rgb(136, 70, 221)';
			if(this) {
				this.fill = this.fill;
			}
			break;
		default:
			this.fill = 'grey';
			if (this) {
				this.fill = this.fill;
			}
	}

}

Planet.prototype.incrementFighterCount = function(inc) {
	if (this.faction) {
		if (!inc) {
			var inc = 0.001 * (this.r / 2);
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

		var fleet = new Fleet(this.ctx, this.fill, this.faction);

		for (var i = 0; i < fighterCount; i++) {
			var newBoid = new Boid(this.ctx, this.position.x, this.position.y);
			fleet.addBoid(newBoid);
		}

		world.fleets.push(fleet);
		target.attracting.push(fleet.id);

		this.decrementFighterCount(fighterCount);
	}
}

Planet.prototype.calculateFighterHit = function(i, fleet) {
		// If its friendly we can just add it to the fighter count.
		if (fleet.boids[i].faction == this.faction) {
			this.incrementFighterCount(1);
		}

		// If not take a hit.
		if (fleet.boids[i].faction !== this.faction) {
			this.decrementFighterCount(1);
		}

		// If it puts us under 1, switch faction and reset the fighter count.
		if (this.fighters < 1) {
			this.faction = fleet.boids[i].faction;
			this.incrementFighterCount(1);
		}

		// It crashed so remove it.
		fleet.removeBoid(i);

		// If the fleet has no boids left, remove the fleet from attracted list.
		if (!fleet.boids.length) {
			this.attracting.splice(this.attracting.indexOf(fleet.id), 1);
		}
}


var debug = false;


Planet.prototype.renderPlanet = function() {
	this.ctx.save();
		this.ctx.fillStyle = this.fill;

		if (this.debug) {
			if (this.attracting.length) {
				this.ctx.fillStyle = 'red';
			} else {
				this.ctx.fillStyle = this.fill;
			}
		}

		this.ctx.beginPath();
		this.ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI, false);
		this.ctx.fill();
	this.ctx.restore();
}

Planet.prototype.attract = function(fleet, callback) {
	var zone = this.r;
	if (fleet) {
		for (var i = 0; i < fleet.boids.length; i++) {
			fleet.boids[i].applyForce(fleet.boids[i].seek(this.position).multiply(2))
			if (callback) {
				// No point checking distance if we don't have a callback.
				var distance = Vector.distance(this.position, fleet.boids[i].position);
				// If its in the 'zone', e.g planet radius
				if ((distance > 0) && (distance < zone)) {
					callback(i, fleet);
				}
			}
		}
	}
}

Planet.prototype.attractedFleets = function(fleets, callback) {
	for (var i = 0; i < this.attracting.length; i++) {
		var attractedFleet = findByKey(fleets, 'id', this.attracting[i]);
		if (debug) {
			this.ctx.beginPath();
			this.ctx.strokeStyle = 'black';
			this.ctx.moveTo(attractedFleet.boids[0].position.x,attractedFleet.boids[0].position.y);
			this.ctx.lineTo(this.position.x, this.position.y);
			this.ctx.stroke();
		}
		// Set this as self because javascript gets a bit forgetful in callbacks.
		var self = this;
		this.attract(attractedFleet, function(e, fleet) {
			callback(e, fleet);
		});
	}
}