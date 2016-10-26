export const rand = function(min,max,interval) {
    if (typeof(interval)==='undefined') interval = 1;
    var r = Math.floor(Math.random()*(max-min+interval)/interval);
    return r*interval+min;
}

export const radians = function(degrees) {
  return degrees * Math.PI / 180;
};