var demo_text = require('./demo_text');

module.exports = function play_intro(params){

  function run(params){
    var text_1 = 'Clustergrammer allows users to generate\ninteractive and '+
                 'sharable visualizations\nby uploading a matrix';
    var text_2 = "This demo will quickly overview some\nof Clustergrammer's "+
                 "interactive features";

    setTimeout( demo_text,    0, params, text_1, 5000 );
    setTimeout( demo_text, 5000, params, text_2, 3500 );
  }

  function get_duration(){
    return 9000;
  }

  return {
    run: run,
    get_duration: get_duration
  }
};