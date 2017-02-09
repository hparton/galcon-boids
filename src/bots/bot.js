// TODO: Fair ol' bit of duplication in here that could be reduced and just have aliases to one function

export const Bot = function(world, faction, enemy) {
  this.faction = faction;
  this.enemy = enemy;
  this.world = world;
}

Bot.prototype.doTurn = function() {
  throw 'No function overwriting doTurn, stopping here. Make sure you set a botType.prototype.doTurn on the new bot type';
}

Bot.prototype.underAttack = function(planet) {
  planet.attracting.map((fleet) => {
    if (fleet.faction !== this.faction) {
      return true;
    }
  })
  
  return false;
}

// Return an array of all my fleets in flight.
Bot.prototype.myFleets = function() {
  var fleets = [];
  
  this.world.fleets.map((fleet) => {
    if (fleet.faction === this.faction) {
      fleets.push(fleet);      
    }
  })

  return fleets;
}

Bot.prototype.enemyFleets = function () {
  var fleets = [];
  
  this.world.fleets.map((fleet) => {
    if (fleet.faction === this.enemy) {
      fleets.push(fleet);      
    }
  })

  return fleets;
}

Bot.prototype.shipCount = function (planets, fleets) {
  var shipCount = 0;
  
  planets.map((planet) => {
    shipCount += planet.fighters;
  })
  
  fleets.map((fleet) => {
    fleet.boids.map((boid) => {
      shipCount += boid.value;
    })
  })
  
  return shipCount;
}

// Return an array of just my planets.
Bot.prototype.myPlanets = function() {
  var planets = [];

  this.world.planets.map((planet) => {
    if (planet.faction === this.faction) {
      planets.push(planet);
    }
  })

  return planets;
}

// Return an array of enemy and neutral planets
Bot.prototype.notMyPlanets = function() {
  var planets = [];

  this.world.planets.map((planet) => {
    if (planet.faction !== this.faction) {
      planets.push(planet);
    }
  })

  return planets;
}

Bot.prototype.enemyPlanets = function() {
  var planets = [];

  this.world.planets.map((planet) => {
    if (planet.faction === this.enemy) {
      planets.push(planet);
    }
  })

  return planets;
}

Bot.prototype.myProduction = function() {
  return this.production(this.faction);
}

Bot.prototype.enemyProduction = function() {
  return this.production(this.enemy);
};

Bot.prototype.production = function(faction) {
  var productionCount = 0;
  
  this.world.planets.map((planet) => {
    if (planet.faction === faction) {
      productionCount += planet.growthRate;
    }
  })
  
  return productionCount;
}

Bot.prototype.run = function() {
  this.doTurn();

  var self = this;
  requestAnimationFrame(function() {
    self.run();
  })
}