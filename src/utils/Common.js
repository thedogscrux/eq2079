const shuffleArray = (array) => {
  let array2 = Object.assign([], array)
  var currentIndex = array2.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array2[currentIndex];
    array2[currentIndex] = array2[randomIndex];
    array2[randomIndex] = temporaryValue;
  }
  return array2;
}

const testIfEqualArrays = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const removeArrayKey = (array, key) => {
  let array2 = Object.assign([], array)
  const index = array2.indexOf(key);
  array2.splice(index, 1);
  return array2
}

// abstract clas smample below (funcs must be inside class)
// export const shuffle = Score.prototype.shuffle
// export const testIfEqualArrays = Score.prototype.testIfEqualArrays

export {
  shuffleArray,
  testIfEqualArrays,
  removeArrayKey
}
