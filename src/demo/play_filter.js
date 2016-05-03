var demo_text = require('./demo_text');
var highlight_sidebar_element = require('./highlight_sidebar_element');
var two_translate_zoom = require('../zoom/two_translate_zoom');
var update_network = require('../network/update_network');

module.exports = function play_filter(cgm){

  function run(cgm){
    var params = cgm.params;

    var text = 'Filter the matrix rows based\non sum or variance';
    demo_text(params, text, 4000);
    
    // setTimeout(highlight_sidebar_element, 1500, params, 'slider_N_row_sum');

    run_update(cgm, 'N_row_sum', 20, 1);
    // run_update(cgm, 'N_row_sum', 10, 2);
    // run_update(cgm, 'N_row_sum', 'all', 0 );

  }

  function get_duration(){
    return 1400;
  }

  function run_update(cgm, filter_type, filter_value, filter_index ){

    var params = cgm.params;

    var requested_view = {};
    requested_view[filter_type] = filter_value
    update_network(cgm, requested_view);

    // quick fix for slider 
    $(params.root+' .slider_'+filter_type).slider( "value", filter_index);

    var unit_name;
    if (filter_type === 'N_row_sum'){
      unit_name = 'sum';
    } else {
      unit_name = 'variance';
    }

    d3.select(params.root+' .title_'+filter_type)
      .text('Top rows '+unit_name+': '+filter_value);

    highlight_sidebar_element(params, 'slider_'+filter_type)

  }

  return {
    run: run,
    get_duration: get_duration
  };

};