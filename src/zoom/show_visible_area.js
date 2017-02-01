var find_viz_nodes = require('../zoom/find_viz_nodes');
var make_matrix_rows = require('../matrix/make_matrix_rows');

var make_row_labels = require('../labels/make_row_labels');


module.exports = function show_visible_area(cgm, zooming_stopped=false){

  // console.log('show_visible_area stopped: ' + String(zooming_stopped));
  // debugger;

  var params = cgm.params;

  var zoom_info = params.zoom_info;

  // update ds_level if necessary
  //////////////////////////////////////////////
  var check_ds_level = params.viz.ds_level;
  var old_ds_level = params.viz.ds_level;

  // toggle the downsampling level (if necessary)
  if (params.viz.ds === null){
    check_ds_level = -1;
  } else {
    check_ds_level = Math.floor(zoom_info.zoom_y / params.viz.ds_zt) ;
    if (check_ds_level > params.viz.ds_num_layers -1 ){
      check_ds_level = -1;
    }
  }

  // check if override is necessary
  //////////////////////////////////////////////
  // force update of view if moving to more coarse view
  var override = false;

  if (old_ds_level == -1 ){
    // transitioning from real data to downsampled view
    if (check_ds_level >= 0){
      override = true;
    }
  } else {
    // transitioning to more coarse downsampling view
    if (check_ds_level < old_ds_level){
      override = true;
    }
  }

  // update level if zooming has stopped or if transitioning to more coarse view
  var new_ds_level;

  if (zooming_stopped === true || override === true){

    // update new_ds_level if necessary (if decreasing detail, zooming out)
    new_ds_level = check_ds_level;
    // set zooming_stopped to true in case of override
    zooming_stopped = true;

    params.viz.ds_level = new_ds_level;
  } else {
    // keep the old level (zooming is still occuring and not zooming out)
    new_ds_level = old_ds_level;
  }


  // toggle labels and rows
  ///////////////////////////////////////////////
  var severe_toggle = true;

  d3.selectAll(params.root+' .row')
    .style('display', function(d){
      return toggle_display(params, d, 'row', this, severe_toggle);
    });

  ///////////////////////////////////////////////


  var viz_area = {};
  var buffer_size = 5;
  // get translation vector absolute values
  viz_area.min_x = Math.abs(zoom_info.trans_x)/zoom_info.zoom_x -
                   (buffer_size + 1) * params.viz.rect_width;
  viz_area.min_y = Math.abs(zoom_info.trans_y)/zoom_info.zoom_y -
                   (buffer_size + 1) * params.viz.rect_height ;

  viz_area.max_x = Math.abs(zoom_info.trans_x)/zoom_info.zoom_x +
                   params.viz.clust.dim.width/zoom_info.zoom_x +
                   buffer_size * params.viz.rect_width;

  viz_area.max_y = Math.abs(zoom_info.trans_y)/zoom_info.zoom_y +
                      params.viz.clust.dim.height/zoom_info.zoom_y +
                      buffer_size * params.viz.rect_height ;

  // generate lists of visible rows/cols
  find_viz_nodes(params, viz_area);

  var missing_rows = _.difference(params.viz.viz_nodes.row, params.viz.viz_nodes.curr_row);

  if (params.viz.ds != null){
    var ds_row_class = '.ds' + String(params.viz.ds_level) + '_row';
    d3.selectAll(ds_row_class).style('display', 'block');
  }

  // if downsampling
  if (new_ds_level >= 0){
    d3.selectAll('.row').remove();
  }

  // default state for downsampling
  var inst_matrix;

  if (new_ds_level < 0){
    // set matrix to default matrix
    inst_matrix = params.matrix.matrix;
  } else {
    // set matrix to downsampled matrix
    inst_matrix = params.matrix.ds_matrix[new_ds_level];
  }

  if (zooming_stopped === true){

    /* run when zooming has stopped */
    d3.selectAll('.ds'+String(new_ds_level)+'_row')
      .each(function(d){
        if (_.contains(params.viz.viz_nodes.row, d.name) === false){
          d3.select(this).remove();
        }
      });

    // level change
    if (new_ds_level != old_ds_level){

      // all visible rows are missing at new downsampling level
      missing_rows = params.viz.viz_nodes.row;

      // remove old level rows
      d3.selectAll('.ds'+String(old_ds_level)+'_row').remove();

    }

  }

  // only make new matrix_rows if there are missing rows
  if (missing_rows.length >   1 || missing_rows === 'all'){
    make_matrix_rows(params, inst_matrix, missing_rows, new_ds_level);

    // only make new row_labels if there are missing rows and not downsampled
    if (new_ds_level === -1){
      make_row_labels(cgm, missing_rows);
    }
  }

  // remove row labels if necessary
  if (new_ds_level >= 0) {
    if (d3.select(params.root+' .row_label_group').empty() === false){
      d3.selectAll(params.root+' .row_label_group').remove();
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