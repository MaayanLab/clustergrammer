var demo_text = require('./demo_text');
var highlight_sidebar_element = require('./highlight_sidebar_element');
var update_network = require('../network/update_network');

module.exports = function play_filter(){

  function run(cgm){
    var params = cgm.params;

    var text = 'Filter rows based on \nsum or variance';
    demo_text(params, text, 3000);
    
    var filter_type = 'N_row_sum';

    setTimeout(highlight_sidebar_element, 3500, params, 'slider_'+filter_type, 
      12500);

    text = 'Top 20 rows by sum';
    setTimeout(demo_text, 4000, params, text, 3000);
    setTimeout(run_update, 4000, cgm, filter_type, 20, 1);

    text = 'Top 10 rows by sum';
    setTimeout(demo_text, 8000, params, text, 3000);
    setTimeout(run_update, 8000, cgm, filter_type, 10, 2);

    text = 'All rows';
    setTimeout(demo_text, 12000, params, text, 3000);
    setTimeout(run_update, 12000, cgm, filter_type, 'all', 0);

  }

  function get_duration(){
    return 1400;
  }

  function run_update(cgm, filter_type, filter_value, filter_index ){

    var params = cgm.params;

    var requested_view = {};
    requested_view[filter_type] = filter_value;
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


  }

  return {
    run: run,
    get_duration: get_duration
  };

};