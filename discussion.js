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
      hypothesis = decideImageType( conceptPool )
      break
    case "People":
      //["People", "Quantity", "Gender", "Age", "Profession"]
      hypothesis = decidePeople( conceptPool )
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

function decideImageType( conceptPool ) {
  let hypothesis = {}
  hypothesis.type = "hypothesis"
  const medium = exports.makeChoice(conceptPool, "Medium")
  const style = exports.makeChoice(conceptPool, "Style")
  const color = exports.makeChoice(conceptPool, "Color")

  hypothesis.details = []

  if( medium != null ) {
    hypothesis.details.push( {category: "Medium", choice: medium.choice} )
  }
  if( style != null ) {
    hypothesis.details.push( {category: "Style", choice: style.choice} )
  }
  if( color != null ) {
    hypothesis.details.push( {category: "Color", choice: color.choice} )
  }

  if( hypothesis.details.length > 0 ) {
    return hypothesis
  }

  return null
}

function decidePeople( conceptPool ) {
  //["People", "Quantity", "Gender", "Age", "Profession"]
  let hypothesis = {}
  hypothesis.type = "hypothesis"
  hypothesis.details = []

  const people = exports.makeChoice(conceptPool, "People")
  if( people != null ) {
    hypothesis.details.push( {category: "People", choice: people.choice} )
    if( people.choice != "no person" ) {
      const quantity = exports.makeChoice(conceptPool, "Quantity")
      if( quantity != null ) {
        hypothesis.details.push( {category: "Quantity", choice: quantity.choice} )
      }
      const gender = exports.makeChoice(conceptPool, "Gender")
      if( gender != null ) {
        if( gender.certainty > 0.6 ) {
          hypothesis.details.push( {category: "Gender", choice: gender.choice} )
        } else {
          hypothesis.details.push( {category: "Gender", choice: "mixed"} )
        }
      }
      const age = exports.makeChoice(conceptPool, "Age")
      if( age != null ) {
        hypothesis.details.push( {category: "Age", choice: age.choice} )
      }
      const profession = exports.makeChoice(conceptPool, "Profession")
      if( profession != null ) {
        hypothesis.details.push( {category: "Profession", choice: profession.choice} )
      }
    }
    return hypothesis
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
    if(tests > 9) {
      return null
    }
  }
  return { choice: choice, certainty: results.get(choice) / tests }
}
