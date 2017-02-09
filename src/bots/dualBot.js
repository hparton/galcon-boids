import {Bot} from './bot';

export const dualBot = function () {
  Bot.apply(this, arguments);
}

dualBot.prototype = Object.create(Bot.prototype);

dualBot.prototype.doTurn = function() {
  var fleetLimit = 1;
  var attackMode = false;
  
  var myShipCount = this.shipCount(this.myPlanets(), this.myFleets())
  var enemyShipCount = this.shipCount(this.enemyPlanets(), this.enemyFleets())
  var myProduction = this.myProduction();
  var enemyProduction = this.enemyProduction();
  
  if (myShipCount > enemyShipCount) {
    if (myProduction > enemyProduction) {
      fleetLimit = 1;
      attackMode = true;
    } else {
      fleetLimit = 3;
    }
  } else {
    if (myProduction > enemyProduction) {
      fleetLimit = 1;
    } else {
      fleetLimit = 5;
    }
  }

  // (1) If we are sending a fleet, do nothing.
  if (this.myFleets().length >= fleetLimit) {
    return;
  }

  // (2) Find my strongest planet;
  var myPlanets = this.myPlanets();
  var strongestPlanet = null;
  var strongestScore = 0;
  
  for (let i = 0; i < myPlanets.length; i++) {
    if (myPlanets[i].fighters > strongestScore && !(this.underAttack(myPlanets[i]))) {
      strongestPlanet = myPlanets[i];
      strongestScore = strongestPlanet.fighters;
    }
  }
 
  // (3) Find the weakest enemy or neutral planet.
  var candidates = this.notMyPlanets();
  
  if (attackMode) {
    candidates = this.enemyPlanets();
  }
  
  var weakestPlanet = null;
  var destScore = 0;
  
  for (let i = 0; i < candidates.length; i++) {
    var score = (1 + candidates[i].growthRate) / + candidates[i].fighters;
  
    if (score > destScore) {
      destScore = score;
      weakestPlanet = candidates[i];
    }
  }
  
  // (4) Send half my ships from my strongest planet to the weakest planet
  // that i do not own.
  if (strongestPlanet != null && weakestPlanet != null) {
    if (strongestPlanet.fighters > 15) {
      this.world.issueOrder(strongestPlanet, weakestPlanet);
    }
  }
}