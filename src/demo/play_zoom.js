var demo_text = require('./demo_text');

module.exports = function play_zoom(params){

  function run(params){
    var text = 'Zoom and pan by\nscrolling and dragging';
    // setTimeout(demo_text, )
    demo_text(params, text, 4000);
  }

  function get_duration(){
    return 4000;
  }

  return {
    run: run,
    get_duration: get_duration
  }
}