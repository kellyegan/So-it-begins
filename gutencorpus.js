var gutencorpus = require('gutencorpus');
gutencorpus.search('competition', {caseSensitive: true})
  .done(function(result) {
    console.log(result);
  });
