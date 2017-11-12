const fs = require("fs")
const nlp = require("compromise")
const categories = require("./data/concept-categories.json")

//Photobank for testing. Approximately 200 images already selected from flickr with clarifai concepts
const photobank = require("./data/photobank-combined.json")

/*
Here is the initial goal for classifing images.

An [Medium] (depicting|of|showing) [quantity] [subject] in [environment] with [objects].

Appear to related to [plant|animal], forward to [ship].

Military reference. Alert defense force. Image classified.

Preliminary research of [location] suggest...
  * suggests possible relation to [McGuffin]
  * seems unrelated to present search, cataloging data.

Evidence of [McGuffin], signal headquarters.
*/

const categoryLookup = createCategoryIndex( categories )


console.log("----------------------------------------------------------------");

let images = pickImages(10)

images.forEach( function(image) {
  const weightedConcepts = weightConcepts( image )
  const categorizedConcepts = categorizeConcepts( weightedConcepts, categoryLookup )

  console.log("-----------");

  for( let i = 0; i < 10; i++) {
    let hypothesis = makeHypothesis( categorizedConcepts)
    console.log(`${hypothesis.category} ${hypothesis.hypothesis}`);
  }

  console.log(image.url_o);
})

function makeHypothesis( imageConcepts, category = null ) {
  if( category == null ) {
    const categories = Array.from(imageConcepts.keys())
    const categoryIndex = Math.floor( Math.random() * categories.length )
    category = categories[categoryIndex]
  }

  const choices = imageConcepts.get(category)
  const choiceIndex = Math.floor( Math.random() * choices.length )
  const choice = choices[choiceIndex].name

  return {category: category, hypothesis: choice}
}


/**
 *  Create a lookup table from a nested object of category lists
 */
function createCategoryIndex( categories ) {
  let categoryIndex = new Map()
  for( category in categories ){
    categories[category].forEach( (term) => {
      categoryIndex.set(term, category)
    })
  }
  return categoryIndex
}

function categorizeConcepts( concepts, categoryIndex) {
  // Create a map of concepts based on categories.
  let categorizedConcepts = concepts.reduce( (map, concept) => {
    if( categoryIndex.has(concept.name) ){
      let categoryList = []
      if( map.has(categoryIndex[concept.name]) ) {
        categoryList = map.get(categoryIndex.get(concept.name))
      }
      categoryList.push(concept)
      map.set(categoryIndex.get(concept.name), categoryList)
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
 *  Weight concepts that also appear in descriptions and titles higher
 */
function weightConcepts( image ) {
  const description = nlp(cleanText(image.title + image.description._content))
  let terms = description.terms().data()

  let weightedConcepts = image.concepts.map( function(concept){
    terms.forEach( function (term){
      if( term.normal == concept.name){
        concept.value *= 1.2
      }
    })
    return concept
  })

  weightedConcepts.sort( function(a,b){
    if(a.value < b.value) {
      return 1
    } else if( a.value > b.value) {
      return -1
    }
    return 0
  })

  return weightedConcepts
}


/**
 * Pick random images from the image bank
 */
function pickImages(count) {
  let selectedIndexes = []

  for( let i = 0; i < count; i++) {
    let index
    do {
      index = Math.floor( Math.random() * photobank.length )
    } while(selectedIndexes.includes(index))
    selectedIndexes.push(index)
  }

  return selectedIndexes.map( function(index){
    return photobank[index]
  })
}

/**
 *  Clean up text, mostly description
 */
function cleanText(text) {
  const unescaped = unescape(text)
  const tagsRemoved = unescaped.replace(/(<([^>]+)>)/ig,"")
  const removeExtraWhiteSpace = tagsRemoved.replace(/(\s)+/g, "$1")

  return unescape(removeExtraWhiteSpace)
}
