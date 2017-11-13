const nlp = require("compromise")
const util = require("./utilities.js")

/**
 *  Create a lookup table from a nested object of category lists
 */
exports.createLookupTable = function ( categories ) {
  let categoryLookup = new Map()
  for( category in categories ){
    categories[category].forEach( (term) => {
      categoryLookup.set(term, category)
    })
  }
  return categoryLookup
}

/**
 *  Categorize concepts based on category index
 */
exports.categorize = function ( concepts, categoryLookup) {
  // Create a map of concepts based on categories.
  let categorizedConcepts = concepts.reduce( (map, concept) => {
    if( categoryLookup.has(concept.name) ){
      let categoryList = []
      if( map.has(categoryLookup[concept.name]) ) {
        categoryList = map.get(categoryLookup.get(concept.name))
      }
      categoryList.push(concept)
      map.set(categoryLookup.get(concept.name), categoryList)
    } else {
      let uncategorizedList = []
      if( map.has("Uncategorized") ) {
        uncategorizedList = map.get("Uncategorized")
      }
      uncategorizedList.push(concept)
      map.set("Uncategorized", uncategorizedList)
    }
    return map
  }, new Map())

  return categorizedConcepts
}

/**
 *  Add weight to concepts that also appear in descriptions and titles
 */
exports.weightDescriptions = function ( image ) {
  const description = nlp(util.cleanText(image.title + image.description._content))
  let terms = description.terms().data()

  let weightedConcepts = image.concepts.map( function(concept){
    terms.forEach( function (term){
      if( term.normal == concept.name){
        concept.value *= 1.2
      }
    })
    return concept
  })

  weightedConcepts.sort( (a,b) => {
    return a.value - b.value
  })

  return weightedConcepts
}

/**
 *  Create a pool of concepts from a list of weighted concepts
 */
exports.makePool = function ( concepts ) {
  let conceptPool = []
  //No need to create a hundred copies of one concept
  if( concepts.length > 1) {
    const total = concepts.reduce( (sum, concept) => {
      return sum + concept.value
    }, 0)

    conceptPool = concepts.reduce( (pool, concept) => {
      let quantity = Math.floor( 100 * concept.value / total )
      for( let i = 0; i < quantity; i++ ){
        pool.push(concept.name)
      }
      return pool
    }, [])
  } else {
    conceptPool = [concepts[0].name]
  }

  return conceptPool
}
