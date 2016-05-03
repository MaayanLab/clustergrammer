var demo_text = require('./demo_text');

module.exports = function play_intro(params){
  var text = 'Clustergrammer allows users to generate\ninteractive and sharable visualizations\nby uploading a matrix';
  setTimeout( demo_text, 0, params, text, 5000 );
  setTimeout( demo_text, 5000, params, "This demo will quickly overview some\nof Clustergrammer's interactive features", 3500 );
};