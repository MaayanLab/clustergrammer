var utils = require('../Utils_clust');
var make_simple_rows = require('./make_simple_rows');
var d3_tip_custom = require('../tooltip/d3_tip_custom');

module.exports = function make_matrix_rows(params){

  // make rows in the matrix - add key names to rows in matrix
  /////////////////////////////////////////////////////////////
  // d3-tooltip - for tiles
  var tip = d3_tip_custom()
    .attr('class', function(){
      var root_tip_selector = params.viz.root_tips.replace('.','');
      var class_string = root_tip_selector + ' d3-tip tile_tip';
      return class_string;
    })
    .style('display','none')
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
  var row_nodes = params.network_data.row_nodes;
  var row_nodes_names = utils.pluck(row_nodes, 'name');
  d3.select(params.root+ ' .clust_group')
    .selectAll('.row')
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

};