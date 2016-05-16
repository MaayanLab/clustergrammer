var make_play_button = require('./make_play_button');
var make_demo_text_containers = require('./make_demo_text_containers');

module.exports = function ini_demo(){

  var cgm = this;
  var params = cgm.params;

  make_play_button(cgm);

  var demo_text_size = 30;
  make_demo_text_containers(params, demo_text_size);

};