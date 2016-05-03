var demo_text = require('./demo_text');
var highlight_sidebar_element = require('./highlight_sidebar_element');
var change_groups = require('../dendrogram/change_groups');

module.exports = function play_groups(){
  /* eslint-disable */

  function run(params){

    var text = 'Identify row and column\ngroups of varying sizes\nusing the sliders';
    demo_text(params, text, 4000);
    
    setTimeout(highlight_sidebar_element, 3000, params, 'slider_col', 7000);

    setTimeout(change_group_slider, 4000, params, 'row', 3);

    setTimeout(change_group_slider, 5000, params, 'row', 4);

    setTimeout(change_group_slider, 6000, params, 'row', 5);

    setTimeout(change_group_slider, 7000, params, 'row', 6);

    setTimeout(change_group_slider, 8000, params, 'row', 7);

    setTimeout(change_group_slider, 9000, params, 'row', 5);

  }

  function get_duration(){
    return 10000;
  }

  function change_group_slider(params, inst_rc, inst_value){
    $(cgm.params.root+' .slider_col').slider( "value", inst_value/10);
    change_groups(params, inst_rc, inst_value);
  }

  return {
    run: run,
    get_duration: get_duration
  };

};