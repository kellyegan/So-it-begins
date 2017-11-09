const fs = require("fs")
const nlp = require("nlp-compromise")

//Photobank for testing. Approximately 200 images already selected from flickr with clarifai concepts
const photobank = require("./data/photobank-combined.json")



let images = pickImages(10)

images.forEach( function(image) {
  const titleAndDescription = cleanText(image.title) + cleanText(image.description._content)

  console.log(titleAndDescription)

  let subtext = false
  image.concepts.forEach( function(concept){
    console.log(`${concept.name} - ${concept.value}`);
    if( !subtext && concept.value < .93) {
      console.log("----------------");
      subtext = true
    }
  })
})


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
