var calc_row_dendro_triangles = require('./calc_row_dendro_triangles');
var d3_tip_custom = require('../tooltip/d3_tip_custom');
var dendro_group_highlight = require('./dendro_group_highlight');

module.exports = function make_dendro_crop_buttons(cgm, is_change_group = false){

  var params = cgm.params;

  var button_opacity = params.viz.dendro_opacity * 0.60;

  var inst_rc = 'row';

  // information needed to make dendro
  var dendro_info = calc_row_dendro_triangles(params);

  // d3-tooltip
  var tmp_y_offset = 0;
  var tmp_x_offset = -5;
  var row_dendro_crop_tip = d3_tip_custom()
    .attr('class',function(){
      // add root element to class
      var root_tip_selector = params.viz.root_tips.replace('.','');
      var class_string = root_tip_selector + ' d3-tip ' +
                         root_tip_selector +  '_row_dendro_crop_tip';

      return class_string;
    })
    .direction('nw')
    .offset([tmp_y_offset, tmp_x_offset])
    // .style('display','none')
    // .style('opacity', 0)
    .html(function(){

      var full_string = 'Click to crop cluster';
      return full_string;

    });

  // check if there are crop buttons, then remove any old ones
  var run_transition;
  if (d3.selectAll(params.root+' .row_dendro_crop_buttons').empty()){
    run_transition = false;
  } else {
    run_transition = true;
    // d3.selectAll(params.root+' .row_dendro_group').remove();
    d3.selectAll(params.root+' .row_dendro_crop_tip').remove();
  }

  if (is_change_group){
    run_transition = false;
  }

  d3.selectAll(params.root+' .row_dendro_crop_buttons')
    .remove();

  d3.select(params.root+' .row_dendro_icons_container')
    .selectAll('path')
    .data(dendro_info, function(d){return d.name;})
    .enter()
    .append('path')
    .classed('row_dendro_crop_buttons', true)
    .attr('d', function(d) {

      var tri_height = 10;

      var tmp_height = d.pos_bot - d.pos_top;
      if (tmp_height < 45){
        tri_height = tmp_height * 0.20;
      }

      // up triangle
      var start_x = 12 ;
      var start_y = -tri_height;

      var mid_x = 0;
      var mid_y = 0;

      var final_x = 12;
      var final_y = tri_height;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L'
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    // .append('text')
    // .attr('text-anchor', 'middle')
    // .attr('dominant-baseline', 'central')
    // .attr('font-family', 'FontAwesome')
    // .attr('font-size', '20px')
    // // .attr('font-weight', 'bold')
    // .text(function () {
    //   // chevron
    //   return '\uf054'
    //   // // angle right
    //   // return '\uf105';
    //   // // dot circle
    //   // return '\uf192';
    // })
    .style('cursor', 'pointer')
    .style('opacity', button_opacity)
    .attr('transform', function(d){
      var inst_translate;
      // var inst_y = String(100 * i);
      var inst_y = d.pos_mid ;
      var inst_x = 7;
      inst_translate = 'translate('+ inst_x +',' + inst_y + ')';
      return inst_translate;
    })
    .on('mouseover', function(d){

      d3.select(this)
        .classed('hovering', true);

      d3.select(this)
        .style('opacity', 0.7);

      row_dendro_crop_tip.show(d)

      dendro_group_highlight(params, this, d, inst_rc);

    })
    .on('mouseout', function(){

      d3.select(this)
        .classed('hovering', true);

      d3.selectAll(params.root+' .dendro_shadow')
        .remove();

      d3.select(this)
        .style('opacity', button_opacity);

      row_dendro_crop_tip.hide(this);

    })
    .on('click', function(d){
      console.log('cropping');
    })
    .call(row_dendro_crop_tip);


  var triangle_opacity;
  if (params.viz.inst_order.col === 'clust'){
    triangle_opacity = button_opacity;
  } else {
    triangle_opacity = 0;
  }

  if (run_transition){

    d3.select(params.root+' .row_dendro_icons_container')
      .selectAll('path')
      .style('opacity', 0)
      .transition().delay(1000).duration(1000)
      .style('opacity', triangle_opacity);

  } else {

    d3.select(params.root+' .row_dendro_icons_container')
      .selectAll('path')
      .style('opacity', triangle_opacity);

  }
};