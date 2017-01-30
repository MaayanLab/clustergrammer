var find_viz_nodes = require('../zoom/find_viz_nodes');
var make_matrix_rows = require('../matrix/make_matrix_rows');

module.exports = function show_visible_area(params){

  var viz_area = {};
  var zoom_info = params.zoom_info;

  var buffer_size = 2;

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

  // calc ds_level
  var inst_ds_level = Math.floor(zoom_info.zoom_y / params.viz.ds_zt) ;
  var old_ds_level = params.viz.ds_level;

  if (inst_ds_level > params.viz.ds_num_layers -1 ){
    // this turns off downsampling
    inst_ds_level = -1;
  }

  params.viz.ds_level = inst_ds_level;


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


  var missing_rows = _.difference(params.viz.viz_nodes.row, params.viz.viz_nodes.curr_row);

  var start_adding_back = 1;

  var show_height = 5;
  var ds_row_class = '.ds' + String(params.viz.ds_level) + '_row';

  if (inst_ds_level >= 0){
    d3.selectAll('.row').remove();
  }

  if (missing_rows.length > start_adding_back){

    d3.selectAll(ds_row_class).style('display', 'block');

    // default state for downsampling
    var inst_rows = 'all'
    var inst_matrix = params.matrix.ds_matrix[inst_ds_level];

    // if (params.viz.rect_height * params.zoom_info.zoom_y > show_height){
    if (inst_ds_level < 0){
      inst_rows = missing_rows;
      inst_matrix = params.matrix.matrix;
    }

    // update rows if level changes or if level is -1
    if (inst_ds_level != old_ds_level || inst_ds_level === -1){

      console.log('ds_level: ' + String(old_ds_level) + ' : '  + String(inst_ds_level))

      // remove old level rows
      d3.selectAll('.ds'+String(old_ds_level)+'_row').remove();

      // make new rows
      make_matrix_rows(params, inst_matrix, inst_rows, inst_ds_level);
    }

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


};