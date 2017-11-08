const fs = require("fs")
const Flickr = require('flickr-sdk')

const config = require('./config.js')
const commons = require('./data/commons-institutions.json')

const flickr = new Flickr(config.flickr.api_key)
const institutions = commons.institutions.institution
const outputPath = "data/flickr-search-results.json"

const photosToPick = 40

// Search for licenses that allow for creative reuse
const searchParameters = {
   license: "1,2,4,5,7,8,9,10",
}

let selectedInstitutions = new Map()

// Look for photos from various institutions
for( let i = 0; i < photosToPick; i++) {
  let id = institutions[Math.floor(Math.random() * institutions.length)].nsid

  if( selectedInstitutions.has(id) ) {
    let count = selectedInstitutions.get(id) + 1
    selectedInstitutions.set(id, count)
  } else {
    selectedInstitutions.set(id, 1)
  }
}

//Create requests for each institutions photos
let userRequests = Array.from(selectedInstitutions.keys()).map( function (id){
  return flickr.people.getPhotos({user_id: id, extras: "description, license, url_o"})
})

//After all requests have been completed process responses
Promise.all(userRequests).then( function (responses){

  //Convert responses into a map object
  let users = responses.reduce( function (map, response){
    map.set(response.request.params.user_id, response.body)
    return map
  }, new Map())

  let selectedPhotos = [];

  // Select photos and pages from each user
  for( user of users.entries() ) {
    let user_id = user[0]
    let user_response = user[1]

    //console.log(`user: ${user_id} response: ${user_response}`)
    let numPhotos = selectedInstitutions.get(user_id)

    for( let i = 0; i < numPhotos; i++ ) {
      const randomPhoto = Math.floor( Math.random() * user_response.photos.total)
      const photoPage = Math.floor(randomPhoto / user_response.photos.perpage) + 1
      const photoOffset = randomPhoto % user_response.photos.perpage

      selectedPhotos.push({user_id: user_id, page: photoPage, offset: photoOffset})
    }
  }

  let sequence = Promise.resolve()
  let photoRequests = []
  let photoResults = []

  selectedPhotos.forEach( function (photo){
    //If we already have the image (included in first page of results) just grab the data and move on
    if( photo.page == 1) {
      let photoData = users.get(photo.user_id).photos.photo[photo.offset]
      console.log(`${photoData.url_o}`)
      photoResults.push(photoData)
    } else {
      //Otherwise make a new flickr request and add it to the promise que
      let photoRequest = flickr.people.getPhotos({user_id: photo.user_id, page: photo.page, extras: "description, license, url_o"})

      photoRequests.push(photoRequest)

      sequence = sequence.then( function (){
        return photoRequest
      }).then( function (response){
        let photoData = response.body.photos.photo[photo.offset]
        photoResults.push(photoData)
        console.log(`${photoData.url_o}`)
      }).catch( function (error){
        console.error(error);
      })
    }

  })

  photoRequests.push(sequence)

  //All photo requests have been returned, go ahead and output the data
  Promise.all(photoRequests).then( function (response){
    console.log("All requests completed.")

    const photosJSONstring = JSON.stringify( photoResults )

    fs.writeFile(outputPath, photosJSONstring, 'utf8', function(error) {
      if(error) {
        return console.error(error)
      }
      console.log(`Saved ${photoResults.length} photos to "${outputPath}" saved successfully.`)
    })
  }).catch( function (error){
    console.error(error);

    const photosJSONstring = JSON.stringify( photoResults )

    fs.writeFile(outputPath, photosJSONstring, 'utf8', function(error) {
      if(error) {
        return console.error(error)
      }
      console.log(`Saved ${photoResults.length} photos to "${outputPath}" saved successfully.`)
    })
  })

}).catch( function (error){
  console.error(error);
})
