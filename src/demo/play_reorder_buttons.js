var demo_text = require('./demo_text');
var highlight_sidebar_element = require('./highlight_sidebar_element');

module.exports = function play_reorder_buttons(params){


  function run(params){
    var text = 'Reorder all rows and columns\nby clicking the reorder\n buttons';

    demo_text(params, text, 7000);
    
    setTimeout(highlight_sidebar_element, 2000, params, 'toggle_row_order');
    setTimeout(click_reorder_button, 2500, params, 'row', 'rank');

    setTimeout(highlight_sidebar_element, 6000, params, 'toggle_col_order');
    setTimeout(click_reorder_button, 6500, params, 'col', 'rank');

  }

  function get_duration(){
    return 9000;
  }

  function click_reorder_button(params, inst_rc, inst_order){
    var inst_button = d3.selectAll('.toggle_'+inst_rc+'_order .btn')
      .filter(function(){return this.__data__ == 'rank'})[0];

    $(inst_button).click();
  }

  return {
    run: run,
    get_duration: get_duration
  };

};