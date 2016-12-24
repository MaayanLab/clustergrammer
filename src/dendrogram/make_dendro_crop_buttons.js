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
  }

  // d3.selectAll(params.root+' .row_dendro_crop_tip').remove();
  d3.selectAll( params.viz.root_tips + '_row_dendro_crop_tip').remove();

  if (is_change_group){
    run_transition = false;
  }

  d3.selectAll(params.root+' .row_dendro_crop_buttons')
    .remove();

  var inst_x;
  var icons;

  // make crop buttons or undo buttons
  if (d3.select('.row_dendro_icons_container').classed('ran_filter') === false){

    // append path
    icons = d3.select(params.root+' .row_dendro_icons_container')
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
      });

      inst_x = 7;

  } else {

    // trantiion in undo icon always
    run_transition = true;

    // append icon
    icons = d3.select(params.root+' .row_dendro_icons_container')
      .selectAll('text')
      .data(dendro_info, function(d){return d.name;})
      .enter()
      // append undo icon
      .append('text')
      .classed('row_dendro_crop_buttons', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-family', 'FontAwesome')
      .attr('font-size', '20px')
      // .attr('font-weight', 'bold')
      .text(function () {
        // // chevron
        // return '\uf054'
        // // angle right
        // return '\uf105';
        // // dot circle
        // return '\uf192';
        // undo
        return '\uf0e2';
      });

      inst_x = 15;
  }

  icons
    .style('cursor', 'pointer')
    .style('opacity', button_opacity)
    .attr('transform', function(d){
      var inst_translate;
      // var inst_y = String(100 * i);
      var inst_y = d.pos_mid ;
      inst_translate = 'translate('+ inst_x +',' + inst_y + ')';
      return inst_translate;
    })
    .on('mouseover', function(d){

      d3.select(this)
        .classed('hovering', true);

      row_dendro_crop_tip.show(d);

      dendro_group_highlight(params, this, d, inst_rc);

      // need to improve
      d3.selectAll( params.viz.root_tips + '_row_dendro_crop_tip')
        .style('opacity', 1)
        .style('display', 'block');

    })
    .on('mouseout', function(){

      d3.select(this)
        .classed('hovering', false);

      d3.selectAll(params.root+' .dendro_shadow')
        .remove();

      d3.select(this)
        .style('opacity', button_opacity);

      row_dendro_crop_tip.hide(this);

      // // need to improve
      // d3.selectAll( params.viz.root_tips + '_row_dendro_crop_tip')
      //   .style('opacity', 0)
      //   .style('display', 'none');

    })
    .on('click', function(d){

      // give user visual cue
      d3.select(this)
        .style('opacity', 0.9)
        .style('fill', 'blue')
        .transition()
        .duration(1000)
        .style('opacity', 0);

      /* filter rows using dendrogram */
      if (cgm.params.dendro_filter.row === false &&
          cgm.params.cat_filter.row === false &&
          cgm.params.cat_filter.col === false
        ){

        // use class as 'global' variable
        d3.select(cgm.params.root+' .row_dendro_icons_container')
          .classed('ran_filter', true);

      } else {
        // use class as 'global' variable
        d3.select(cgm.params.root+' .row_dendro_icons_container')
          .classed('ran_filter', false);
      }

      row_dendro_filter(cgm, d);

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

   d3.select(params.root+' .row_dendro_icons_container')
      .selectAll('text')
      .style('opacity', 0)
      .transition().delay(1000).duration(1000)
      .style('opacity', triangle_opacity);

  } else {

    d3.select(params.root+' .row_dendro_icons_container')
      .selectAll('path')
      .style('opacity', triangle_opacity);

  }

  function row_dendro_filter(cgm, d){

    var names = {};
    if (cgm.params.dendro_filter.col === false){

      if (cgm.params.dendro_filter.row === false &&
          cgm.params.cat_filter.row === false &&
          cgm.params.cat_filter.col === false
        ){

        // d3.select(params.root+' .slider_row')
        d3.select(params.root+' .row_slider_group')
          .style('opacity', 0.35)
          .style('pointer-events','none');

        names.row = d.all_names;

        var tmp_names = cgm.params.network_data.row_nodes_names;

        // keep a backup of the inst_view
        var inst_row_nodes = cgm.params.network_data.row_nodes;
        var inst_col_nodes = cgm.params.network_data.col_nodes;

        cgm.filter_viz_using_names(names);

        cgm.params.inst_nodes.row_nodes = inst_row_nodes;
        cgm.params.inst_nodes.col_nodes = inst_col_nodes;

        d3.selectAll(params.root+' .dendro_shadow')
          .transition()
          .duration(1000)
          .style('opacity',0)
          .remove();

        // keep the names of all the rows
        cgm.params.dendro_filter.row = tmp_names;

      /* reset filter */
      } else {

        names.row = cgm.params.dendro_filter.row;

        cgm.filter_viz_using_names(names);
        cgm.params.dendro_filter.row = false;

      }

    }
  }

};