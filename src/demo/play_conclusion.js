var demo_text = require('./demo_text');
var toggle_play_button = require('./toggle_play_button');

module.exports = function play_conclusion(){

  function run(params){
    var text_1 = "Clustergrammer is built with gene\nexpression data in mind"+
      " and interfaces\nwith several Ma'ayan lab web tools";
    var text_2 = "The example data being visualized is\ngene expression data"+
      " obtained from the\nCancer Cell Line Encyclopedia";
    var text_3 = "For more information please view\nthe help documentation";

    setTimeout( demo_text,    0, params, text_1, 4500 );
    setTimeout( demo_text, 4500, params, text_2, 4500 );
    setTimeout( demo_text, 9000, params, text_3, 4500 );

    setTimeout( reset_demo, 14000, params);
  }

  function reset_demo(params){

    // prevent more than one demo from running at once 
    d3.select(params.root+' .play_button')
      .classed('running_demo', false);

    toggle_play_button(params, true);
  }

  function get_duration(){
    return 12000;
  }

  return {
    run: run,
    get_duration: get_duration
  };

};