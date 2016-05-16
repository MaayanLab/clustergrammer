var utils = require('../Utils_clust');
var draw_gridlines = require('../draw_gridlines');
var add_click_hlight = require('./add_click_hlight');
var make_simple_rows = require('./make_simple_rows');
var d3_tip_custom = require('../tooltip/d3_tip_custom');

module.exports = function(params, svg_elem) {
  var network_data = params.network_data;

  var matrix = [],
  row_nodes = network_data.row_nodes,
  col_nodes = network_data.col_nodes,
  clust_group;

  var row_nodes_names = _.map(row_nodes, 'name');

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

  // d3-tooltip - for tiles
  var tip = d3_tip_custom()
    .attr('class', 'd3-tip tile_tip')
    .direction('nw')
    .offset([0, 0])
    .html(function(d){
      var inst_value = String(d.value.toFixed(3));
      var tooltip_string;

      if (params.keep_orig){
        var orig_value = String(d.value_orig.toFixed(3));
        tooltip_string = '<p>' + d.row_name + ' and ' + d.col_name + '</p>' +
        '<p> normalized value: ' + inst_value +'</p>' + 
        '<div> original value: ' + orig_value +'</div>'  ;
      } else {
        tooltip_string = '<p>' + d.row_name + ' and ' + d.col_name + '</p>' +
        '<div> value: ' + inst_value +'</div>';
      }

      return tooltip_string;
    });

  d3.select(params.root+' .clust_group')
    .call(tip);

  // clustergram background rect
  clust_group
    .append('rect')
    .classed('background',true)
    .classed('grey_background',true)
    .style('fill', '#eee')
    .style('opacity',0.25)
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);

  // make row matrix - add key names to rows in matrix
  clust_group.selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'row')
    .attr('transform', function(d) {
      var tmp_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.viz.y_scale(tmp_index) + ')';
    })
    .each(function(d){
      make_simple_rows(params, d, tip, this);
    });

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
  draw_gridlines(params, row_nodes, col_nodes);

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
