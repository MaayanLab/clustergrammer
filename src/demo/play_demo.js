var make_demo_text_containers = require('./make_demo_text_containers');
var play_intro = require('./play_intro');

module.exports = function play_demo(){
  var cgm = this;
  var params = cgm.params;

  // intro text 
  var inst_text;
  var inst_time = 0;
  var prev_duration = 0;
  var demo_text_size = 38;

  make_demo_text_containers(params, demo_text_size);

  play_intro(params);

};