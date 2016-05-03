var demo_text = require('./demo_text');
var make_demo_text_containers = require('./make_demo_text_containers');

module.exports = function play_demo(){
  var cgm = this;
  var params = cgm.params;
  console.log('play demo');

  // intro text 
  var inst_text;
  var inst_time = 0;
  var prev_duration = 0;

  var demo_text_size = 38;
  make_demo_text_containers(params, demo_text_size);

  demo_text(params, 'something\nsomething\nsomething', 3000);

};