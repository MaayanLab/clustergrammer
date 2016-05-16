var demo_text = require('./demo_text');
var sim_click = require('./sim_click');

module.exports = function play_category(){
  /* eslint-disable */

  function run(params){

    var text = 'Row and column categories\ncan be use to reorder\nby double-clicking';
    demo_text(params, text, 7000);

    var inst_element = d3.selectAll(params.root+' .col_cat_super')
      .filter(function(){
        return this.__data__ === 'cat-1';
    })[0];

    var tmp_pos = d3.select('.col_cat_super').attr('transform');
    var x_trans = Number(tmp_pos.split('(')[1].split(',')[0]
      .replace(')',''))+20;
    var y_trans = Number(tmp_pos.split(',')[1].replace(')',''));

    var wait_click = 4000;
    setTimeout(sim_click, wait_click, params, 'double', x_trans, y_trans);

    var wait_reorder = wait_click + 300;
    setTimeout(fire_double_click_row, wait_reorder, params, inst_element);

  }

  function get_duration(){
    return 8000;
  }

  function fire_double_click_row(params, inst_element){
    $(inst_element).d3DblClick();    
  }


  // allows doubleclicking on d3 element
  jQuery.fn.d3DblClick = function () {
    this.each(function (i, e) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("dblclick", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      e.dispatchEvent(evt);
    });
  };
  return {
    run: run,
    get_duration: get_duration
  };
};