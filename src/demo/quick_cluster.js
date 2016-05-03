// var demo_text = require('./demo_text');
module.exports = function quick_cluster(){
  /* eslint-disable */

  function run(params){

    click_reorder_button(params, 'row', 'clust');
    click_reorder_button(params, 'col', 'clust');

  }

  function get_duration(){
    return 2000;
  }

  function click_reorder_button(params, inst_rc, inst_order){
    var inst_button = d3.selectAll('.toggle_'+inst_rc+'_order .btn')
      .filter(function(){
        return this.__data__ == inst_order;
      })[0];

    $(inst_button).click();
  }

  return {
    run: run,
    get_duration: get_duration
  };

};