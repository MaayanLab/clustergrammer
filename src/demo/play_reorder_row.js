var demo_text = require('./demo_text');
var sim_click = require('./sim_click');

module.exports = function play_reorder_row(){
  /* eslint-disable */

  function run(params){

    var text = 'Reorder the matrix based on a single\nrow or column by double-clicking a\nlabel';
    demo_text(params, text, 7000);

    var inst_element = get_row_element(params, 'EGFR');

    var group_trans = d3.select(inst_element).attr('transform');

    var container_trans = d3.select(params.root+' .clust_container')
      .attr('transform')
      .split(',')[1].replace(')','');

    var x_trans = params.viz.norm_labels.width.row * 0.9;

    var row_trans = group_trans.split(',')[1].replace(')','');
    var y_trans = String(Number(row_trans) + Number(container_trans) +
      params.viz.rect_height/2);

    var wait_click = 4000;
    setTimeout(sim_click, wait_click, params, 'double', x_trans, y_trans);
    var wait_reorder = wait_click + 300;
    setTimeout(fire_double_click_row, wait_reorder, params, inst_element);

  }

  function get_duration(){
    return 8000;
  }

  function get_row_element(params, inst_row){

    var inst_element = d3.selectAll(params.root+' .row_label_group')
      .filter(function(){
        var inst_data = this.__data__;
        return inst_data.name == inst_row;
      })[0][0];

    return inst_element;
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