var demo_text = require('./demo_text');
var highlight_sidebar_element = require('./highlight_sidebar_element');
var two_translate_zoom = require('../zoom/two_translate_zoom');

module.exports = function play_search(params){


  function run(params){

    var text = 'Search for rows using\nthe search box';
    demo_text(params, text, 4000);
    
    setTimeout(highlight_sidebar_element, 1500, params, 'gene_search_container');

    var ini_delay = 1500;
    // manually mimic typing and autocomplete 
    setTimeout( type_out_search, ini_delay+1000, params, 'E' );
    setTimeout( type_out_search, ini_delay+1500, params, 'EG' );
    setTimeout( type_out_search, ini_delay+2000, params, 'EGF' );
    setTimeout( type_out_search, ini_delay+2500, params, 'EGFR' );

    setTimeout(run_search, 4000, params );

    setTimeout(two_translate_zoom, 6000, params, 0, 0, 1);
  }

  function get_duration(){
    return 7500;
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