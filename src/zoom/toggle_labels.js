var calc_real_font_size = require('./calc_real_font_size');
var num_visible_labels = require('./num_visible_labels');

module.exports = function toggle_labels(params){

  // console.log('toggle_labels')

  var max_element_show = 300;
  var min_font_size = 2;
  var real_font_size = calc_real_font_size(params);


  // toggle row/col label visibility
  /////////////////////////////////////
  _.each(['row','col'], function(inst_rc){

    // console.log( inst_rc + ': ' + String(real_font_size[inst_rc]) )

    // only toggle labels if font size is large enough
    if (real_font_size[inst_rc] > min_font_size){

      // console.log('font-size large enough')

      var inst_num_visible = num_visible_labels(params, inst_rc);

      // need to improve vert line toggling
      d3.selectAll('.horz_lines').select('line').style('display','none');
      d3.selectAll('.vert_lines').select('line').style('display','none');

      if (inst_num_visible > max_element_show){

        // d3.selectAll(params.root+' .'+inst_rc+'_label_group')
        //   // .select('text')
        //   .style('display','none');

        d3.select(params.root+' .'+inst_rc+'_label_container')
          .style('display','none')

        // d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
        //   .select('path')
        //   .style('display','none');

      } else {

        console.log(inst_rc+' showing labels: not too many labels')

        // d3.selectAll(params.root+' .'+inst_rc+'_label_group')
        //   // .select('text')
        //   .style('display','block');

        d3.select(params.root+' .'+inst_rc+'_label_container')
          .style('display','block')

        // d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
        //   .select('path')
        //   .style('display','block');

      }

    } else {

      console.log(inst_rc+' not showing labels: font too small')

      // // do not display labels if font size is too small
      // d3.selectAll(params.root+' .'+inst_rc+'_label_group')
      //   .select('text')
      //   .style('display','none');

      d3.select(params.root+' .'+inst_rc+'_label_container')
        .style('display','none')

      // d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
      //   .select('path')
      //   .style('display','none');

    }

  });
}