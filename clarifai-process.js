const fs = require("fs")
const config = require('./config.js')
const Clarifai = require("clarifai")

const inputPath = "data/flickr-search-results.json"
const outputPath = "data/photos-with-concepts.json"

const clarifaiApp = new Clarifai.App({
  apiKey: config.clarifai.api_key
})

fs.readFile(inputPath, "utf8", function (error, results){
  if( error ) {
    console.error( error )
  }

  const photoSearchResults = JSON.parse(results)
  let urlList = []

  photoSearchResults.forEach( function (photo){
    urlList.push( getImageURL( photo ) )
  })

  console.log(urlList)

  clarifaiApp.models.predict(Clarifai.GENERAL_MODEL, urlList).then(
  function(clarifaiResponse) {
    console.log("Success");


    //Create a map of urls to concept lists
    let clarifaiConcepts = clarifaiResponse.outputs.reduce( function(map, clarifai){
      let url = clarifai.input.data.image.url
      let concepts = clarifai.data.concepts
      return map.set(url, concepts)
    }, new Map())

    let photosDataWithConcepts = []

    photoSearchResults.forEach( function (photo){
      let url = getImageURL(photo)
      photo.concepts = clarifaiConcepts.get(url)

      photosDataWithConcepts.push(photo)
    })

    const photosDataWithConceptsJSONString = JSON.stringify( photosDataWithConcepts )

    fs.writeFile(outputPath, photosDataWithConceptsJSONString, "utf8", function (error, results){
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
