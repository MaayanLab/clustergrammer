var sim_click = require('./sim_click');

module.exports = function quick_cluster(){
  /* eslint-disable */

  function run(params){

    var x_trans = Number(d3.select(params.root+' .expand_button').attr('x')
        .replace('px',''));
    var y_trans = Number(d3.select(params.root+' .expand_button').attr('y')
        .replace('px',''));

    var wait_click = 0;
    var wait_real_click = 400;
    setTimeout(sim_click, wait_click, params, 'single', x_trans, y_trans);
    setTimeout(click_menu_button, wait_real_click, params);

    setTimeout(reset_cluster_order, 1500, params);

  }

  function get_duration(){
    return 3500;
  }

  function click_menu_button(params){
    $(params.root+' .expand_button').d3Click();
  };

  function reset_cluster_order(params){
    click_reorder_button(params, 'row', 'clust');
    click_reorder_button(params, 'col', 'clust');
  }

  function click_reorder_button(params, inst_rc, inst_order){
    var inst_button = d3.selectAll('.toggle_'+inst_rc+'_order .btn')
      .filter(function(){
        return this.__data__ == inst_order;
      })[0];

    $(inst_button).click();
  }

  // allows doubleclicking on d3 element
  jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false,
       false, false, false, 0, null);
      e.dispatchEvent(evt);
    });
  };  

  return {
    run: run,
    get_duration: get_duration
  };

};