var toggle_dendro_view = require('../dendrogram/toggle_dendro_view');
// var show_visible_area = require('../zoom/show_visible_area');
var ini_zoom_info = require('../zoom/ini_zoom_info');
var fine_position_tile = require('../matrix/fine_position_tile');

module.exports = function(cgm, inst_order, inst_rc) {

  var params = cgm.params;

  console.log('all_reorder')

  // row/col names are swapped, will improve later
  var other_rc;
  if (inst_rc==='row'){
    other_rc = 'col';
  } else if (inst_rc === 'col'){
    other_rc = 'row';
  }

  params.viz.run_trans = true;

  // save order state
  if (other_rc === 'row'){
    params.viz.inst_order.row = inst_order;
  } else if (other_rc === 'col'){
    params.viz.inst_order.col = inst_order;
  }

  if (params.viz.show_dendrogram){
    toggle_dendro_view(cgm, inst_rc);
  }

  if (other_rc === 'row'){

    params.viz.x_scale
      .domain( params.matrix.orders[ params.viz.inst_order.row + '_row' ] );

  } else if (other_rc == 'col') {

    params.viz.y_scale
      .domain( params.matrix.orders[ params.viz.inst_order.col + '_col' ] );

  }

  var t;

  // only animate transition if there are a small number of tiles
  if (d3.selectAll(params.root+' .tile')[0].length < params.matrix.def_large_matrix){
    t = d3.select(params.root+' .viz_svg')
      .transition().duration(2500);
  } else {
    t = d3.select(params.root+' .viz_svg');
  }

  t.selectAll('.row')
    .attr('transform', function(d) {
      return 'translate(0,' + params.viz.y_scale(d.row_index) + ')';
      })
    .selectAll('.tile')
    .attr('transform', function(d) {
      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
    });

  t.selectAll('.tile_up')
    .attr('transform', function(d) {
      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
    });

  t.selectAll('.tile_dn')
    .attr('transform', function(d) {
      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
    });

  // Move Row Labels
  t.select('.row_label_zoom_container')
    .selectAll('.row_label_group')
    .attr('transform', function(d) {
      return 'translate(0,' + params.viz.y_scale(d.row_index) + ')';
    });

  // Move Col Labels
  t.select('.col_zoom_container')
    .selectAll('.col_label_text')
    .attr('transform', function(d) {
      return 'translate(' + params.viz.x_scale(d.col_index) + ') rotate(-90)';
    });

  // reorder row categories
  t.selectAll('.row_cat_group')
    .attr('transform', function(d) {
      return 'translate(0,' + params.viz.y_scale(d.row_index) + ')';
    });

  // reorder col_class groups
  t.selectAll('.col_cat_group')
    .attr('transform', function(d) {
      return 'translate(' + params.viz.x_scale(d.col_index) + ',0)';
    });


  // redefine x and y positions
  params.network_data.links.forEach(function(d){
    d.x = params.viz.x_scale(d.target);
    d.y = params.viz.y_scale(d.source);
  });

  params.zoom_info = ini_zoom_info();

  // show_visible_area(cgm);

  setTimeout(function(){
    params.viz.run_trans = false;
  }, 2500);


};
