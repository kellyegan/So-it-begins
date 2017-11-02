const config = require('./config.js')
const Flickr = require('node-flickr');

flickr = new Flickr({"api_key": config.flickr.api_key})

module.exports.search = function (searchTerms, callback) {
  flickr.get( "photos.search", {"text": searchTerms, "license": "1,2,3,4,5,6,8,9,10"}, callback)
}

module.exports.getImageURL = function (farm_id, server_id, id, secret, file_type) {
  return `https://farm${farm_id}.staticflickr.com/${server_id}/${id}_${secret}.jpg`
  //return `https://farm${farm-id}.staticflickr.com/${server-id}/${id}_${o-secret}_o.${file-type}`
}
