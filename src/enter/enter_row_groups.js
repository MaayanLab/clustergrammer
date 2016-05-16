var enter_new_rows = require('./enter_new_rows');

module.exports = function enter_row_groups(params, delays, duration, tip){

  var row_nodes_names = params.network_data.row_nodes_names;

  // enter new rows
  var new_row_groups = d3.select(params.root+' .clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class','row')
    .attr('transform', function(d) {
      var tmp_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.viz.y_scale(tmp_index) + ')';
    })  ;

  new_row_groups
    .each( function(d){
      enter_new_rows(params, d, delays, duration, tip, this); 
    } );

};