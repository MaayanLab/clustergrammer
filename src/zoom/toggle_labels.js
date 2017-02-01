var calc_real_font_size = require('./calc_real_font_size');
var num_visible_labels = require('./num_visible_labels');

module.exports = function toggle_labels(params){

  var max_element_show = 150;
  var min_font_size = 3;

  // toggle row/col label visibility
  /////////////////////////////////////
  var real_font_size = calc_real_font_size(params);
  _.each(['row','col'], function(inst_rc){

    // only toggle labels if font size is large enough
    if (real_font_size[inst_rc] > min_font_size){

      var inst_num_visible = num_visible_labels(params, inst_rc);

      d3.selectAll('.horz_lines').select('line').style('display','none');
      d3.selectAll('.vert_lines').select('line').style('display','none');

      if (inst_num_visible > max_element_show){

        d3.selectAll(params.root+' .'+inst_rc+'_label_group')
          .select('text')
          .style('display','none');

        d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
          .select('path')
          .style('display','none');

      }

    } else {

      // do not display labels if font size is too small
      d3.selectAll(params.root+' .'+inst_rc+'_label_group')
        .select('text')
        .style('display','none');

      d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
        .select('path')
        .style('display','none');

    }

  });
}