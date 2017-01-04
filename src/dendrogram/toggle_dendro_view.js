var make_dendro_triangles = require('../dendrogram/make_dendro_triangles');

module.exports = function toggle_dendro_view(cgm, inst_rc, wait_time = 1500){

  var params = cgm.params;

  // row and col are reversed
  if (inst_rc === 'row'){
    if (params.viz.inst_order.col === 'clust'){
      // the last true tells the viz that I'm chaning group size and not to
      // delay the change in dendro
      setTimeout( make_dendro_triangles, wait_time, cgm, 'row', true);
    }
  }

  if (inst_rc === 'col'){
    if (params.viz.inst_order.row === 'clust'){
      setTimeout( make_dendro_triangles, wait_time, cgm, 'col', true);
    }
  }

  if (params.viz.inst_order.row != 'clust' && params.viz.dendro_filter.col === false){
    d3.selectAll(params.root+' .col_dendro_group')
      .style('opacity',0)
      .on('mouseover',null)
      .on('mouseout',null);

    d3.select(params.root+' .col_slider_group')
      .style('opacity', 0);

    // toggle crop buttons
    d3.selectAll(params.root+' .col_dendro_crop_buttons')
      .style('opacity',0)
      .on('mouseover', null)
      .on('mouseout', null);

  }

  if (params.viz.inst_order.col != 'clust' && params.viz.dendro_filter.row === false){

    d3.selectAll(params.root+' .row_dendro_group')
      .style('opacity',0)
      .on('mouseover',null)
      .on('mouseout',null)
      .on('click', null);

    d3.select(params.root+' .row_slider_group')
      .style('opacity', 0);

    // toggle crop buttons
    d3.selectAll(params.root+' .row_dendro_crop_buttons')
      .style('opacity',0)
      .on('mouseover', null)
      .on('mouseout', null);

  }
};