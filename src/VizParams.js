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
      params.super_label_width = 20;
      params.super.row = config.super.row;
      params.super.col = config.super.col;
    } else {
      params.super_label_width = 0;
    }

    // Matrix Options 
    params.matrix = {};
    params.matrix.tile_colors = config.tile_colors;
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
    params.viz.uni_margin = config.uni_margin;
    params.viz.grey_border_width = config.grey_border_width;

    // pass network_data to params
    params.network_data = config.network_data;

    var network_data = params.network_data;

    // only resize if allowed
    parent_div_size_pos(params);


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
    params.norm_label.width.col = 0.8 * label_scale(col_max_char) * params.col_label_scale;

    // normal label margins
    params.norm_label.margin = {};
    params.norm_label.margin.left = params.viz.grey_border_width + params.super_label_width;
    params.norm_label.margin.top = params.viz.grey_border_width + params.super_label_width;

    // row groups - only add if the rows have a group attribute
    // Define the space needed for the classification of rows - includes classification triangles and rects
    params.class_room = {};
    if (config.show_dendrogram) {
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
    params.clust = {};
    params.clust.margin = {};
    // clust margin is the margin of the norm_label plus the width of the entire norm_label group
    params.clust.margin.left = params.norm_label.margin.left + params.norm_label.background.row;
    params.clust.margin.top = params.norm_label.margin.top + params.norm_label.background.col;

    // svg size: less than svg size
    ///////////////////////////////////
    // 0.8 approximates the trigonometric distance required for hiding the spillover
    params.spillover_x_offset = label_scale(col_max_char) * 0.8 * params.col_label_scale;

    // get height and width from parent div
    params.svg_dim = {};
    params.svg_dim.width  = Number(d3.select('#' + params.viz.svg_div_id).style('width').replace('px', ''));
    params.svg_dim.height = Number(d3.select('#' + params.viz.svg_div_id).style('height').replace('px', ''));



    // reduce width by row/col labels and by grey_border width (reduce width by less since this is less aparent with slanted col labels)
    var ini_clust_width = params.svg_dim.width - (params.super_label_width +
      label_scale(row_max_char)*config.row_label_scale + params.class_room.row) - params.viz.grey_border_width -
      params.spillover_x_offset;

    // there is space between the clustergram and the border
    var ini_clust_height = params.svg_dim.height - (params.super_label_width +
      0.8 * label_scale(col_max_char)*params.col_label_scale + params.class_room.col) - 5 *
      params.viz.grey_border_width;

    // the visualization dimensions can be smaller than the svg
    // if there are not many rows the clustergram width will be reduced, but not the svg width
    //!! needs to be improved
    var prevent_col_stretch = d3.scale.linear()
      .domain([1, 20]).range([0.05,1]).clamp('true');

    // clust_dim - clustergram dimensions (the clustergram is smaller than the svg)
    params.clust.dim = {};
    params.clust.dim.width = ini_clust_width * prevent_col_stretch(col_nodes.length);

    // clustergram height
    ////////////////////////
    // ensure that rects are never taller than they are wide
    // force square tiles
    if (ini_clust_width / col_nodes.length < ini_clust_height / row_nodes.length) {

      // scale the height
      params.clust.dim.height = ini_clust_width * (row_nodes.length / col_nodes.length);

      // keep track of whether or not a force square has occurred
      // so that I can adjust the font accordingly
      params.force_square = 1;

      // make sure that force_square does not cause the entire visualization
      // to be taller than the svg, if it does, then undo
      if (params.clust.dim.height > ini_clust_height) {
      // make the height equal to the width
      params.clust.dim.height = ini_clust_height;
      // keep track of whether or not a force square has occurred
      params.force_square = 0;
      }
    }
    // do not force square tiles
    else {
      // the height will be calculated normally - leading to wide tiles
      params.clust.dim.height = ini_clust_height;
      // keep track of whether or not a force square has occurred
      params.force_square = 0;
    }

    // Define Orderings
    ////////////////////////////
    // scaling functions to position rows and tiles, define rangeBands
    params.x_scale = d3.scale.ordinal().rangeBands([0, params.clust.dim.width]);
    params.y_scale = d3.scale.ordinal().rangeBands([0, params.clust.dim.height]);

    // Define Orderings
    params.orders = {
      name: d3.range(col_nodes.length).sort(function(a, b) {
        return d3.ascending(col_nodes[a].name, col_nodes[b].name);
      }),
      // rank
      rank_row: d3.range(col_nodes.length).sort(function(a, b) {
        return col_nodes[b].rank - col_nodes[a].rank;
      }),
      rank_col: d3.range(row_nodes.length).sort(function(a, b) {
        return row_nodes[b].rank - row_nodes[a].rank;
      }),
      // clustered
      clust_row: d3.range(col_nodes.length).sort(function(a, b) {
        return col_nodes[b].clust - col_nodes[a].clust;
      }),
      clust_col: d3.range(row_nodes.length).sort(function(a, b) {
        return row_nodes[b].clust - row_nodes[a].clust;
      }),
      // class
      class_row: d3.range(col_nodes.length).sort(function(a, b) {
        return col_nodes[b].cl - col_nodes[a].cl;
      }),
      class_col: d3.range(row_nodes.length).sort(function(a, b) {
        return row_nodes[b].cl - row_nodes[a].cl;
      })
    };

    // Assign initial ordering for x_scale and y_scale
    if (params.inst_order === 'clust') {
      params.x_scale.domain(params.orders.clust_row);
      params.y_scale.domain(params.orders.clust_col);
    } else if (params.inst_order === 'rank') {
      params.x_scale.domain(params.orders.rank_row);
      params.y_scale.domain(params.orders.rank_col);
    } else if (params.inst_order === 'class') {
      params.x_scale.domain(params.orders.class_row);
      params.y_scale.domain(params.orders.class_col);
    }

    // visualization parameters
    //////////////////////////////

    // border_width - width of white borders around tiles
    params.border_width = params.x_scale.rangeBand() / 40;

    // zoom_switch from 1 to 2d zoom
    params.zoom_switch = (params.clust.dim.width / col_nodes.length) / (params.clust.dim.height / row_nodes.length);

    // zoom_switch can not be less than 1
    if (params.zoom_switch < 1) {
      params.zoom_switch = 1;
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
    params.default_fs_row = params.y_scale.rangeBand() * 0.9;
    params.default_fs_col = params.x_scale.rangeBand() * 0.7;

    // initialize font size zooming parameters
    params.zoom_scale_font = {};
    params.zoom_scale_font.row = 1;
    params.zoom_scale_font.col = 1;

    // set up the real zoom (2d zoom) as a function of the number of col_nodes
    // since these are the nodes that are zoomed into in 2d zooming
    var real_zoom_scale_col = d3.scale
      .linear()
      .domain([min_node_num,max_node_num])
      .range([2, 10]).clamp('true');

    // scale the zoom based on the screen size
    // smaller screens can zoom in more, compensates for reduced font size with small screen
    var real_zoom_scale_screen = d3.scale
      .linear()
      .domain([min_viz_width,max_viz_width])
      .range([2, 1]).clamp('true');

    // calculate the zoom factor - the more nodes the more zooming allowed
    params.real_zoom = real_zoom_scale_col(col_nodes.length) * real_zoom_scale_screen(params.clust.dim.width);

    // set opacity scale
    var max_link = _.max(network_data.links, function(d) {
      return Math.abs(d.value);
    });

    // set opacity_scale
    // input domain of 0 means set the domain automatically
    if (config.input_domain === 0) {
      // set the domain using the maximum absolute value
      if (config.opacity_scale === 'linear') {
        params.opacity_scale = d3.scale.linear()
          .domain([0, Math.abs(max_link.value)]).clamp(true)
          .range([0.0, 1.0]);
      } else if (config.opacity_scale === 'log') {
        params.opacity_scale = d3.scale.log()
          .domain([0.001, Math.abs(max_link.value)]).clamp(true)
          .range([0.0, 1.0]);
      }
    } else {
      // set the domain manually
      if (config.opacity_scale === 'linear') {
        params.opacity_scale = d3.scale.linear()
          .domain([0, config.input_domain]).clamp(true)
          .range([0.0, 1.0]);
      } else if (config.opacity_scale === 'log') {
        params.opacity_scale = d3.scale.log()
          .domain([0.001, config.input_domain]).clamp(true)
          .range([0.0, 1.0]);
      }
    }

    // is a transition running currently 
    params.run_trans = false;
    
    // tile type: simple or group 
    // rect is the default faster and simpler option
    // group is the optional slower and more complex option that is activated with: highlighting or split tiles
    if (Utils.has(network_data.links[0], 'value_up') || Utils.has(network_data.links[0], 'highlight')) {
      params.tile_type = 'group';
    } else {
      params.tile_type = 'simple';
    }

    // check if rects should be highlighted
    if (Utils.has(network_data.links[0], 'highlight')) {
      params.highlight = 1;
    } else {
      params.highlight = 0;
    }

    return params;
  }

  // parent_div: size and position svg container - svg_div
  function parent_div_size_pos(params) {

    if (params.viz.resize) {
      // get outer_margins
      var outer_margins = params.viz.outer_margins;

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
      // get outer_margins
      outer_margins = params.viz.outer_margins;

      // size the svg container div - svg_div
      d3.select('#' + params.viz.svg_div_id)
          .style('margin-left', outer_margins.left + 'px')
          .style('margin-top',  outer_margins.top + 'px');
    }
  }

  return params

}