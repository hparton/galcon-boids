export const rand = function(min,max,interval) {
    if (typeof(interval)==='undefined') interval = 1;
    var r = Math.floor(Math.random()*(max-min+interval)/interval);
    return r*interval+min;
}

export const radians = function(degrees) {
  return degrees * Math.PI / 180;
};

export const map = function(n, start1, stop1, start2, stop2) {
  return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
};

export const guid = function() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

export const findById = function(source, id) {
  for (var i = 0; i < source.length; i++) {
    if (source[i].id === id) {
      return source[i];
    }
  }
}