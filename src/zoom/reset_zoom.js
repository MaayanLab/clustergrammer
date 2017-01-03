module.exports = function(params){

  // reset zoom
  //////////////////////////////
  var zoom_y = 1;
  // var zoom_x = 1;
  var pan_dx = 0;
  var pan_dy = 0;

  var half_height = params.viz.clust.dim.height / 2;
  var center_y = -(zoom_y - 1) * half_height;

  d3.select(params.root + ' .clust_group')
    .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
    ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [pan_dx,pan_dy] + ')');

  d3.select(params.root+' .row_label_zoom_container')
    .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
    zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

  d3.select(params.root+' .row_cat_container')
    .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
    1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

  d3.select(params.root+' .row_dendro_container')
    .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
    zoom_y + ',' + zoom_y + ')' + 'translate(' + [params.viz.uni_margin/2, pan_dy] + ')');

  d3.select(params.root+' .col_zoom_container')
    .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

  d3.select(params.root+' .col_cat_container')
    .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

  d3.select(params.root+' .col_dendro_container')
    .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, params.viz.uni_margin/2] + ')');

  // reset crop button zooming
  d3.select(params.root+' .row_dendro_icons_group')
    .attr('transform', function(){
      return 'translate(0,0) scale(1)';
    });

  d3.select(params.root+' .row_dendro_icons_group')
    .selectAll('path')
    .attr('transform', function(d){
      var inst_x = 7;
      var inst_y = d.pos_mid;
      return 'translate('+ inst_x +',' + inst_y + ') ' + 'scale(1, 1)';
    });

};