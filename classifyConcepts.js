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

  //What kind of image is it?
  let imageTypeHypothesis = []
  addHypothesis( "Medium", categorizedConcepts, imageTypeHypothesis)
  addHypothesis( "Style", categorizedConcepts, imageTypeHypothesis)
  console.log(imageTypeHypothesis);

  //Are there people?
  let peopleHypothesis = []
  let people = makeHypothesis( categorizedConcepts, ["People"])
  if( people != null ) {
    peopleHypothesis.push(people)
    if( people.hypothesis == "people") {
      addHypothesis( "Quantity", categorizedConcepts, peopleHypothesis)
      addHypothesis( "Gender", categorizedConcepts, peopleHypothesis)
      addHypothesis( "Profession", categorizedConcepts, peopleHypothesis)
    }
  }
  console.log(peopleHypothesis);

  //Where is it?
  let environmentHypothesis = []
  addHypothesis( "Environment", categorizedConcepts, environmentHypothesis)

  //What else is there?
  let objectHypothesis = []
  addHypothesis( "Vehicle", categorizedConcepts, objectHypothesis)
  addHypothesis( "Object", categorizedConcepts, objectHypothesis)
  console.log(objectHypothesis)

  let uncategorizedHypothesis = []
  for( let i = 0; i < 3; i++) {
    addHypothesis( "Uncategorized", categorizedConcepts, uncategorizedHypothesis)
  }
  console.log(uncategorizedHypothesis)

  console.log(image.url_o);
})

function addHypothesis( category, concepts, list) {
  let hypothesis = makeHypothesis( concepts, [category])
  if( hypothesis != null ) {
    list.push(hypothesis)
    return true
  }
  return false
}

function makeHypothesis( imageConcepts, categoryList = null ) {
  let category = ""
  if( categoryList == null ) {
    const categories = Array.from(imageConcepts.keys())
    category = chooseRandom( categories )
  } else {
    category = chooseRandom( categoryList )
  }

  const choices = imageConcepts.get(category)
  if( choices ) {
    const choice = chooseRandom(choices).name
    return {category: category, hypothesis: choice}
  } else {
    return null
  }
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
      concept.value = Math.floor(concept.value * 100)
    })
    return concept
  })

  weightedConcepts.sort( (a,b) => {
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

/**
 *  Choose a random float between two numbers
 */
function randomBetween( min, max ){
  return Math.random() * (max - min + 1) + min
}

function randomIntBetween( min, max ){
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 *  Choose a random element from an array
 */
function chooseRandom( array ) {
  const index = Math.floor( Math.random() * array.length )
  return array[index]
}
