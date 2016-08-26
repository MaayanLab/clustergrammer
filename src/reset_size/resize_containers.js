module.exports = function resize_containers(params){

  // reposition matrix
  d3.select(params.root+' .clust_container')
    .attr('transform', 'translate(' +
      params.viz.clust.margin.left + ',' +
      params.viz.clust.margin.top + ')');

  // reposition col container
  d3.select(params.root+' .col_label_outer_container')
    .attr('transform', 'translate(0,' + params.viz.norm_labels.width.col + ')');

  // reposition col_viz container
  d3.select(params.root+' .col_cat_outer_container')
    .attr('transform', function() {
        var inst_offset = params.viz.norm_labels.width.col + 2;
        return 'translate(0,' + inst_offset + ')';
      });

};