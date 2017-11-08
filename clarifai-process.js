const fs = require("fs")
const config = require('./config.js')
const Clarifai = require("clarifai")

const inputPath = "data/flickr-search-results.json"
const outputPath = "data/clarifai-results.json"

const clarifaiApp = new Clarifai.App({
  apiKey: config.clarifai.api_key
})

fs.readFile(inputPath, "utf8", function (error, results){
  if( error ) {
    console.error( error )
  }

  const photoSearchResults = JSON.parse(results)
  let urlList = []

  let photoSelection = photoSearchResults.slice(127, 219)

  photoSelection.forEach( function (photo){
    urlList.push( getImageURL( photo ) )
  })

  console.log(urlList)

  clarifaiApp.models.predict(Clarifai.GENERAL_MODEL, urlList).then(
  function(response) {
    console.log("Success");
    const clarifaiResponseJSONString = JSON.stringify( response )
    fs.writeFile(outputPath, clarifaiResponseJSONString, "utf8", function (error, results){
      if( error ) {
        console.error( error )
      }

      console.log(`${outputPath} successfully saved.`)
    })
  },
  function(err) {
    console.error(err);
  });

})

function getImageURL( photo ) {
  return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`
}
