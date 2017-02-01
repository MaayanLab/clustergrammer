var demo_text = require('./demo_text');
var two_translate_zoom = require('../zoom/two_translate_zoom');

module.exports = function play_zoom(){

  function run(cgm){

    var params = cgm.params;
    var text = 'Zoom and pan by\nscrolling and dragging';
    demo_text(params, text, 4000);

    setTimeout(two_translate_zoom, 1500, cgm, 0, 0, 4);

  }

  function get_duration(){
    return 4000;
  }

  return {
    run: run,
    get_duration: get_duration
  };
};