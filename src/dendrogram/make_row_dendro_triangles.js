var calc_row_dendro_triangles = require('./calc_row_dendro_triangles');
var dendro_group_highlight = require('./dendro_group_highlight');
var dendro_mouseover = require('./dendro_mouseover');
var dendro_mouseout = require('./dendro_mouseout');

module.exports = function make_row_dendro_triangles(cgm,
  is_change_group = false){

  var params = cgm.params;

  var dendro_info = calc_row_dendro_triangles(params);

  var inst_dendro_opacity;
  if (dendro_info.length > 1){
     inst_dendro_opacity = params.viz.dendro_opacity;
  } else {
     inst_dendro_opacity = 0.90;
  }

  var run_transition;
  if (d3.selectAll(params.root+' .row_dendro_group').empty()){
    run_transition = false;
  } else {
    run_transition = true;
    d3.selectAll(params.root+' .row_dendro_group').remove();
  }

  if (is_change_group){
    run_transition = false;
  }

  d3.select(params.root+' .row_dendro_container')
    .selectAll('path')
    .data(dendro_info, function(d){return d.name;})
    .enter()
    .append('path')
    .style('opacity',0)
    .attr('class', 'row_dendro_group')
    .attr('d', function(d) {

      // up triangle
      var start_x = 0 ;
      var start_y = d.pos_top;

      var mid_x = 30;
      var mid_y = d.pos_mid;

      var final_x = 0;
      var final_y = d.pos_bot;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L'
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    .style('fill','black')
    .on('mouseover', function(d){
      var inst_rc;
      if (params.sim_mat){
        inst_rc = 'both';
      } else {
        inst_rc = 'row';
      }
      dendro_mouseover(this);
      dendro_group_highlight(params, this, d, inst_rc);
    })
    .on('mouseout', function(){
      if (params.viz.inst_order.col === 'clust'){
        d3.select(this)
          .style('opacity', inst_dendro_opacity);
      }

      d3.selectAll(params.root+' .dendro_shadow')
        .remove();

      dendro_mouseout(this);
    })
    .on('click', function(d){
      row_dendro_filter_db(d, this);
    });

  var triangle_opacity;
  if (params.viz.inst_order.col === 'clust'){
    triangle_opacity = inst_dendro_opacity;
  } else {
    triangle_opacity = 0;
  }

  if (run_transition){

    d3.select(params.root+' .row_dendro_container')
      .selectAll('path')
      .transition().delay(1000).duration(1000)
      .style('opacity', triangle_opacity);

  } else {

    d3.select(params.root+' .row_dendro_container')
      .selectAll('path')
      .style('opacity', triangle_opacity);

  }

  var row_dendro_filter_db = _.debounce(row_dendro_filter, 1500);

  function row_dendro_filter(d, inst_selection){

    var names = {};
    if (cgm.params.dendro_filter.col === false){

      /* filter rows using dendrogram */
      if (cgm.params.dendro_filter.row === false){

        // // disable row ordering and dendro slider
        // d3.selectAll('.toggle_row_order .btn').attr('disabled', true);
        // $(params.root+' .slider_row').slider('disable');

        d3.select(params.root+' .slider_row')
          .style('opacity', 0.5)
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

        d3.select(inst_selection)
          .style('opacity',1);

      /* reset filter */
      } else {

        names.row = cgm.params.dendro_filter.row;

        cgm.filter_viz_using_names(names);
        cgm.params.dendro_filter.row = false;

      }

    }
  }

};