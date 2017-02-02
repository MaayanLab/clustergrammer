var make_simple_rows = require('./make_simple_rows');
var d3_tip_custom = require('../tooltip/d3_tip_custom');

// current matrix can change with downsampling
module.exports = function make_matrix_rows(params, current_matrix,
  row_names='all', ds_level = -1){

  // console.log('make_matrix_rows');

  // defaults
  var y_scale = params.viz.y_scale;
  var make_tip = true;
  var row_class = 'row';

  if (ds_level >= 0){
    y_scale = params.viz.ds[ds_level].y_scale;
    make_tip = false;
    row_class = 'ds' + String(ds_level) + '_row';
  }


  if (make_tip){

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

  }

  // gather a subset of row data from the matrix or use all rows
  var matrix_subset = [];
  if (row_names === 'all'){
    matrix_subset = current_matrix;
  } else {
    _.each(current_matrix, function(inst_row){
      if (_.contains(row_names, inst_row.name)){
        matrix_subset.push(inst_row);
      }
    });
  }

  d3.select(params.root+ ' .clust_group')
    .selectAll('.row')
    .data(matrix_subset, function(d){return d.name;})
    .enter()
    .append('g')
    .classed(row_class, true)
    .attr('transform', function(d) {
      return 'translate(0,' + y_scale(d.row_index) + ')';
    })
    .each(function(d){
      make_simple_rows(params, d, tip, this, ds_level);
    });

};