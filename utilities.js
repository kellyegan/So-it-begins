/**
 *  Choose a random float between two numbers
 */
exports.randomBetween = function ( min, max ){
  return Math.random() * (max - min + 1) + min
}

/**
 *  Choose a random int between two numbers
 */
exports.randomIntBetween = function ( min, max ){
  return Math.floor(exports.randomBetween( Math.floor(min), Math.floor(max) ))
}

/**
 *  Choose a random element from an array
 */
exports.chooseRandom = function ( array ) {
  const index = Math.floor( Math.random() * array.length )
  return array[index]
}
