
/* Represents the entire visualization: labels, dendrogram (optional) and matrix.
 */
function Viz(args) {

  var config = Config(args),
  matrix,
  row_dendrogram,
  col_dendrogram,
  zoom;

  // make the visualization using the configuration object 
  make(config);

  /* The main function; makes clustergram based on user arguments.
   */
  function make(config) {

    // saving config, an early params, to global variable
    globals.params = config;

    // initialize params from config 
    var params = config;
    var network_data = args.network_data;

    if (params.transpose) {
      network_data = transpose_network(network_data);
    }

    // save global version of network_data
    globals.network_data = network_data;

    // set local variables from network_data
    var col_nodes = network_data.col_nodes;
    var row_nodes = network_data.row_nodes;

    // Begin Making Visualization
    /////////////////////////////////

    // !! needs to be improved 
    // remove any previous visualizations
    d3.select('#main_svg').remove();

    // size and position the outer div first
    
    // only resize if allowed
    parent_div_size_pos(params);

    // initialize clustergram variables
    params = initialize_visualization(network_data, params);

    // display col and row title
    d3.select('#row_title').style('display', 'block');
    d3.select('#col_title').style('display', 'block');

    // display clust_instruct_container
    d3.select('#clust_instruct_container').style('display', 'block');

    // shift the footer left
    d3.select('#footer_div')
      .style('margin-left', '0px');

    // instantiate zoom object 
    zoom = Zoom();

    // define the variable zoom, a d3 method
    params.zoom = d3.behavior
      .zoom()
      .scaleExtent([1, params.real_zoom * params.zoom_switch])
      .on('zoom', zoom.zoomed);

    // make outer group for clust_group - this will position clust_group once
    var svg_group = d3.select('#' + params.svg_div_id)
      .append('svg')
      .attr('id', 'main_svg')
      // leave room for the light grey border
      .attr('width', params.svg_dim.width)
      // the height is reduced by more than the width because the tiles go right up to the bottom border
      .attr('height', params.svg_dim.height);

    // call zooming on the entire svg
    if (params.do_zoom) {
      svg_group.call(params.zoom);
    }

    // make the matrix 
    /////////////////////////
    matrix = Matrix(network_data, svg_group, params);

    // append background rect if necessary to control background color
    if (params.background_color !== '#FFFFFF') {
      svg_group
      .append('rect')
      .attr('width', params.svg_dim.width)
      .attr('height', params.svg_dim.height)
      .style('fill', params.background_color);
      console.log('change the background color ');
    }


    // define reordering object 
    var reorder = Reorder();

    // define labels object 
    var labels = Labels(params);

    // row labels 
    /////////////////////////
    var row_triangle_ini_group = labels.make_rows( params, row_nodes, reorder ); 
    
    //////////////////////////////////////
    if (params.show_dendrogram) {

      // make dendrogram 
      row_dendrogram = Dendrogram('row', params, row_triangle_ini_group);
      
    }


    // Column Labels 
    //////////////////////////////////
    var container_all_col = labels.make_cols( params, col_nodes, reorder );
    

    // add group labels if necessary
    //////////////////////////////////
    if (params.show_dendrogram) {
      // add class label under column label
      var col_class = container_all_col
      .append('g')
      // .attr('transform','translate(0,'+params.norm_label.width.col+')')
      .attr('transform', function() {
        var inst_offset = params.norm_label.width.col + 2;
        return 'translate(0,' + inst_offset + ')';
      })
      .append('g')
      // shift down 1px
      // .attr('transform','translate(0,2)')
      .attr('id', 'col_class');

      // append groups - each will hold a classification rect
      var col_class_ini_group = col_class
      .selectAll('g')
      .data(col_nodes)
      .enter()
      .append('g')
      .attr('class', 'col_class_group')
      .attr('transform', function(d, index) {
        return 'translate(' + params.x_scale(index) + ',0)';
      });

      col_dendrogram = Dendrogram('col', params, col_class_ini_group);

      // optional column callback on click
      if (typeof params.click_group === 'function') {
      col_class_ini_group
        .on('click', function(d) {
        var inst_level = params.group_level.col;
        var inst_group = d.group[inst_level];
        // find all column names that are in the same group at the same group_level
        // get col_nodes
        col_nodes = globals.network_data.col_nodes;
        var group_nodes = [];
        _.each(col_nodes, function(node) {
          // check that the node is in the group
          if (node.group[inst_level] === inst_group) {
          // make a list of genes that are in inst_group at this group_level
          group_nodes.push(node.name);
          }
        });

        // return the following information to the user
        // row or col, distance cutoff level, nodes
        var group_info = {};
        group_info.type = 'col';
        group_info.nodes = group_nodes;
        group_info.info = {
          'type': 'distance',
          'cutoff': inst_level / 10
        };

        // pass information to group_click callback
        params.click_group(group_info);

        });
      }

    }

    // Super Labels 
    if (params.super_labels) {

      // make super labels 
      var super_labels = SuperLabels();
      super_labels.make(params);      

    }

    // Spillover Divs 
    var spillover = Spillover(params, container_all_col);

    // initialize zoom and translate

    ///////////////////////////////////
    // initialize translate vector to compensate for label margins
    params.zoom.translate([params.clust.margin.left, params.clust.margin.top]);

    // resize window
    if (globals.params.resize){
      d3.select(window).on('resize', function(){
        setTimeout(reset_visualization_size, 500);
      });
    }

    zoom.ini_doubleclick();

  }

  // initialize clustergram: size, scales, etc.
  function initialize_visualization(network_data, params) {

    // Define Visualization Dimensions
    ///////////////////////////////////////

    // grey_border
    ///////////////////
    // the outermost part of the visualization
    params.grey_border_width = 3;

    // the distance between labels and clustergram
    // a universal margin for the clustergram
    params.uni_margin = 4;
    params.uni_margin_row = 2;

    // Super Labels
    ///////////////////
    // super label width - the labels are 20px wide if they are included
    if (params.super_labels) {
      // include super labels
      params.super_label_width = 20;
    } else {
      // do not include super labels
      params.super_label_width = 0;
    }

    // Variable Label Widths
    // based on the length of the row/col labels - longer labels mean more space given
    // get row col data
    var col_nodes = network_data.col_nodes;
    var row_nodes = network_data.row_nodes;
    // find the label with the most characters and use it to adjust the row and col margins
    var row_max_char = _.max(row_nodes, function(inst) {
      return inst.name.length;
    }).name.length;
    var col_max_char = _.max(col_nodes, function(inst) {
      return inst.name.length;
    }).name.length;

    // define label scale parameters: the more characters in the longest name, the larger the margin
    var min_num_char = 5;
    var max_num_char = 60;
    var min_label_width = 120;
    var max_label_width = 320;
    var label_scale = d3.scale
      .linear()
      .domain([min_num_char, max_num_char])
      .range([min_label_width, max_label_width]).clamp('true');

    // rotated column labels - approx trig
    params.norm_label = {};
    params.norm_label.width = {};

    // allow the user to increase or decrease the overall size of the labels
    params.norm_label.width.row = label_scale(row_max_char) * params.row_label_scale;
    params.norm_label.width.col = 0.8 * label_scale(col_max_char) * params.col_label_scale;

    // normal label margins
    params.norm_label.margin = {};
    params.norm_label.margin.left = params.grey_border_width + params.super_label_width;
    params.norm_label.margin.top = params.grey_border_width + params.super_label_width;

    // norm label background width, norm-label-width plus class-width plus margin
    params.norm_label.background = {};
    params.norm_label.background.row = params.norm_label.width.row + params
      .class_room.row + params.uni_margin;
    params.norm_label.background.col = params.norm_label.width.col + params
      .class_room.col + params.uni_margin;

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
    params.svg_dim.width = Number(d3.select('#' + params.svg_div_id).style(
      'width').replace('px', ''));
    params.svg_dim.height = Number(d3.select('#' + params.svg_div_id).style(
      'height').replace('px', ''));

    // reduce width by row/col labels and by grey_border width (reduce width by less since this is less aparent with slanted col labels)
    var ini_clust_width = params.svg_dim.width - (params.super_label_width +
      label_scale(row_max_char)*params.row_label_scale + params.class_room.row) - params.grey_border_width -
      params.spillover_x_offset;
    // there is space between the clustergram and the border
    var ini_clust_height = params.svg_dim.height - (params.super_label_width +
      0.8 * label_scale(col_max_char)*params.col_label_scale + params.class_room.col) - 5 *
      params.grey_border_width;

    // the visualization dimensions can be smaller than the svg
    // if there are not many rows the clustergram width will be reduced, but not the svg width
    //!! needs to be improved
    var prevent_col_stretch = d3.scale.linear().domain([1, 20]).range([0.05,
      1
    ]).clamp('true');

    // clust_dim - clustergram dimensions (the clustergram is smaller than the svg)
    params.clust.dim = {};
    params.clust.dim.width = ini_clust_width * prevent_col_stretch(
      col_nodes.length);

    // clustergram height
    ////////////////////////
    // ensure that rects are never taller than they are wide
    // force square tiles
    if (ini_clust_width / col_nodes.length < ini_clust_height / row_nodes.length) {

      // scale the height
      params.clust.dim.height = ini_clust_width * (row_nodes.length /
      col_nodes.length);

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
    params.zoom_switch = (params.clust.dim.width / col_nodes.length) / (
      params.clust.dim.height / row_nodes.length);
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
    params.real_zoom = real_zoom_scale_col(col_nodes.length) *
      real_zoom_scale_screen(params.clust.dim.width);

    // set opacity scale
    var max_link = _.max(network_data.links, function(d) {
      return Math.abs(d.value);
    });

    // set opacity_scale
    // input domain of 0 means set the domain automatically
    if (params.input_domain === 0) {
      // set the domain using the maximum absolute value
      if (params.opacity_scale === 'linear') {
      params.opacity_scale = d3.scale.linear().domain([0, Math.abs(
        max_link.value)]).clamp(true).range([0.0, 1.0]);
      } else if (params.opacity_scale === 'log') {
      params.opacity_scale = d3.scale.log().domain([0.001, Math.abs(
        max_link.value)]).clamp(true).range([0.0, 1.0]);
      }
    } else {
      // set the domain manually
      if (params.opacity_scale === 'linear') {
      params.opacity_scale = d3.scale.linear().domain([0, params.input_domain])
        .clamp(true).range([0.0, 1.0]);
      } else if (params.opacity_scale === 'log') {
      params.opacity_scale = d3.scale.log().domain([0.001, params.input_domain])
        .clamp(true).range([0.0, 1.0]);
      }
    }

    // not running a transition
    params.run_trans = false;

    
    // type type: simple or group 
    // rect is the default faster and simpler option
    // group is the optional slower and more complex option that is activated with: highlighting or split tiles
    if (Utils.has(network_data.links[0], 'value_up') || Utils.has(network_data.links[0], 'highlight')) {
      params.tile_type = 'group';
    } else {
      params.tile_type = 'simple';
    }

    // check if rects should be highlighted
    if (Utils.has(globals.network_data.links[0], 'highlight')) {
      params.highlight = 1;
    } else {
      params.highlight = 0;
    }

    return params;
  }

  // parent_div: size and position svg container - svg_div
  function parent_div_size_pos(params) {

    if (params.resize) {
      // get outer_margins
      var outer_margins = params.outer_margins;

      // get the size of the window
      var screen_width = window.innerWidth;
      var screen_height = window.innerHeight;

      // define width and height of clustergram container
      var cont_dim = {};
      cont_dim.width  = screen_width  - outer_margins.left - outer_margins.right;
      cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

      // size the svg container div - svg_div
      d3.select('#' + params.svg_div_id)
          .style('margin-left', outer_margins.left + 'px')
          .style('margin-top', outer_margins.top + 'px')
          .style('width', cont_dim.width + 'px')
          .style('height', cont_dim.height + 'px');
          
    } else {
      // get outer_margins
      outer_margins = params.outer_margins;

      // size the svg container div - svg_div
      d3.select('#' + params.svg_div_id)
          .style('margin-left', outer_margins.left + 'px')
          .style('margin-top',  outer_margins.top + 'px');
    }
  }


  // recalculate the size of the visualization
  // and remake the clustergram
  function reset_visualization_size() {

      viz.remake();

      // reset zoom and translate
      globals.params.zoom.scale(1).translate(
          [globals.params.clust.margin.left, globals.params.clust.margin.top]
      );
  }

  /* Transpose network.
   */
  function transpose_network(net) {
    var tnet = {},
        inst_link,
        i;

    tnet.row_nodes = net.col_nodes;
    tnet.col_nodes = net.row_nodes;
    tnet.links = [];

    for (i = 0; i < net.links.length; i++) {
      inst_link = {};
      inst_link.source = net.links[i].target;
      inst_link.target = net.links[i].source;
      inst_link.value = net.links[i].value;

      // Optional highlight.
      if (Utils.has(net.links[i], 'highlight')) {
        inst_link.highlight = net.links[i].highlight;
      }
      if (Utils.has(net.links[i], 'value_up')) {
        inst_link.value_up = net.links[i].value_up;
      }
      if (Utils.has(net.links[i], 'value_dn')) {
        inst_link.value_dn = net.links[i].value_dn;
      }
      if (Utils.has(net.links[i], 'info')) {
        inst_link.info = net.links[i].info;
      }
      tnet.links.push(inst_link);
    }

    return tnet;
  }

  return {
    remake: function() {
      make(config);
    },
    change_group: function(inst_rc, inst_index) {
      if (inst_rc === 'row') {
        row_dendrogram.change_groups(inst_index);
      } else {
        col_dendrogram.change_groups(inst_index);
      }
    },
    get_clust_group: function(){
      return matrix.get_clust_group();
    },
    get_matrix: function(){
      return matrix.get_matrix();
    },
    get_nodes: function(type){
      return matrix.get_nodes(type);
    },
    two_translate_zoom: zoom.two_translate_zoom
  }

}