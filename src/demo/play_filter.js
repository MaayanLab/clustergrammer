var demo_text = require('./demo_text');
var highlight_sidebar_element = require('./highlight_sidebar_element');
var two_translate_zoom = require('../zoom/two_translate_zoom');
var update_network = require('../network/update_network');

module.exports = function play_filter(cgm){

  function run(cgm){
    var params = cgm.params;

    var text = 'Filter the matrix rows based\non sum or variance';
    demo_text(params, text, 4000);
    
    setTimeout(highlight_sidebar_element, 1500, params, 'slider_N_row_sum');

    update_network(cgm, {'N_row_sum':10});

    // var ini_delay = 1500;
    // // manually mimic typing and autocomplete 
    // setTimeout( type_out_search, ini_delay+1000, params, 'E' );
    // setTimeout( type_out_search, ini_delay+1500, params, 'EG' );
    // setTimeout( type_out_search, ini_delay+2000, params, 'EGF' );
    // setTimeout( type_out_search, ini_delay+2500, params, 'EGFR' );

    // setTimeout(run_search, 4000, params );

    // setTimeout(two_translate_zoom, 6000, params, 0, 0, 1);
  }

  function get_duration(){
    return 1400;
  }

  function click_reorder_button(params, inst_rc, inst_order){
    var inst_button = d3.selectAll('.toggle_'+inst_rc+'_order .btn')
      .filter(function(){return this.__data__ == 'rank'})[0];

    $(inst_button).click();
  }

  function type_out_search(params, inst_string){
    $(params.root+' .gene_search_box').val(inst_string);
    $(params.root+' .gene_search_box').autocomplete( "search", inst_string );
  }  

  function run_search(params){
    $(params.root+' .submit_gene_button').click();
    $(params.root+' .gene_search_box').autocomplete( "search", '' );
  }

  return {
    run: run,
    get_duration: get_duration
  };

};