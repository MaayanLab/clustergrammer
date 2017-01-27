var find_viz_nodes = require('../zoom/find_viz_nodes');
var make_matrix_rows = require('../matrix/make_matrix_rows');

module.exports = function show_visible_area(params){

  console.log('show_visible_area')

  var viz_area = {};
  var zoom_info = params.zoom_info;

  var buffer_size = 5;

  // get translation vector absolute values
  viz_area.min_x = Math.abs(zoom_info.trans_x)/zoom_info.zoom_x -
                   buffer_size * params.viz.rect_width;
  viz_area.min_y = Math.abs(zoom_info.trans_y)/zoom_info.zoom_y -
                   buffer_size * params.viz.rect_height ;

  viz_area.max_x = Math.abs(zoom_info.trans_x)/zoom_info.zoom_x +
                   params.viz.clust.dim.width/zoom_info.zoom_x +
                   buffer_size * params.viz.rect_width;

  viz_area.max_y = Math.abs(zoom_info.trans_y)/zoom_info.zoom_y +
                      params.viz.clust.dim.height/zoom_info.zoom_y +
                      buffer_size * params.viz.rect_height ;

  // generate lists of visible rows/cols
  find_viz_nodes(params, viz_area);

  // toggle labels and rows
  ///////////////////////////////////////////////
  var severe_toggle = true;
  var normal_toggle = false;
  d3.selectAll(params.root+' .row_label_group')
    .style('display', function(d){
      return toggle_display(params, d, 'row', this, normal_toggle);
    });

  d3.selectAll(params.root+' .row')
    .style('display', function(d){
      return toggle_display(params, d, 'row', this, severe_toggle);
    });

  // toggle col labels
  d3.selectAll(params.root+' .col_label_text')
    .style('display', function(d){
      return toggle_display(params, d, 'col', this, normal_toggle);
    });

  var missing_rows = _.difference(params.viz.viz_nodes.row, params.viz.viz_nodes.curr_row);

  var start_adding_back = 1;

  if (missing_rows.length > start_adding_back){
    var is_ds = true;
    // missing_rows = 'all';
    // make_matrix_rows(params, params.matrix.ds_matrix, missing_rows, true);
  }

  function toggle_display(params, d, inst_rc, inst_selection, severe_toggle=false){
    var inst_display = 'none';

    if (_.contains(params.viz.viz_nodes[inst_rc], d.name)){
      inst_display = 'block';
    } else {

      if (severe_toggle){
        // severe toggle
        d3.select(inst_selection).remove();
      }

    }
    return inst_display;
  }


  var missing_rows = _.difference(params.viz.viz_nodes.row, params.viz.viz_nodes.curr_row);

  var start_adding_back = 1;

  if (missing_rows.length > start_adding_back){

    if (params.viz.rect_height * params.zoom_info.zoom_y > 5){
      var is_ds = true;
      make_matrix_rows(params, params.matrix.matrix, missing_rows, false);

      d3.selectAll('.ds_row').style('display', 'none');
    } else {
      d3.selectAll('.ds_row').style('display', 'block');
      d3.selectAll('.row').remove();
    }

    // var is_ds = true;
    // make_matrix_rows(params, params.matrix.ds_matrix, 'all', is_ds);

  }

  // return viz_area;

};