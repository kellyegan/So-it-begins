const fs = require("fs")
const config = require('./config.js')
const Flickr = require('flickr-sdk');

const flickr = new Flickr(config.flickr.api_key)

const outputPath = "data/flickr-search-results.json"

flickr.photos.search({
  text: "",
  license: "1,2,3,4,5,6,8,9,10"
}).then(function (results) {
  const totalPhotos = results.body.photos.total
  const photosPerPage = results.body.photos.perpage

  let chosenPhotos = [];

  for( let i = 0; i < 100; i++) {
    const index = Math.floor( Math.random() * totalPhotos )
    let pageIndex = Math.floor( index / photosPerPage )
    let photoIndex = index % photosPerPage
  }

  const photosJSONstring = JSON.stringify( results.body.photos.photo )

  fs.writeFile(outputPath, photosJSONstring, 'utf8', function(error) {
    if(error) {
      return console.error(error)
    }
    console.log(`"${outputPath}" saved successfully.`)
  })

}).catch(function (error) {
  console.error('ERROR', error)
});

function getImageURL(photo) {
  return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`

  //Original image
  //return `https://farm${farm-id}.staticflickr.com/${server-id}/${id}_${o-secret}_o.${file-type}`
}
