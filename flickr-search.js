const fs = require("fs")
const config = require('./config.js')
const Flickr = require('flickr-sdk');

const flickr = new Flickr(config.flickr.api_key)

const outputPath = "data/flickr-search-results.json"


/**
 * Flickr license codes
 * 0 - All Rights Reserved
 * 1 - Attribution-NonCommercial-ShareAlike License https://creativecommons.org/licenses/by-nc-sa/2.0/
 * 2 - Attribution-NonCommercial License https://creativecommons.org/licenses/by-nc/2.0/
 * 3 - Attribution-NonCommercial-NoDerivs License https://creativecommons.org/licenses/by-nc-nd/2.0/
 * 4 - Attribution License https://creativecommons.org/licenses/by/2.0/
 * 5 - Attribution-ShareAlike License https://creativecommons.org/licenses/by-sa/2.0/
 * 6 - Attribution-NoDerivs License https://creativecommons.org/licenses/by-nd/2.0/
 * 7 - No known copyright restrictions https://www.flickr.com/commons/usage/
 * 8 - United States Government Work http://www.usa.gov/copyright.shtml
 * 9 - Public Domain Dedication (CC0) https://creativecommons.org/publicdomain/zero/1.0/
 * 10 - Public Domain Mark https://creativecommons.org/publicdomain/mark/1.0/
 *
 */

flickr.photos.search({
  text: "",
  license: "1,2,4,5,7,8,9,10"
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
