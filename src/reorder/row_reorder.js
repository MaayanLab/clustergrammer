var reposition_tile_highlight = require('./reposition_tile_highlight');
var toggle_dendro_view = require('../dendrogram/toggle_dendro_view');
var show_visible_area = require('../zoom/show_visible_area');

module.exports = function row_reorder(params, row_selection, inst_row) {

  params.viz.inst_order.row = 'custom';
  toggle_dendro_view(params, 'col');

  d3.selectAll(params.root+' .col_dendro_group').style('opacity',0);

  d3.selectAll(params.root+' .toggle_col_order .btn')
    .classed('active',false);

  // // get inst row (gene)
  // var inst_row = d3.select(row_selection).select('text').text();

  params.viz.run_trans = true;

  var mat       = params.matrix.matrix;
  var row_nodes = params.network_data.row_nodes;
  var col_nodes = params.network_data.col_nodes;

  var col_nodes_names = _.map(col_nodes, 'name');

  // find the index of the row
  var tmp_arr = [];
  row_nodes.forEach(function(node) {
    tmp_arr.push(node.name);
  });

  // find index
  inst_row = _.indexOf(tmp_arr, inst_row);

  // gather the values of the input genes
  tmp_arr = [];
  col_nodes.forEach(function(node, index) {
    tmp_arr.push( mat[inst_row].row_data[index].value);
  });

  // sort the rows
  var tmp_sort = d3.range(tmp_arr.length).sort(function(a, b) {
    return tmp_arr[b] - tmp_arr[a];
  });

  // resort cols
  params.viz.x_scale.domain(tmp_sort);

  var t;

  // reorder matrix
  ////////////////////
  if (params.network_data.links.length > params.matrix.def_large_matrix){

    // define the t variable as the transition function
    t = d3.select(params.root + ' .clust_group');

    // Move Col Labels
    d3.select(params.root+' .col_zoom_container')
      .selectAll('.col_label_text')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.viz.x_scale(inst_index) + ')rotate(-90)';
      });

    // reorder col_class groups
    d3.selectAll(params.root+' .col_cat_group')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
      });

  } else {

    // define the t variable as the transition function
    t = d3.select(params.root + ' .clust_group').transition().duration(2500);

    // Move Col Labels
    d3.select(params.root+' .col_zoom_container')
      .selectAll('.col_label_text')
      .transition().duration(2500)
      .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.viz.x_scale(inst_index) + ')rotate(-90)';
      });

    // reorder col_class groups
    d3.selectAll(params.root+' .col_cat_group')
      .transition().duration(2500)
      .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
      });

  }

  // reorder matrix
  t.selectAll('.tile')
    .attr('transform', function(d) {
      return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
    });

  t.selectAll('.tile_up')
    .attr('transform', function(d) {
      return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
    });

  t.selectAll('.tile_dn')
    .attr('transform', function(d) {
      return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
    });


  // highlight selected column
  ///////////////////////////////
  // unhilight and unbold all columns (already unbolded earlier)
  d3.selectAll(params.root+' .row_label_group')
    .select('rect')
    .style('opacity', 0);
  // highlight column name
  d3.select(row_selection)
    .select('rect')
    .style('opacity', 1);

  reposition_tile_highlight(params);

  // redefine x and y positions
  params.network_data.links.forEach(function(d){
    d.x = params.viz.x_scale(d.target);
    d.y = params.viz.y_scale(d.source);
  });

  // reset visible area 
  var zoom_info = {};
  zoom_info.zoom_x = 1;
  zoom_info.zoom_y = 1;
  zoom_info.trans_x = 0;
  zoom_info.trans_y = 0;
  show_visible_area(params, zoom_info);

  setTimeout(function(){
    params.viz.run_trans = false;
  }, 2500);

};
