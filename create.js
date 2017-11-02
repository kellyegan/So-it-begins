const rita = require('rita')
const fs = require('fs')
const config = require('./config.js')
const flickr = require('./flickr-search.js')

//Search flickr for some elephants
flickr.search("", function (error, response) {
  if( error ) {
    console.error(error)
  }

  response.photos.photo.forEach( function (element){
    let url = flickr.getImageURL(element.farm, element.server, element.id, element.secret, "jpg")
    console.log(url)
  })
  //console.log(response.photos)
})

const draftIndex = 1
const targetWordCount = 50000

// Create a string of random words
let novelText = rita.randomWord()

for( let i = 0; i < targetWordCount - 1; i++) {
  novelText += " " + rita.randomWord()
}

fs.writeFile("drafts/draft_" + padNumber( draftIndex, "0", 3 ) + ".txt", novelText, function(err) {
  if(err) {
    return console.log(err);
  }
  console.log( "Saved draft " + draftIndex + ": " + novelText.substring(0, 200) )
})

/**
 *  Pad a number with a specific character
 */
function padNumber( number, padCharacter, totalCharacters ) {
  if( draftIndex != 0 ) {
    const numberToPad = totalCharacters - 1 - Math.floor(Math.log10(number))
    return padCharacter.repeat(numberToPad) + number
  } else {
    return "0".repeat(totalCharacters)
  }
}
