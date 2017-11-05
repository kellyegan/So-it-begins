const tracery = require('tracery-grammar');

const grammar = tracery.createGrammar({
 'dreamStart': ['I dreamt', 'I had a dream', 'I was dreaming', "In last night's dream"],
 'subject': ['I was #context#', '#noun.a# was #context#'],
 'noun': ['elephant','walrus','lawyer', 'beetle', 'butterfly'],
 'context': ['in #interior.a#', 'on #exterior.a#', '#travel#'],
 'travel': ['#verb# #direction# #noun.a#', '#verb# #direction# #interior.a#', '#verb# #direction# #exterior#'],
 'verb': ['running', 'walking', 'swimming', 'flying', 'crawling'],
 'direction': ['away from', 'towards'],
 'interior': ['car', 'tank', 'cabin', 'airplane', 'hospital', 'room', 'mess hall', 'cargo hold', 'cave' ],
 'exterior': ['mountain', 'hill', 'ship', 'operating table', 'skyscraper'],
 'origin': ['#dreamStart# #subject#.']
 });

grammar.addModifiers(tracery.baseEngModifiers);

for(let i = 0; i < 20; i++) {
  console.log(grammar.flatten('#origin#'));
}
