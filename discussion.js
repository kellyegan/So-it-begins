const util = require("./utilities")

/**
 *   Create a discussion from a list of concepts, agents, and concept map
 */
exports.createDiscussion = function (conceptPool, agents = null, conceptMap = null) {
  let discussion = {}

  if( agents == null) {
    agents = {}
  }
  discussion.agents = agents

  if(conceptMap == null) {
    conceptMap = {}
  }
  discussion.conceptMap = conceptMap
  discussion.stats = {}

  discussion.statements = []

  return discussion
}

/**
 *  Make a new hypothesis about an image. Category list give categories to consider
 */
exports.makeHypothesis = function (conceptPool, type = null) {
  if( type == null ) {
    type = util.chooseRandom(["Image type", "People", "Building", "Vehicle", "Object"])
  }

  let hypothesis = null

  switch (type) {
    case "Image type":
  
      break
    case "People":
      //["People", "Quantity", "Gender", "Age", "Profession"]

      break
    case "Building":

      break
    case "Vehicle":

      break
    case "Object":

      break
  }

  category = util.chooseRandom( categories )

  const choices = conceptPool.get(category)
  if( choices ) {
    const choice = util.chooseRandom(choices)
    return {type: "hypothesis", hypothesis: [{category: category, choice: choice}]}
  }

  return null
}

/**
 *  Make a choice by sampling
 */
exports.makeChoice = function ( conceptPool, category ) {
  let goal = 3
  let tests = 5
  let noWinner = true
  let results = new Map()
  let choice = null

  while( noWinner ) {
    for( let i = 0; i < tests; i++ ){
      let pick = util.chooseRandom(conceptPool.get(category))
      if( results.has(pick) ) {
        let count = results.get( pick ) + 1
        results.set( pick, count )
        if( count >= goal ) {
          noWinner = false
          choice = pick
        }
      } else {
        results.set( pick, 1 )
      }
    }
    if( noWinner ) {
      goal += 1
      tests += 2
    }
    if(tests > 7) {
      return null
    }
  }
  return { choice: choice, certainty: results.get(choice) / tests }
}
