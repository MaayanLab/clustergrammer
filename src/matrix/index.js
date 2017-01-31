var utils = require('../Utils_clust');
var draw_gridlines = require('../matrix/draw_gridlines');
var add_click_hlight = require('./add_click_hlight');
var make_matrix_rows = require('./make_matrix_rows');

module.exports = function(params, svg_elem) {
  var network_data = params.network_data;

  var matrix = [];
  var clust_group;

  // append a group that will hold clust_group and position it once
  clust_group = svg_elem
    .append('g')
    .attr('class','clust_container')
    .attr('transform', 'translate(' +
      params.viz.clust.margin.left + ',' +
      params.viz.clust.margin.top + ')')
    .append('g')
    .attr('class', 'clust_group')
    .classed('clust_group',true);


  // clustergram background rect
  clust_group
    .append('rect')
    .classed('background',true)
    .classed('grey_background',true)
    .style('fill', '#eee')
    .style('opacity',0.25)
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);

  // pass in params and the rows (row_nodes) that need to be made
  // in this case all row nodes
  // make_matrix_rows(params, params.matrix.matrix, params.network_data.row_nodes_names);

  // initialize at ds_level 0
  if (params.viz.ds === null){
    // do not use downsampled matrix
    make_matrix_rows(params, params.matrix.matrix, 'all', params.viz.ds_level);
  } else {
    // use downsampled matrix
    make_matrix_rows(params, params.matrix.ds_matrix[0], 'all', params.viz.ds_level);
  }

  // add callback function to tile group - if one is supplied by the user
  if (typeof params.click_tile === 'function') {
    d3.selectAll(params.root+' .tile')
    .on('click', function(d) {

      // export row/col name and value from tile
      var tile_info = {};
      tile_info.row = params.network_data.row_nodes[d.pos_y].name;
      tile_info.col = params.network_data.col_nodes[d.pos_x].name;
      tile_info.value = d.value;

      if (utils.has(d, 'value_up')) {
        tile_info.value_up = d.value_up;
      }
      if (utils.has(d, 'value_dn')) {
        tile_info.value_dn = d.value_dn;
      }
      if (utils.has(d, 'info')) {
        tile_info.info = d.info;
      }
      // run the user supplied callback function
      params.click_tile(tile_info);
      add_click_hlight(params, this);

    });

  } else {

    // highlight clicked tile
    if (params.tile_click_hlight){
      d3.selectAll(params.root+' .tile')
        .on('click',function() {
          add_click_hlight(params, this);
        });
    }
  }

  // draw grid lines after drawing tiles
  var delays = {};
  var duration = 0;
  delays.enter = 0;
  draw_gridlines(params, delays, duration);

  // Matrix API
  return {
    get_clust_group: function() {
      return clust_group;
    },
    get_matrix: function(){
      return matrix;
    },
    get_nodes: function(type){
      if (type === 'row') {
        return network_data.row_nodes;
      }
      return network_data.col_nodes;
    }
  };

};
