var crossfilter = require('crossfilter');
var end_reorder = require('./end_reorder');

module.exports = function(params, inst_order, row_col) {

  params.viz.run_trans = true;

  // save order state
  if (row_col === 'row'){
    params.viz.inst_order.row = inst_order;
  } else if (row_col === 'col'){
    params.viz.inst_order.col = inst_order;
  }

  var row_nodes_obj = params.network_data.row_nodes;
  var row_nodes_names = _.pluck(row_nodes_obj, 'name');

  var col_nodes_obj = params.network_data.col_nodes;
  var col_nodes_names = _.pluck(col_nodes_obj, 'name');

  if (row_col === 'row'){
    // load orders
    if (inst_order === 'ini') {
      params.matrix.x_scale.domain(params.matrix.orders.ini_row);
    } else if (inst_order === 'clust') {
      params.matrix.x_scale.domain(params.matrix.orders.clust_row);
    } else if (inst_order === 'rank') {
      params.matrix.x_scale.domain(params.matrix.orders.rank_row);
    } else if (inst_order === 'class') {
      params.matrix.x_scale.domain(params.matrix.orders.class_row);
    }

  } else if (row_col == 'col') {
    // load orders
    if (inst_order === 'ini') {
      params.matrix.y_scale.domain(params.matrix.orders.ini_col);
    } else if (inst_order === 'clust') {
      params.matrix.y_scale.domain(params.matrix.orders.clust_col);
    } else if (inst_order === 'rank') {
      params.matrix.y_scale.domain(params.matrix.orders.rank_col);
    } else if (inst_order === 'class') {
      // params.matrix.x_scale.domain(params.matrix.orders.class_row);
      params.matrix.y_scale.domain(params.matrix.orders.class_col);
    }
  }

  // only animate transition if there are a small number of tiles
  if (d3.selectAll('.tile')[0].length < params.matrix.def_large_matrix){

    // define the t variable as the transition function
    var t = this.viz.get_clust_group()
      .transition().duration(2500);

    t.selectAll('.row')
      .attr('transform', function(d) {
        var tmp_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(tmp_index) + ')';
        })
      .selectAll('.tile')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
      });

    t.selectAll('.tile_up')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
      });

    t.selectAll('.tile_dn')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
      });

    // Move Row Labels
    d3.select(params.root+' .row_label_zoom_container')
      .selectAll('.row_label_text')
      .transition().duration(2500)
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      });

    // t.selectAll('.column')
    d3.select(params.root+' .col_zoom_container')
      .selectAll('.col_label_text')
      .transition().duration(2500)
      .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
      });

    // reorder row_label_triangle groups
    d3.selectAll('.row_viz_group')
      .transition().duration(2500)
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      });

    // reorder col_class groups
    d3.selectAll('.col_viz_group')
      .transition().duration(2500)
      .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
      });

  } else {

    // define the t variable as the transition function
    var t = this.viz.get_clust_group();

    // reorder matrix
    t.selectAll('.row')
      .attr('transform', function(d) {
        var tmp_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(tmp_index) + ')';
      })
      .selectAll('.tile')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
      });

    t.selectAll('.tile_up')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
      });

    t.selectAll('.tile_dn')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
      });

    // Move Row Labels
    d3.select(params.root+' .row_label_zoom_container')
      .selectAll('.row_label_text')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      });

    // t.selectAll('.column')
    d3.select(params.root+' .col_zoom_container')
      .selectAll('.col_label_text')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names,d.name);
        return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
      });

    // reorder row_label_triangle groups
    d3.selectAll('.row_viz_group')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names,d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      });

    // reorder col_class groups
    d3.selectAll('.col_viz_group')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names,d.name);
        return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
      });

  }

  // redefine x and y positions
  params.network_data.links.forEach(function(d){
    d.x = params.matrix.x_scale(d.target);
    d.y = params.matrix.y_scale(d.source);
  });

  // rename crossfilter
  params.cf = {};
  params.cf.links = crossfilter(params.network_data.links);
  params.cf.dim_x = params.cf.links.dimension(function(d){return d.x;});
  params.cf.dim_y = params.cf.links.dimension(function(d){return d.y;});

  // backup allow programmatic zoom
  setTimeout(end_reorder, 2500);

};
