const fs = require("fs")
const config = require('./config.js')
const Flickr = require('flickr-sdk');

const flickr = new Flickr(config.flickr.api_key)

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

  fs.writeFile("data/flickr-photos.json", photosJSONstring, 'utf8', function(error) {
    if(error) {
      return console.error(error)
    }
    console.log("Saved list of photos")
  })

  // results.body.photos.photo.forEach( function (photo) {
  //   let url = getImageURL(photo.farm, photo.server, photo.id, photo.secret, "jpg")
  //
  //   console.log(url)
  // })

}).catch(function (error) {
  console.error('ERROR', error)
});

function getImageURL(farm_id, server_id, id, secret, file_type) {
  return `https://farm${farm_id}.staticflickr.com/${server_id}/${id}_${secret}.jpg`

  //Original image 
  //return `https://farm${farm-id}.staticflickr.com/${server-id}/${id}_${o-secret}_o.${file-type}`
}
