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
      const category = categoryLookup.get(concept.name)
      //Known category
      let categoryList = []
      if( map.has(category) ) {
        categoryList = map.get(category)
      }
      categoryList.push(concept)
      map.set(category, categoryList)
    } else {
      //Uncategorized
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
 *  Take categorized concept map with weights and turn into concept pools
 */
exports.createPools = function (concepts) {
  const categorizedPools =  Array.from( concepts.keys() ).reduce( (categoryMap, category) => {
    let pool = exports.createPool( concepts.get(category) )
    categoryMap.set(category, pool)
    return categoryMap
  }, new Map() )
  return categorizedPools
}

/**
 *  Create a pool of concepts from an array of weighted concepts
 */
exports.createPool = function ( concepts ) {
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
