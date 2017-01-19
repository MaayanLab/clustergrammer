var enter_new_rows = require('./enter_new_rows');

module.exports = function enter_row_groups(params, delays, duration, tip){

  // enter new rows
  var new_row_groups = d3.select(params.root+' .clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .enter()
    .append('g')
    .classed('row', true)
    .attr('transform', function(d) {
      return 'translate(0,' + params.viz.y_scale(d.row_index) + ')';
    })  ;

  new_row_groups
    .each( function(d){
      enter_new_rows(params, d, delays, duration, tip, this);
    } );

};