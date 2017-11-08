const fs = require('fs')
const rita = require('rita')

const inputPath = "data/clarifaiResponse.json"
const outputPath = "data/clarifai-photos.html"

let text = []
let subtext = []


fs.readFile(inputPath, "utf8", function (error, results){
  if( error ) {
    console.error( error )
  }

  const clarifaiData = JSON.parse(results)

  let htmlString = "<html>\n"

  select( 10,clarifaiData.outputs.length).forEach( function (index){
    let photo = clarifaiData.outputs[index]
    htmlString += `<div>\n\t<img src="${photo.input.data.image.url}"/>\n`
    htmlString += `\t<ul>\n`

    photo.data.concepts.forEach( function (concept){
      let conceptString = `${concept.name}: ${concept.value}`

      if( concept.value > 0.92 ) {
        conceptString = `<b>${conceptString}</b>`
        text.push(concept.name)
      } else {
        subtext.push(concept.name)
      }
      htmlString += `\t\t<li>${conceptString}</li>\n`
    })

    htmlString += `\t</ul>\n</div>\n</html>`
  })

  text = text.map( function (word){
    let wordPOS = {}
    wordPOS[word] = rita.getPosTags(word)
    return wordPOS
  })
  console.log("Text")
  console.log(text)
  console.log("Subtext")
  console.log(subtext)

  fs.writeFile(outputPath, htmlString, "utf8", function (error, results){
    if( error ) {
      console.error( error )
    }

    console.log(`"${outputPath}" successfully saved.`)
  })
})

function select( total, max) {
  let selected = []
  let currentSelection = Math.floor(Math.random() * max)
  while( selected.length < total ) {
    while( selected.includes(currentSelection) ) {
      currentSelection = Math.floor(Math.random() * max)
    }
    selected.push(currentSelection)
  }
  return selected
}
