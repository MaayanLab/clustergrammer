/* VizParams Module
*/
function VizParams(config){

  var params = initialize_visualization(config)

  // Define Visualization Dimensions
  function initialize_visualization(config) {

    // initialize params object from config
    var params = config;

    // Label Paramsters
    params.labels = {};
    params.labels.col_overflow = config.col_overflow;
    params.labels.row_overflow = config.row_overflow;
    params.labels.super_labels = config.super_labels;
    // Super Labels Detais
    if (params.labels.super_labels) {
      params.labels.super_label_width = 20;
      params.labels.super = {};
      params.labels.super.row = config.super.row;
      params.labels.super.col = config.super.col;
    } else {
      params.labels.super_label_width = 0;
    }
    // optional classification
    params.labels.show_categories = config.show_categories;
    if (params.labels.show_categories){
      params.labels.class_colors = config.class_colors;
    }

    // Matrix Options
    params.matrix = {};
    params.matrix.tile_colors = config.tile_colors;
    params.matrix.bar_colors = config.bar_colors;
    params.matrix.hlight_color = config.highlight_color
    params.matrix.tile_title = config.tile_title;

    // Visualization Options
    params.viz = {};
    params.viz.svg_div_id = config.svg_div_id;
    params.viz.do_zoom = config.do_zoom;
    params.viz.resize = config.resize;
    // background colors
    params.viz.background_color = config.background_color;
    params.viz.super_border_color = config.super_border_color;
    // margin widths
    params.viz.outer_margins = config.outer_margins;
    params.viz.outer_margins_expand = config.outer_margins_expand;
    params.viz.expand = config.ini_expand;
    params.viz.uni_margin = config.uni_margin;
    params.viz.grey_border_width = config.grey_border_width;
    params.viz.show_dendrogram = config.show_dendrogram;
    params.viz.tile_click_hlight = config.tile_click_hlight;

    // initialized clicked tile and rows
    params.matrix.click_hlight_x = -666;
    params.matrix.click_hlight_y = -666;
    params.matrix.click_hlight_row = -666;
    params.matrix.click_hlight_col = -666;

    // initial order of clustergram
    params.viz.inst_order = config.inst_order;

    params.matrix.opacity_function = config.opacity_scale;

    // not initialized in expand state
    // params.viz.expand = false;
    if (params.viz.expand === true){
      d3.select('#clust_instruct_container')
        .style('display','none');
    }
    params.viz.expand_button = config.expand_button;

    // pass network_data to params
    params.network_data = config.network_data;

    var network_data = params.network_data;

    // resize based on parent div
    parent_div_size_pos(params);

    params.viz.parent_div_size_pos = parent_div_size_pos;

    // Variable Label Widths
    // based on the length of the row/col labels - longer labels mean more space given
    // get row col data
    var col_nodes = network_data.col_nodes;
    var row_nodes = network_data.row_nodes;

    // find the label with the most characters and use it to adjust the row and col margins
    var row_max_char = _.max(row_nodes, function(inst) { return inst.name.length; }).name.length;
    var col_max_char = _.max(col_nodes, function(inst) { return inst.name.length; }).name.length;

    // define label scale parameters: the more characters in the longest name, the larger the margin
    var min_num_char = 5;
    var max_num_char = 60;
    var min_label_width = 120;
    var max_label_width = 320;
    var label_scale = d3.scale.linear()
      .domain([min_num_char, max_num_char])
      .range([min_label_width, max_label_width]).clamp('true');

    // rotated column labels - approx trig
    params.norm_label = {};
    params.norm_label.width = {};


    // allow the user to increase or decrease the overall size of the labels
    params.norm_label.width.row = label_scale(row_max_char) * config.row_label_scale;
    params.norm_label.width.col = label_scale(col_max_char) * params.col_label_scale;

    // normal label margins
    params.norm_label.margin = {};
    params.norm_label.margin.left = params.viz.grey_border_width + params.labels.super_label_width;
    params.norm_label.margin.top = params.viz.grey_border_width + params.labels.super_label_width;

    // row groups - only add if the rows have a group attribute
    // Define the space needed for the classification of rows - includes classification triangles and rects
    params.class_room = {};
    if (params.viz.show_dendrogram) {
      // make room for group rects
      params.class_room.row = 18;
      params.class_room.col = 9;
      // the width of the classification triangle or group rectangle
      params.class_room.symbol_width = 9;

      config.group_level = {
        row: 5,
        col: 5
      };

    } else {
      // do not make room for group rects
      params.class_room.row = 9;
      params.class_room.col = 0;
      // the width of the classification triangle or group rectangle
      params.class_room.symbol_width = 9;
    }

    // norm label background width, norm-label-width plus class-width plus margin
    params.norm_label.background = {};
    params.norm_label.background.row = params.norm_label.width.row + params.class_room.row + params.viz.uni_margin;
    params.norm_label.background.col = params.norm_label.width.col + params.class_room.col + params.viz.uni_margin;

    // clustergram dimensions
    params.viz.clust= {};
    params.viz.clust.margin = {};
    // clust margin is the margin of the norm_label plus the width of the entire norm_label group
    params.viz.clust.margin.left = params.norm_label.margin.left + params.norm_label.background.row;
    params.viz.clust.margin.top = params.norm_label.margin.top + params.norm_label.background.col;

    // svg size: less than svg size
    ///////////////////////////////////
    // 0.8 approximates the trigonometric distance required for hiding the spillover
    params.viz.spillover_x_offset = label_scale(col_max_char) * 0.6 * params.col_label_scale;

    // get height and width from parent div
    params.viz.svg_dim = {};
    params.viz.svg_dim.width  = Number(d3.select('#' + params.viz.svg_div_id).style('width').replace('px', ''));
    params.viz.svg_dim.height = Number(d3.select('#' + params.viz.svg_div_id).style('height').replace('px', ''));


    // reduce width by row/col labels and by grey_border width (reduce width by less since this is less aparent with slanted col labels)
    var ini_clust_width = params.viz.svg_dim.width - (params.labels.super_label_width +
      params.norm_label.width.row + params.class_room.row) - params.viz.grey_border_width - params.viz.spillover_x_offset;

    // there is space between the clustergram and the border
    var ini_clust_height = params.viz.svg_dim.height - (params.labels.super_label_width +
      params.norm_label.width.col + params.class_room.col) - 5 * params.viz.grey_border_width;

    params.viz.num_col_nodes = col_nodes.length;
    params.viz.num_row_nodes = row_nodes.length;

    // clust_dim - clustergram dimensions (the clustergram is smaller than the svg)
    params.viz.clust.dim = {};

    // clustergram height
    ////////////////////////
    // ensure that rects are never taller than they are wide
    // force square tiles
    if (ini_clust_width / params.viz.num_col_nodes < ini_clust_height / params.viz.num_row_nodes) {

      // scale the height
      params.viz.clust.dim.height = ini_clust_width * (params.viz.num_row_nodes / params.viz.num_col_nodes );

      // keep track of whether or not a force square has occurred
      // so that I can adjust the font accordingly
      params.viz.force_square = 1;

      // make sure that force_square does not cause the entire visualization
      // to be taller than the svg, if it does, then undo
      if (params.viz.clust.dim.height > ini_clust_height) {
      // make the height equal to the width
      params.viz.clust.dim.height = ini_clust_height;
      // keep track of whether or not a force square has occurred
      params.viz.force_square = 0;
      }
    }
    // do not force square tiles
    else {
      // the height will be calculated normally - leading to wide tiles
      params.viz.clust.dim.height = ini_clust_height;
      // keep track of whether or not a force square has occurred
      params.viz.force_square = 0;
    }

    // manual force square
    if (config.force_square===1){
      params.viz.force_square = 1;
    }

    // Define Orderings
    ////////////////////////////

    // Define Orderings
    params.matrix.orders = {
      // ini
      ini_row: d3.range(params.viz.num_col_nodes).sort(function(a, b) {
        return col_nodes[b].ini - col_nodes[a].ini;
      }),
      ini_col: d3.range(params.viz.num_row_nodes).sort(function(a, b) {
        return row_nodes[b].ini - row_nodes[a].ini;
      }),
      // rank
      rank_row: d3.range(params.viz.num_col_nodes).sort(function(a, b) {
        return col_nodes[b].rank - col_nodes[a].rank;
      }),
      rank_col: d3.range(params.viz.num_row_nodes).sort(function(a, b) {
        return row_nodes[b].rank - row_nodes[a].rank;
      }),
      // clustered
      clust_row: d3.range(params.viz.num_col_nodes).sort(function(a, b) {
        return col_nodes[b].clust - col_nodes[a].clust;
      }),
      clust_col: d3.range(params.viz.num_row_nodes).sort(function(a, b) {
        return row_nodes[b].clust - row_nodes[a].clust;
      }),
      // class
      class_row: d3.range(params.viz.num_col_nodes).sort(function(a, b) {
        return col_nodes[b].cl - col_nodes[a].cl;
      }),
      class_col: d3.range(params.viz.num_row_nodes).sort(function(a, b) {
        return row_nodes[b].cl - row_nodes[a].cl;
      })
    };

    // the visualization dimensions can be smaller than the svg
    // columns need to be shrunk for wide screens
    var min_col_shrink_scale = d3.scale.linear().domain([100,1500]).range([1,0.1]).clamp('true');
    var min_col_shrink = min_col_shrink_scale(params.viz.svg_dim.width);

    // calculate clustergram width
    // reduce clustergram width if triangles are taller than the normal width
    // of the columns
    var tmp_x_scale = d3.scale.ordinal().rangeBands([0, ini_clust_width]);
    tmp_x_scale.domain(params.matrix.orders.ini_row);
    var triangle_height = tmp_x_scale.rangeBand()/2 ;
    if (triangle_height > params.norm_label.width.col){
      ini_clust_width = ini_clust_width * ( params.norm_label.width.col/triangle_height );
    }
    params.viz.clust.dim.width = ini_clust_width ;


    // scaling functions to position rows and tiles, define rangeBands
    params.matrix.x_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.width]);
    params.matrix.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);

    // Assign initial ordering for x_scale and y_scale
    if (params.viz.inst_order === 'ini') {
      params.matrix.x_scale.domain(params.matrix.orders.ini_row);
      params.matrix.y_scale.domain(params.matrix.orders.ini_col);
    } else if (params.viz.inst_order === 'clust') {
      params.matrix.x_scale.domain(params.matrix.orders.clust_row);
      params.matrix.y_scale.domain(params.matrix.orders.clust_col);
    } else if (params.viz.inst_order === 'rank') {
      params.matrix.x_scale.domain(params.matrix.orders.rank_row);
      params.matrix.y_scale.domain(params.matrix.orders.rank_col);
    } else if (params.viz.inst_order === 'class') {
      params.matrix.x_scale.domain(params.matrix.orders.class_row);
      params.matrix.y_scale.domain(params.matrix.orders.class_col);
    }

    // visualization parameters
    //////////////////////////////

    // border_width - width of white borders around tiles
    params.viz.border_width = params.matrix.x_scale.rangeBand() / 40;

    // zoom_switch from 1 to 2d zoom
    params.viz.zoom_switch = (params.viz.clust.dim.width / params.viz.num_col_nodes) / (params.viz.clust.dim.height / params.viz.num_row_nodes);

    // zoom_switch can not be less than 1
    if (params.viz.zoom_switch < 1) {
      params.viz.zoom_switch = 1;
    }

    // font size controls
    ////////////////////////////
    // min and max number of expected nodes
    var min_node_num = 10;
    var max_node_num = 3000;

    // min and max expected screen widths
    var min_viz_width = 400;
    var max_viz_width = 2000;

    // scale font offset, when the font size is the height of the rects then it should be almost the full width of the rects
    // when the font size is small, then the offset should be almost equal to half the rect width
    params.scale_font_offset = d3.scale
      .linear().domain([1, 0])
      .range([0.8,0.5]);

    // the default font sizes are set here
    params.labels.default_fs_row = params.matrix.y_scale.rangeBand() * 1.01;
    params.labels.default_fs_col = params.matrix.x_scale.rangeBand() * 0.85;

    // initialize font size zooming parameters
    params.viz.zoom_scale_font = {};
    params.viz.zoom_scale_font.row = 1;
    params.viz.zoom_scale_font.col = 1;

    // allow user to do 'real' 2D zoom until visual aid column triangle
    // is as tall as the normal label width
    params.viz.real_zoom = params.norm_label.width.col / (params.matrix.x_scale.rangeBand()/2);

    // set opacity scale
    params.matrix.max_link = _.max(network_data.links, function(d) {
      return Math.abs(d.value);
    }).value;

    // set opacity_scale
    // input domain of 0 means set the domain automatically
    if (config.input_domain === 0) {
      // set the domain using the maximum absolute value
      if (params.matrix.opacity_function === 'linear') {
        params.matrix.opacity_scale = d3.scale.linear()
          .domain([0, Math.abs(params.matrix.max_link)]).clamp(true)
          .range([0.0, 1.0]);
      } else if (params.matrix.opacity_function === 'log') {
        params.matrix.opacity_scale = d3.scale.log()
          .domain([0.001, Math.abs(params.matrix.max_link)]).clamp(true)
          .range([0.0, 1.0]);
      }
    } else {
      // set the domain manually
      if (params.matrix.opacity_function === 'linear') {
        params.matrix.opacity_scale = d3.scale.linear()
          .domain([0, config.input_domain]).clamp(true)
          .range([0.0, 1.0]);
      } else if (params.matrix.opacity_function === 'log') {
        params.matrix.opacity_scale = d3.scale.log()
          .domain([0.001, config.input_domain]).clamp(true)
          .range([0.0, 1.0]);
      }
    }

    // is a transition running currently
    params.viz.run_trans = false;

    // tile type: simple or group
    // rect is the default faster and simpler option
    // group is the optional slower and more complex option that is activated with: highlighting or split tiles
    if (Utils.has(network_data.links[0], 'value_up') || Utils.has(network_data.links[0], 'highlight')) {
      params.matrix.tile_type = 'group';
    } else {
      params.matrix.tile_type = 'simple';
    }

    // check if rects should be highlighted
    if (Utils.has(network_data.links[0], 'highlight')) {
      params.matrix.highlight = 1;
    } else {
      params.matrix.highlight = 0;
    }

    return params;
  }

  // parent_div: size and position svg container - svg_div
  function parent_div_size_pos(params) {

    // get outer_margins
    if ( params.viz.expand == false ){
      var outer_margins = params.viz.outer_margins;
    } else {
      var outer_margins = params.viz.outer_margins_expand;
    }

    if (params.viz.resize) {

      // get the size of the window
      var screen_width  = window.innerWidth;
      var screen_height = window.innerHeight;

      // define width and height of clustergram container
      var cont_dim = {};
      cont_dim.width  = screen_width  - outer_margins.left - outer_margins.right;
      cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

      // size the svg container div - svg_div
      d3.select('#' + params.viz.svg_div_id)
          .style('margin-left', outer_margins.left + 'px')
          .style('margin-top',  outer_margins.top  + 'px')
          .style('width',  cont_dim.width  + 'px')
          .style('height', cont_dim.height + 'px');

    } else {

      // size the svg container div - svg_div
      d3.select('#' + params.viz.svg_div_id)
          .style('margin-left', outer_margins.left + 'px')
          .style('margin-top',  outer_margins.top + 'px');
    }
  }

  return params

}