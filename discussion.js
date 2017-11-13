const util = require("./utilities")

/**
 *   Create a discussion from a list of concepts, agents, and concept map
 */
exports.createDiscussion = function (imageConcepts, agents, conceptMap) {
  let discussion = {}

  //TODO: implement discussion

  return discussion
}

/**
 *  Make a new hypothesis about an image. Category list give categories to consider
 */
exports.makeHypothesis = function (conceptPool, categories = null) {
  if( categories == null ) {
    categories = Array.from(conceptPool.keys())
  }

  category = util.chooseRandom( categories )

  const choices = conceptPool.get(category)
  if( choices ) {
    const choice = util.chooseRandom(choices)
    return {category: category, hypothesis: choice}
  }

  return null
}
