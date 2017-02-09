import {guid, findByKey, rand} from './js/utils';
import {Vector} from './vector';
import {Fleet} from './fleet';
import {Boid} from './boid';


export const Planet = function(ctx, x, y, r, faction, fighters) {
  this.id = guid();
  this.r = r;
  this.growthRate = this.r / 2;
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

Planet.prototype.run = function(fleets) {
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
  this.ctx.arc(this.position.x, this.position.y, this.r + 5, 0, 2 * Math.PI, false);
  this.ctx.lineWidth = 3;
  this.ctx.strokeStyle = '#FFFFFF';
  this.ctx.stroke();
  this.ctx.restore();
}

Planet.prototype.renderPlanetCount = function() {
  this.ctx.save();
  this.ctx.fillStyle = this.fill;
  this.ctx.font = '20px MUTHUR';
  this.ctx.textAlign = 'center';
  this.ctx.textBaseline = 'middle';
  this.ctx.fillText(Math.floor(this.fighters), this.position.x, this.position.y);
  this.ctx.restore();
}

Planet.prototype.renderPlanet = function() {
  var numberOfSides = 14;
  this.ctx.save();
  this.ctx.strokeStyle = this.fill;
  this.ctx.fillStyle = 'rgb(35, 35, 35)';
  this.ctx.strokeWidth = 2;
  this.ctx.shadowBlur = 200;
  this.ctx.shadowColor = this.fill;
  this.ctx.beginPath();
  this.ctx.moveTo(this.position.x + this.r * Math.cos(0), this.position.y + this.r * Math.sin(0));          
     
  for (var i = 1; i <= numberOfSides; i++) {
    this.ctx.lineTo(this.position.x + this.r * Math.cos(i * 2 * Math.PI / numberOfSides), this.position.y + this.r * Math.sin(i * 2 * Math.PI / numberOfSides));
  }
    
  this.ctx.fill();
  this.ctx.stroke();
  this.ctx.closePath();
  this.ctx.restore();
    
}

Planet.prototype.updateFactionColor = function() {
  switch (this.faction) {
  case 1:
    this.fill = '#bd0a0a';
    if (this) {
      this.fill = this.fill;
    }
    break;
  case 2:
    this.fill = '#0abdbd';
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
      inc = 0.001 * (this.r / 2);
    }

    this.fighters += inc;
  }
}

Planet.prototype.decrementFighterCount = function(inc) {
  this.fighters -= inc;
}

Planet.prototype.spawnFighters = function(world, id) {
  if (this.faction && this.fighters >= 2) {
    var fighterCount = this.fighters / 2;
    var target = findByKey(world.planets, 'id', id);

    var fleet = new Fleet(this.ctx, this.fill, this.faction, this.id);

    // if (fighterCount >= 50) {
    //   for (let i = 0; i < (fighterCount / 10); i++) {
    //     let newBoid = new Boid(this.ctx, this.position.x, this.position.y, 10);
    //     fleet.addBoid(newBoid);
    //     this.decrementFighterCount(10);
    //   }
    // } else {
    for (let i = 0; i < fighterCount; i++) {
      let newBoid = new Boid(this.ctx, this.position.x, this.position.y, 1);
      fleet.addBoid(newBoid);
      this.decrementFighterCount(1);
    }
    // }

    world.fleets.push(fleet);
    target.attracting.push(fleet.id);

    // this.decrementFighterCount(fighterCount);
  }
}

Planet.prototype.calculateFighterHit = function(i, fleet) {
	// If its friendly we can just add it to the fighter count.
  if (fleet.boids[i].faction == this.faction) {
    this.incrementFighterCount(fleet.boids[i].value);
  }

	// If not take a hit.
  if (fleet.boids[i].faction !== this.faction) {
    this.decrementFighterCount(fleet.boids[i].value);
  }

	// If it puts us under 1, switch faction and reset the fighter count.
  if (this.fighters < 1) {
    this.faction = fleet.boids[i].faction;
    this.incrementFighterCount(fleet.boids[i].value);
  }

	// It crashed so remove it.
  fleet.removeBoid(i);

	// If the fleet has no boids left, remove the fleet from attracted list.
  if (!fleet.boids.length) {
    this.attracting.splice(this.attracting.indexOf(fleet.id), 1);
  }
}

Planet.prototype.attract = function(fleet, callback) {
  var zone = this.r;
  if (fleet) {
    for (var i = 0; i < fleet.boids.length; i++) {
      fleet.boids[i].applyForce(fleet.boids[i].seek(this.position).multiply(2.5))
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
    this.attract(attractedFleet, function(e, fleet) {
      callback(e, fleet);
    });
  }
}