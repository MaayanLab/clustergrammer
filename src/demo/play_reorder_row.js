var demo_text = require('./demo_text');
var sim_click = require('./sim_click');

module.exports = function play_reorder_row(params){

  // allows doubleclicking on d3 element
  jQuery.fn.d3DblClick = function () {
    this.each(function (i, e) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("dblclick", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      e.dispatchEvent(evt);
    });
  };

  function run(params){

    var text = 'Reorder the matrix based on a single\nrow of column by double-clicking a\nlabel';
    demo_text(params, text, 4000);

    // setTimeout(fire_double_click_row, 1000, params, 'EGFR');
    setTimeout(sim_click, 900, params, 'double', 300, 300);

  }

  function get_duration(){
    return 4000;
  }

  function fire_double_click_row(params, inst_row){

    var tmp = d3.selectAll(params.root+' .row_label_group')
      .filter(function(){
        var inst_data = this.__data__;
        return inst_data.name == inst_row;
      })[0][0];

    $(tmp).d3DblClick();    
  }

  return {
    run: run,
    get_duration: get_duration
  }
}