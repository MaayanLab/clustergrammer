var find_viz_rows = require('../zoom/find_viz_rows');
var make_matrix_rows = require('../matrix/make_matrix_rows');
var make_row_labels = require('../labels/make_row_labels');
var make_row_visual_aid_triangles = require('../labels/make_row_visual_aid_triangles');
var underscore = require('underscore');

module.exports = function show_visible_area(cgm, zooming_stopped=false,
  zooming_out=false, make_all_rows=false){

  // console.log('show_visible_area stopped: ' + String(zooming_stopped));

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

    check_ds_level = Math.floor( Math.log(zoom_info.zoom_y)/Math.log(params.viz.ds_zt) ) ;

    if (check_ds_level > params.viz.ds_num_levels -1 ){
      check_ds_level = -1;
    }
  }

  // check if override_ds is necessary
  //////////////////////////////////////////////
  // force update of view if moving to more coarse view
  var override_ds = false;

  if (old_ds_level == -1 ){
    // transitioning to more coarse downsampling view (from real data)
    if (check_ds_level >= 0){
      override_ds = true;
    }
  } else {
    // transitioning to more coarse downsampling view
    if (check_ds_level < old_ds_level){
      override_ds = true;
    }
  }

  // update level if zooming has stopped or if transitioning to more coarse view
  var new_ds_level;

  if (zooming_stopped === true || override_ds === true){

    // update new_ds_level if necessary (if decreasing detail, zooming out)
    new_ds_level = check_ds_level;

    // set zooming_stopped to true in case of override_ds
    zooming_stopped = true;

    params.viz.ds_level = new_ds_level;
  } else {
    // keep the old level (zooming is still occuring and not zooming out)
    new_ds_level = old_ds_level;
  }

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
  find_viz_rows(params, viz_area);

  var missing_rows;
  if (make_all_rows === false){
    missing_rows = underscore.difference(params.viz.viz_nodes.row, params.viz.viz_nodes.curr_row);
  } else {
    // make all rows (reordering)
    missing_rows = 'all';

    // remove downsampled rows
    d3.selectAll(params.root+' .ds'+String(new_ds_level)+'_row')
      .remove();
  }

  if (params.viz.ds != null){
    var ds_row_class = '.ds' + String(params.viz.ds_level) + '_row';
    d3.selectAll(ds_row_class).style('display', 'block');
  }

  // if downsampling
  if (new_ds_level >= 0){
    // remove old rows
    d3.selectAll(params.root+' .row').remove();
    // remove tile tooltips and row tooltips
    d3.selectAll(params.viz.root_tips + '_tile_tip').remove();
    d3.selectAll(params.viz.root_tips + '_row_tip').remove();

  }

  // default state for downsampling
  var inst_matrix;

  if (new_ds_level < 0){
    // set matrix to default matrix
    inst_matrix = params.matrix.matrix;

    // make row visual-aid triangles
    make_row_visual_aid_triangles(params);

  } else {
    // set matrix to downsampled matrix
    inst_matrix = params.matrix.ds_matrix[new_ds_level];

    d3.selectAll(params.root+' .row_cat_group path')
      .remove();
  }

  // also remove row visual aid triangles if zooming out
  if (zooming_out === true){
    d3.selectAll(params.root+' .row_cat_group path')
      .remove();
  }

  // remove rows and labels that are not visible and change ds_level
  /* run when zooming has stopped */
  if (zooming_stopped === true){

    // remove not visible matrix rows
    if (new_ds_level >= 0){

      // remove downsampled rows
      d3.selectAll(params.root+' .ds'+String(new_ds_level)+'_row')
        .each(function(d){
          if (underscore.contains(params.viz.viz_nodes.row, d.name) === false){
            d3.select(this).remove();
          }
        });

    } else {
      // remove real data rows
      d3.selectAll(params.root+' .row')
        .each(function(d){
          if (underscore.contains(params.viz.viz_nodes.row, d.name) === false){
            d3.select(this).remove();
          }
        });
    }

    // remove not visible row labels
    d3.selectAll(params.root+' .row_label_group')
      .each(function(d){
        if (underscore.contains(params.viz.viz_nodes.row, d.name) === false){
          d3.select(this).remove();
        }
      });

    // level change
    if (new_ds_level != old_ds_level){

      // console.log('old: ' + String(old_ds_level) + ' new: '+ String(new_ds_level));

      // all visible rows are missing at new downsampling level
      missing_rows = params.viz.viz_nodes.row;

      // remove old level rows
      d3.selectAll(params.root+' .ds'+String(old_ds_level)+'_row').remove();

    }

  }

  // console.log('missing_rows: ' + String(missing_rows))
  // console.log(missing_rows)

  // only make new matrix_rows if there are missing rows
  if (missing_rows.length >= 1 || missing_rows === 'all'){
    make_matrix_rows(params, inst_matrix, missing_rows, new_ds_level);
  }

  // only make new row_labels if there are missing row_labels, downsampled, and
  // not zooming out or zooming has stopped
  if (new_ds_level === -1){

    if (zooming_out === false || zooming_stopped){

      // check if labels need to be made
      ///////////////////////////////////
      // get the names visible row_labels
      var visible_row_labels = [];
      d3.selectAll(params.root+' .row_label_group')
        .each(function(d){
          visible_row_labels.push(d.name);
        });

      // find missing labels
      var missing_row_labels = underscore.difference(params.viz.viz_nodes.row, visible_row_labels);

      // make labels
      //////////////////////////////////
      // only make row labels if there are any missing
      var addback_thresh= 1;
      if (missing_row_labels.length > addback_thresh){
        make_row_labels(cgm, missing_row_labels);
      }
    }

  }

};