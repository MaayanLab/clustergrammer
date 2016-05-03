var demo_text = require('./demo_text');
var two_translate_zoom = require('../zoom/two_translate_zoom');
var sim_click = require('./sim_click');

module.exports = function play_reset_zoom(params){

  function run(params){

    var text = 'Reset zoom by double-clicking\n';
    demo_text(params, text, 3000);
    
    setTimeout(sim_click, 1300, params, 'double', 300, 300);
    setTimeout(two_translate_zoom, 1700, params, 0, 0, 1);

  }

  function get_duration(){
    return 4000;
  }

  return {
    run: run,
    get_duration: get_duration
  }
}