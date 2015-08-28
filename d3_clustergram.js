
// start d3_clustergram closure
var d3_clustergram = (function() {
  'use strict';

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
    if (params.super_labels === 'yes') {
      // include super labels
      params.super_label_width = 20;
    } else {
      // do not include super labels
      params.super_label_width = 0;
    }

    // Variable Label Widths
    //////////////////////////
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
    var label_scale = d3.scale.linear().domain([min_num_char, max_num_char])
      .range([min_label_width, max_label_width]).clamp('true');

    // Nomal Labels
    // define the space needed for the classification of rows - includes classification triangles and rects
    params.class_room = {};
    if (_.has(params, 'group_colors')) {
      // make room for group rects
      params.class_room.row = 18;
      params.class_room.col = 9;
      // the width of the classification triangle or group rectangle
      params.class_room.symbol_width = 9;
    } else {
      // do not make room for group rects
      params.class_room.row = 9;
      params.class_room.col = 0;
      // the width of the classification triangle or group rectangle
      params.class_room.symbol_width = 9;
    }

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
    // norm label background width, norm-label-width plus class-width plus maring
    params.norm_label.background = {};
    params.norm_label.background.row = params.norm_label.width.row + params
      .class_room.row + params.uni_margin;
    params.norm_label.background.col = params.norm_label.width.col + params
      .class_room.col + params.uni_margin;

    // clustergram dimensions
    params.clust = {};
    params.clust.margin = {};
    // clust margin is the margin of the norm_label plus the width of the entire norm_label group
    params.clust.margin.left = params.norm_label.margin.left + params.norm_label
      .background.row;
    params.clust.margin.top = params.norm_label.margin.top + params.norm_label
      .background.col;


    // calc clustergram dimensions
    /////////////////////////////////////
    // prevent narrow tiles and prevent stretched rows

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
    params.border_width = params.x_scale.rangeBand() / 16.66;

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

    // min and max font sizes
    var min_fs = 0.05;
    var max_fs = 15;

    // min and max expected screen widths
    var min_viz_width = 400;
    var max_viz_width = 2000;

    // make a scale that will set the initial font size based on the number of nodes
    d3
      .scale
      .log()
      .domain([min_node_num, max_node_num])
      .range([max_fs, min_fs])
      .clamp('true');
    // scale font offset, when the font size is the height of the rects then it should be almost the full width of the rects
    // when the font size is small, then the offset should be almost equal to half the rect width
    params.scale_font_offset = d3.scale.linear().domain([1, 0]).range([0.8,
      0.5
    ]);

    // controls how much the font size increases during zooming
    // 1: do not increase font size while zooming
    // 0: increase font size while zooming
    // allow some increase in font size when zooming
    var min_fs_zoom = 0.95;
    // allow full increase in font size when zooming
    var max_fs_zoom = 0.0;
    // make a scale that will control how the font size changes with zooming based on the number of nodes
    var scale_reduce_font_size_factor = d3.scale.log().domain([min_node_num,
      max_node_num
    ]).range([min_fs_zoom, max_fs_zoom]).clamp('true');

    // define screen width font size scale
    // having a small screen width should reduce the font size of the columns
    // this will be compensated by increasing the available real zoom
    //!! this can be improved

    // scale_fs_screen_width
    d3
      .scale
      .linear()
      .domain([min_viz_width, max_viz_width])
      .range([0.75, 1.15])
      .clamp('true');

    // scale_fs_screen_height
    d3
      .scale
      .linear()
      .domain([min_viz_width, max_viz_width])
      .range([0.75, 1.15])
      .clamp('true');

    // the default font sizes are set here
    // params.default_fs_row = scale_font_size(row_nodes.length)* scale_fs_screen_height(params.clust.dim.height);
    params.default_fs_row = params.y_scale.rangeBand() * 0.9;
    // the colum font size is scaled by the width
    //!! make this local later
    // params.default_fs_col = scale_font_size(col_nodes.length)* scale_fs_screen_width(params.clust.dim.width);
    params.default_fs_col = params.x_scale.rangeBand() * 0.7;

    // font size zooming parameters
    params.zoom_scale_font = {};
    params.zoom_scale_font.row = 1;
    params.zoom_scale_font.col = 1;


    // // correct for forcing the tiles to be squares - if they are forced, then use the col font size for the row
    // if (params.force_square === 1){
    //   // scale the row font size by the col scaling
    //   params.default_fs_row = params.default_fs_col;
    // }

    // calculate the reduce font-size factor: 0 for no reduction in font size and 1 for full reduction of font size
    params.reduce_font_size = {};
    params.reduce_font_size.row = scale_reduce_font_size_factor(row_nodes.length);
    params.reduce_font_size.col = scale_reduce_font_size_factor(col_nodes.length);

    // set up the real zoom (2d zoom) as a function of the number of col_nodes
    // since these are the nodes that are zoomed into in 2d zooming
    var real_zoom_scale_col = d3.scale.linear().domain([min_node_num,
      max_node_num
    ]).range([2, 5]).clamp('true');

    // scale the zoom based on the screen size
    // smaller screens can zoom in more, compensates for reduced font size with small screen
    var real_zoom_scale_screen = d3.scale.linear().domain([min_viz_width,
      max_viz_width
    ]).range([2, 1]).clamp('true');
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
    params.run_trans = 0;

    // console.log(network_data.links[0])
    // define tile type: rect, group
    // rect is the default faster and simpler option
    // group is the optional slower and more complex option that is activated with: highlighting or split tiles
    // if ( _.has(network_data.links[0], 'value_up') || _.has(network_data.links[0], 'highlight') ){
    if (_.has(network_data.links[0], 'value_up') || _.has(network_data.links[
        0], 'highlight')) {
      params.tile_type = 'group';
      // console.log('making group tiles');
    } else {
      params.tile_type = 'simple';
      // console.log('making group tiles');
    }

    // check if rects should be highlighted
    if (_.has(d3_clustergram.network_data.links[0], 'highlight')) {
      params.highlight = 1;
      // console.log('found highlight');
    } else {
      params.highlight = 0;
    }

    return params;
  }


  // main function
  function make_d3_clustergram(args) {

    // initialize the parameters object
    var params = {};

    // save all arguments for remaking viz
    params.args = args;

    // Unload Arguments
    /////////////////////////

    // network_data - not an optional argument
    var network_data = args.network_data;


    // svg_div_id
    if (typeof args.svg_div_id === 'undefined') {
      params.svg_div_id = 'svg_div';
    } else {
      params.svg_div_id = args.svg_div_id;
    }

    // super-row/col labels
    if (typeof args.row_label === 'undefined' || typeof args.col_label ===
      'undefined') {
      // do not put super labels
      params.super_labels = 'no';
    } else {
      // make super labels
      params.super_labels = 'yes';
      params.super = {};
      params.super.row = args.row_label;
      params.super.col = args.col_label;
    }

    // row and column overflow sensitivity
    params.label_overflow = {};
    if (typeof args.row_overflow === 'undefined') {
      // make sensitivity to overflow the max, 1
      params.label_overflow.row = 1;
    } else {
      params.label_overflow.row = args.row_overflow;
    }

    // col and column overflow sensitivity
    if (typeof args.col_overflow === 'undefined') {
      // make sensitivity to overflow the max, 1
      params.label_overflow.col = 1;
    } else {
      params.label_overflow.col = args.col_overflow;
    }

    // row and label overall scale 
    if (typeof args.row_label_scale == 'undefined'){
      params.row_label_scale = 1;
    } else {
      params.row_label_scale = args.row_label_scale;
    }
    if (typeof args.col_label_scale == 'undefined'){
      params.col_label_scale = 1;
    } else {
      params.col_label_scale = args.col_label_scale;
    }

    // transpose matrix - if requested
    if (typeof args.transpose === 'undefined') {
      params.transpose = false;
    } else {
      params.transpose = args.transpose;
    }

    // transpose network data and super-labels
    if (params.transpose === true) {
      network_data = transpose_network(network_data);
      params.super.row = args.col_label;
      params.super.col = args.row_label;
    }

    // add title to tile
    if (typeof args.title_tile === 'undefined') {
      params.title_tile = false;
    } else {
      params.title_tile = args.title_tile;
    }

    // tile colors
    if (typeof args.tile_colors === 'undefined') {
      // red/blue
      params.tile_colors = ['#FF0000', '#1C86EE'];
    } else {
      params.tile_colors = args.tile_colors;
    }

    // background color
    if (typeof args.background_color === 'undefined') {
      params.background_color = '#FFFFFF';
      params.super_border_color = '#f5f5f5';
    } else {
      params.background_color = args.background_color;
      params.super_border_color = args.background_color;
    }

    // check if zooming is enabled
    if (typeof args.zoom === 'undefined') {
      params.do_zoom = true;
    } else {
      params.do_zoom = args.zoom;
    }

    // tile callback function - optional
    if (typeof args.click_tile === 'undefined') {
      // there is no callback function included
      params.click_tile = 'none';
    } else {
      // transfer the callback function
      params.click_tile = args.click_tile;
    }

    // group callback function - optional
    if (typeof args.click_group === 'undefined') {
      params.click_group = 'none';
    } else {
      // transfer the callback function
      params.click_group = args.click_group;
    }

    // set input domain
    if (typeof args.input_domain === 'undefined') {
      // default domain is set to 0, which means that the domain will be set automatically
      params.input_domain = 0;
    } else {
      params.input_domain = args.input_domain;
    }

    // set opacity scale type
    if (typeof args.opacity_scale === 'undefined') {
      params.opacity_scale = 'linear';
    } else {
      params.opacity_scale = args.opacity_scale;
    }

    // variable/fixed visualization size (needs to be in the arguments)
    if (typeof args.resize === 'undefined') {
      // default resize to yes
      params.resize = true;
    } else {
      params.resize = args.resize;
    }

    // get outer_margins
    if (typeof args.outer_margins === 'undefined') {
      // default margins
      params.outer_margins = {
        'top': 0,
        'bottom': 0,
        'left': 0,
        'right': 0
      };
    } else {
      params.outer_margins = args.outer_margins;
    }

    // get initial ordering
    if (typeof args.order === 'undefined') {
      params.inst_order = 'clust';
    }
    // only use ordering if its defined correctly
    else if (args.order === 'clust' || args.order === 'rank' ||
      args.order === 'class') {
      params.inst_order = args.order;
    } else {
      // backup
      params.inst_order = 'clust';
    }

    // save global version of network_data
    d3_clustergram.network_data = network_data;

    // set local variables from network_data
    var col_nodes = network_data.col_nodes;
    var row_nodes = network_data.row_nodes;

    // colors from http://graphicdesign.stackexchange.com/revisions/3815/8
    params.rand_colors = ['#000000', '#FF34FF', '#FFFF00', '#FF4A46',
      '#008941', '#006FA6', '#A30059', '#FFDBE5', '#7A4900', '#0000A6',
      '#63FFAC', '#B79762', '#004D43', '#8FB0FF', '#997D87', '#5A0007',
      '#809693', '#FEFFE6', '#1B4400', '#4FC601', '#3B5DFF', '#4A3B53',
      '#FF2F80', '#61615A', '#BA0900', '#6B7900', '#00C2A0', '#FFAA92',
      '#FF90C9', '#B903AA', '#D16100', '#DDEFFF', '#000035', '#7B4F4B',
      '#A1C299', '#300018', '#0AA6D8', '#013349', '#00846F', '#372101',
      '#FFB500', '#C2FFED', '#A079BF', '#CC0744', '#C0B9B2', '#C2FF99',
      '#001E09', '#00489C', '#6F0062', '#0CBD66', '#EEC3FF', '#456D75',
      '#B77B68', '#7A87A1', '#788D66', '#885578', '#FAD09F', '#FF8A9A',
      '#D157A0', '#BEC459', '#456648', '#0086ED', '#886F4C', '#34362D',
      '#B4A8BD', '#00A6AA', '#452C2C', '#636375', '#A3C8C9', '#FF913F',
      '#938A81', '#575329', '#00FECF', '#B05B6F', '#8CD0FF', '#3B9700',
      '#04F757', '#C8A1A1', '#1E6E00', '#7900D7', '#A77500', '#6367A9',
      '#A05837', '#6B002C', '#772600', '#D790FF', '#9B9700', '#549E79',
      '#FFF69F', '#201625', '#72418F', '#BC23FF', '#99ADC0', '#3A2465',
      '#922329', '#5B4534', '#FDE8DC', '#404E55', '#0089A3', '#CB7E98',
      '#A4E804', '#324E72', '#6A3A4C', '#83AB58', '#001C1E', '#D1F7CE',
      '#004B28', '#C8D0F6', '#A3A489', '#806C66', '#222800', '#BF5650',
      '#E83000', '#66796D', '#DA007C', '#FF1A59', '#8ADBB4', '#1E0200',
      '#5B4E51', '#C895C5', '#320033', '#FF6832', '#66E1D3', '#CFCDAC',
      '#D0AC94', '#7ED379', '#012C58', '#7A7BFF', '#D68E01', '#353339',
      '#78AFA1', '#FEB2C6', '#75797C', '#837393', '#943A4D', '#B5F4FF',
      '#D2DCD5', '#9556BD', '#6A714A', '#001325', '#02525F', '#0AA3F7',
      '#E98176', '#DBD5DD', '#5EBCD1', '#3D4F44', '#7E6405', '#02684E',
      '#962B75', '#8D8546', '#9695C5', '#E773CE', '#D86A78', '#3E89BE',
      '#CA834E', '#518A87', '#5B113C', '#55813B', '#E704C4', '#00005F',
      '#A97399', '#4B8160', '#59738A', '#FF5DA7', '#F7C9BF', '#643127',
      '#513A01', '#6B94AA', '#51A058', '#A45B02', '#1D1702', '#E20027',
      '#E7AB63', '#4C6001', '#9C6966', '#64547B', '#97979E', '#006A66',
      '#391406', '#F4D749', '#0045D2', '#006C31', '#DDB6D0', '#7C6571',
      '#9FB2A4', '#00D891', '#15A08A', '#BC65E9', '#FFFFFE', '#C6DC99',
      '#203B3C', '#671190', '#6B3A64', '#F5E1FF', '#FFA0F2', '#CCAA35',
      '#374527', '#8BB400', '#797868', '#C6005A', '#3B000A', '#C86240',
      '#29607C', '#402334', '#7D5A44', '#CCB87C', '#B88183', '#AA5199',
      '#B5D6C3', '#A38469', '#9F94F0', '#A74571', '#B894A6', '#71BB8C',
      '#00B433', '#789EC9', '#6D80BA', '#953F00', '#5EFF03', '#E4FFFC',
      '#1BE177', '#BCB1E5', '#76912F', '#003109', '#0060CD', '#D20096',
      '#895563', '#29201D', '#5B3213', '#A76F42', '#89412E', '#1A3A2A',
      '#494B5A', '#A88C85', '#F4ABAA', '#A3F3AB', '#00C6C8', '#EA8B66',
      '#958A9F', '#BDC9D2', '#9FA064', '#BE4700', '#658188', '#83A485',
      '#453C23', '#47675D', '#3A3F00', '#061203', '#DFFB71', '#868E7E',
      '#98D058', '#6C8F7D', '#D7BFC2', '#3C3E6E', '#D83D66', '#2F5D9B',
      '#6C5E46', '#D25B88', '#5B656C', '#00B57F', '#545C46', '#866097',
      '#365D25', '#252F99', '#00CCFF', '#674E60', '#FC009C', '#92896B',
      '#1CE6FF'
    ];

    // get the total number of colors
    var num_colors = params.rand_colors.length;

    // row groups - only add if the rows have a group attribute
    if (_.has(row_nodes[0], 'group') === true || _.has(col_nodes[0],
        'group')) {

      // initialize group colors
      /////////////////////////
      params.group_colors = {};
      // initailize group at 5
      params.group_level = {};
      params.group_level.row = 5;
      params.group_level.col = 5;

    }

    // check if row/col have class information
    if (_.has(row_nodes[0], 'cl') || _.has(col_nodes[0], 'cl')) {
      // gather classes
      params.class_colors = {};
    }

    // gather class information from row
    if (_.has(row_nodes[0], 'cl') === true) {
      var class_rows = _.uniq(_.pluck(row_nodes, 'cl'));
      // associate classes with colors
      params.class_colors.row = {};
      _.each(class_rows, function(c_row, i) {
        params.class_colors.row[c_row] = params.rand_colors[i + 50 % num_colors];
      });
    }
    // gather class information from col
    if (_.has(col_nodes[0], 'cl') === true) {
      var class_cols = _.uniq(_.pluck(col_nodes, 'cl'));
      // associate classes with colors
      params.class_colors.col = {};
      _.each(class_cols, function(c_col, i) {
        if (i === 0) {
          params.class_colors.col[c_col] = '#eee';
        } else {
          params.class_colors.col[c_col] = params.rand_colors[i + 50 % num_colors];
        }
      });
    }

    // get row groups and make color dictionary
    if (_.has(row_nodes[0], 'group') === true) {
      params.group_colors.row = {};

      // generate random colors for the groups
      for (var i = 0; i < 200; i++) {
        // grab colors from the list
        if (i === 1) {
          params.group_colors.row[i] = '#eee';
        } else {
          params.group_colors.row[i] = params.rand_colors[i % num_colors];
        }
      }
    }

    // get col groups and make color dictionary
    if (_.has(col_nodes[0], 'group') === true) {
      params.group_colors.col = {};

      // generate random colors for the groups
      for (var j = 0; j < 200; j++) {
        // grab colors from the list
        if (j === 1) {
          params.group_colors.col[j] = '#eee';
        } else {
          params.group_colors.col[j] = params.rand_colors[j % num_colors];
        }
      }
    }

    // Begin Making Visualization
    /////////////////////////////////

    // might save global data to specific object in case a user wants
    // to have more than one clustergram
    // // initialize an object with the name svg_div_id
    // d3_clustergram['params_'+svg_div_id] = {}

    // remove any previous visualizations
    d3.select('#main_svg').remove();

    // size and position the outer div first
    //////////////////////////////////////////
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

    // !! need to set up
    // highlight resource types - set up type/color association
    params = highlight_resource_types(params);

    // define the variable zoom, a d3 method
    params.zoom = d3.behavior.zoom().scaleExtent([1, params.real_zoom *
      params.zoom_switch
    ]).on('zoom', zoomed);

    // initialize matrix
    /////////////////////////
    params.matrix = [];

    _.each(row_nodes, function(tmp, row_index) {
        params.matrix[row_index] = d3.range(col_nodes.length).map(function(col_index) {
          return {
            pos_x: col_index,
            pos_y: row_index,
            value: 0
          };
        });
      });

    _.each(network_data.links, function(link) {
      params.matrix[link.source][link.target].value = link.value;
      // transfer additional link information is necessary 
      if (params.tile_type === 'group') {
        params.matrix[link.source][link.target].value_up = link.value_up;
        params.matrix[link.source][link.target].value_dn = link.value_dn;
      }
      if (params.highlight === 1) {
        params.matrix[link.source][link.target].highlight = link.highlight;
      }
      if (_.has(link, 'info')) {
        params.matrix[link.source][link.target].info = link.info;
      }
    });

    // save params to the global object d3_clustergram
    d3_clustergram.params = params;

    // make clustergram visualization
    ///////////////////////////////////////

    // make outer group for clust_group - this will position clust_group once
    var outer_group = d3.select('#' + params.svg_div_id)
      .append('svg')
      .attr('id', 'main_svg')
      // leave room for the light grey border
      .attr('width', params.svg_dim.width)
      // the height is reduced by more than the width because the tiles go right up to the bottom border
      .attr('height', params.svg_dim.height);

    // append background rect if necessary to control background color
    if (params.background_color !== '#FFFFFF') {
      outer_group
        .append('rect')
        .attr('width', params.svg_dim.width)
        .attr('height', params.svg_dim.height)
        .style('fill', params.background_color);
      console.log('change the background color ');
    }

    // call zoomingoom on the entire svg
    if (params.do_zoom === true) {
      outer_group
        .call(params.zoom);
    }

    params.clust_group = outer_group
      // append a group that will hold clust_group and position it once
      .append('g')
      .attr('transform', 'translate(' + params.clust.margin.left + ',' +
        params.clust.margin.top + ')')
      .append('g')
      .attr('id', 'clust_group');

    // grey background rect for clustergram
    params.clust_group
      .append('rect')
      .attr('class', 'background')
      .attr('id', 'grey_background')
      .style('fill', '#eee')
      .attr('width', params.clust.dim.width)
      .attr('height', params.clust.dim.height);

    // make rows: make rects or groups
    // use matrix for the data join, which contains a two dimensional
    // array of objects, each row of this matrix will be passed into the row function

    var row_obj = params.clust_group.selectAll('.row')
      .data(params.matrix)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.y_scale(index) + ')';
      });

    if (params.tile_type === 'simple') {
      row_obj = row_obj.each(row_function);
    } else {
      row_obj = row_obj.each(row_group_function);
    }

    // white lines in clustergram
    /////////////////////////////////

    // horizontal lines
    row_obj.append('line')
      //!! find ouw what 20 represents
      .attr('x2', 20 * params.clust.dim.width)
      .style('stroke-width', params.border_width / params.zoom_switch +
        'px')
      .style('stroke', 'white');

    // append vertical line groups
    var vert_lines = params.clust_group
      .selectAll('.vert_lines')
      .data(col_nodes)
      .enter()
      .append('g')
      .attr('class', 'vert_lines')
      .attr('transform', function(d, index) {
        return 'translate(' + params.x_scale(index) + ') rotate(-90)';
      });

    // add vertical lines
    vert_lines
      .append('line')
      .attr('x1', 0)
      .attr('x2', -params.clust.dim.height)
      .style('stroke-width', params.border_width + 'px')
      .style('stroke', 'white');


    // Row
    //////////////////////////////////
    // make container to pre-position zoomable elements
    var container_all_row = d3.select('#main_svg')
      .append('g')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
        params.clust.margin.top + ')');

    // white background rect for row labels
    container_all_row
      .append('rect')
      .attr('fill', params.background_color)
      .attr('width', params.norm_label.background.row)
      .attr('height', 30 * params.clust.dim.height + 'px')
      .attr('class', 'white_bars');

    // row_labels
    container_all_row
      .append('g')
      // position the outer row label group
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)')
      .append('g')
      .attr('id', 'row_labels');

    // generate and position the row labels
    var row_labels = d3.select('#row_labels')
      .selectAll('.row_label_text')
      .data(row_nodes)
      .enter()
      .append('g')
      .attr('class', 'row_label_text')
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.y_scale(index) + ')';
      })
      .on('dblclick', reorder_click_row)
      .on('mouseover', function() {
        // highlight text
        d3
          .select(this)
          .select('text')
          .classed('active',true);
      })
      .on('mouseout', function mouseout() {
        d3.select(this)
          .select('text')
          .classed('active',false)
      });

    // append row label text
    row_labels
      .append('text')
      .attr('y', params.y_scale.rangeBand() * 0.75)
      // .attr('dy', params.y_scale.rangeBand()/4)
      .attr('text-anchor', 'end')
      .style('font-size', params.default_fs_row + 'px')
      .text(function(d) {
        return d.name;
      });

    // append rectangle behind text
    row_labels
      .insert('rect', 'text')
      .attr('x', -10)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', 10)
      .style('opacity', 0);

    // change the size of the highlighting rects
    row_labels
      .each(function() {
        // get the bounding box of the row label text
        var bbox = d3.select(this)
          .select('text')[0][0]
          .getBBox();
        // use the bounding box to set the size of the rect
        d3.select(this)
          .select('rect')
          .attr('x', bbox.x * 0.5)
          .attr('y', 0)
          .attr('width', bbox.width * 0.5)
          .attr('height', params.y_scale.rangeBand())
          .style('fill', function() {
            var inst_hl = 'yellow';
            return inst_hl;
          })
          .style('opacity', function(d) {
            var inst_opacity = 0;
            // highlight target genes
            if (d.target === 1) {
              inst_opacity = 1;
            }
            return inst_opacity;
          });
      });

    // row triangles
    ///////////////////////
    var row_triangle_zoom = container_all_row
      .append('g')
      // shift by the width of the normal row labels
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)')
      .append('g')
      .attr('id', 'row_label_triangles');

    // append triangle background rect to zoomable group
    row_triangle_zoom
      .append('rect')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('width', params.class_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.clust.dim.height;
        return inst_height;
      });

    // append groups - each holds one triangle
    var row_triangle_ini_group = row_triangle_zoom
      .selectAll('g')
      .data(row_nodes)
      .enter()
      .append('g')
      .attr('class', 'row_triangle_group')
      .attr('transform', function(d, index) {
        return 'translate(0, ' + params.y_scale(index) + ')';
      });

    // add triangles
    row_triangle_ini_group
      .append('path')
      .attr('d', function() {
        var origin_x = params.class_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.y_scale.rangeBand() / 2;
        var final_x = params.class_room.symbol_width - 1;
        var final_y = params.y_scale.rangeBand();
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      })
      .attr('fill', function(d) {
        // initailize color
        var inst_color = '#eee';
        if (_.has(params, 'class_colors')) {
          inst_color = params.class_colors.row[d.cl];
        }
        return inst_color;
      });

    // add row group labels if necessary
    //////////////////////////////////////
    if (_.has(params, 'group_colors')) {

      // add rects for highlighting automatically identified groups
      var row_class_rect = row_triangle_ini_group
        .append('rect')
        .attr('class', 'row_class_rect')
        .attr('width', function() {
          var inst_width = params.class_room.symbol_width - 1;
          return inst_width + 'px';
        })
        .attr('height', params.y_scale.rangeBand())
        .style('fill', function(d) {
          var inst_level = params.group_level.row;
          return params.group_colors.row[d.group[inst_level]];
        })
        .attr('x', function() {
          var inst_offset = params.class_room.symbol_width + 1;
          return inst_offset + 'px';
        });

      // optional row callback on click
      if (typeof params.click_group === 'function') {
        // only add click functionality to row rect
        row_class_rect
          .on('click', function(d) {
            var inst_level = params.group_level.row;
            var inst_group = d.group[inst_level];
            // find all row names that are in the same group at the same group_level
            // get row_nodes
            row_nodes = d3_clustergram.network_data.row_nodes;
            var group_nodes = [];
            _.each(row_nodes, function(node) {
              // check that the node is in the group
              if (node.group[inst_level] === inst_group) {
                // make a list of genes that are in inst_group at this group_level
                group_nodes.push(node.name);
              }
            });

            // return the following information to the user
            // row or col, distance cutoff level, nodes
            var group_info = {};
            group_info.type = 'row';
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


    // col labels
    //////////////////////////////////
    // make container to pre-position zoomable elements
    var container_all_col = d3.select('#main_svg')
      .append('g')
      .attr('transform', 'translate(' + params.clust.margin.left + ',' +
        params.norm_label.margin.top + ')');

    // white background rect for col labels
    container_all_col
      .append('rect')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('width', 30 * params.clust.dim.width + 'px')
      .attr('height', params.norm_label.background.col)
      .attr('class', 'white_bars');

    // col labels
    container_all_col
      .append('g')
      // position the outer col label group
      .attr('transform', 'translate(0,' + params.norm_label.width.col + ')')
      .append('g')
      .attr('id', 'col_labels');

    // offset click group column label
    var x_offset_click = params.x_scale.rangeBand() / 2 + params.border_width;
    // reduce width of rotated rects
    var reduce_rect_width = params.x_scale.rangeBand() * 0.36;

    // add main column label group
    var col_label_obj = d3.select('#col_labels')
      .selectAll('.col_label_text')
      .data(col_nodes)
      .enter()
      .append('g')
      .attr('class', 'col_label_text')
      .attr('transform', function(d, index) {
        return 'translate(' + params.x_scale(index) + ') rotate(-90)';
      });

    // append group for individual column label
    var col_label_click = col_label_obj
      // append new group for rect and label (not white lines)
      .append('g')
      .attr('class', 'col_label_click')
      // rotate column labels
      .attr('transform', 'translate(' + params.x_scale.rangeBand() / 2 +
        ',' + x_offset_click + ') rotate(45)')
      .on('dblclick', reorder_click_col)
      .on('mouseover', function() {
        d3.select(this).select('text')
          .classed('active',true);
      })
      .on('mouseout', function mouseout() {
        d3.select(this).select('text')
          .classed('active',false);
      });

    // add column label
    col_label_click
      .append('text')
      .attr('x', 0)
      .attr('y', params.x_scale.rangeBand() * 0.60)
      // offset label to make room for triangle
      .attr('dx', 2 * params.border_width)
      .attr('text-anchor', 'start')
      .attr('full_name', function(d) {
        return d.name;
      })
      // original font size
      .style('font-size', params.default_fs_col + 'px')
      // // !! simple font size
      // .style('font-size', params.x_scale.rangeBand()*0.7+'px')
      .text(function(d) {
        return d.name.replace(/_/g, ' ');
      });

    // label the widest row and col labels
    ////////////////////////////////////////
    params.bounding_width_max = {};
    params.bounding_width_max.row = 0;
    d3.selectAll('.row_label_text').each(function() {
      var tmp_width = d3.select(this).select('text').node().getBBox().width;
      if (tmp_width > params.bounding_width_max.row) {
        params.bounding_width_max.row = tmp_width;
      }
    });

    params.bounding_width_max.col = 0;
    d3.selectAll('.col_label_click').each(function() {
      var tmp_width = d3.select(this).select('text').node().getBBox().width;
      if (tmp_width > params.bounding_width_max.col) {
        // increase the apparent width of the column label since its rotated
        // this will give more room for text
        params.bounding_width_max.col = tmp_width * 1.2;
      }
    });

    // optionally turn down sensitivity to row/col overflow
    params.bounding_width_max.col = params.bounding_width_max.col * params.label_overflow
      .col;
    params.bounding_width_max.row = params.bounding_width_max.row * params.label_overflow
      .row;


    // check if widest row or col are wider than the allowed label width
    ////////////////////////////////////////////////////////////////////////
    params.ini_scale_font = {};
    params.ini_scale_font.row = 1;
    params.ini_scale_font.col = 1;
    if (params.bounding_width_max.row * params.zoom.scale() > params.norm_label
      .width.row) {

      params.ini_scale_font.row = params.norm_label.width.row / params.bounding_width_max
        .row;
      // redefine bounding_width_max.row
      params.bounding_width_max.row = params.ini_scale_font.row * params.bounding_width_max
        .row;

      // redefine default fs
      params.default_fs_row = params.default_fs_row * params.ini_scale_font
        .row;
      // reduce font size
      d3.selectAll('.row_label_text').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.default_fs_row + 'px');
      });
    }

    if (params.bounding_width_max.col * params.zoom.scale() > params.norm_label
      .width.col) {
      params.ini_scale_font.col = params.norm_label.width.col / params.bounding_width_max
        .col;
      // redefine bounding_width_max.col
      params.bounding_width_max.col = params.ini_scale_font.col * params.bounding_width_max
        .col;
      // redefine default fs
      params.default_fs_col = params.default_fs_col * params.ini_scale_font
        .col;
      // reduce font size
      d3.selectAll('.col_label_click').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.default_fs_col + 'px');
      });
    }

    // append rectangle behind text
    col_label_click
      .insert('rect', 'text')
      .attr('x', 10)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', 10)
      .style('opacity', 0);

    // change the size of the highlighting rects
    col_label_click
      .each(function() {

        // get the bounding box of the row label text
        var bbox = d3.select(this)
          .select('text')[0][0]
          .getBBox();

        // use the bounding box to set the size of the rect
        d3.select(this)
          .select('rect')
          .attr('x', bbox.x * 1.25)
          .attr('y', 0)
          .attr('width', bbox.width * 1.25)
          // used a reduced rect width for the columsn
          // because the rects are slanted
          .attr('height', params.x_scale.rangeBand() * 0.6)
          .style('fill', 'yellow')
          .style('opacity', 0);
      });

    // add triangle under rotated labels
    col_label_click
      .append('path')
      .style('stroke-width', 0)
      .attr('d', function() {
        // x and y are flipped since its rotated
        var origin_y = -params.border_width;
        var start_x = 0;
        var final_x = params.x_scale.rangeBand() - reduce_rect_width;
        var start_y = -(params.x_scale.rangeBand() - reduce_rect_width +
          params.border_width);
        var final_y = -params.border_width;
        var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' +
          start_x + ', L ' + final_y + ',' + final_x + ' Z';
        return output_string;
      })
      .attr('fill', function(d) {
        var inst_color = '#eee';
        if (_.has(params, 'class_colors')) {
          inst_color = params.class_colors.col[d.cl];
        }
        return inst_color;
      });


    //!! get the abs maximum value from row/col use this to make red/blue bars
    // // get the max abs nl_pval (find obj and get nl_pval)
    // enr_max = _.max( col_nodes, function(d) { return Math.abs(d.nl_pval) } ).nl_pval ;

    // the enrichment bar should be 3/4ths of the height of the column labels
    params.bar_scale_col = d3.scale.linear()
      // .domain([0, enr_max])
      .domain([0, 1])
      .range([0, params.norm_label.width.col]);

    // append column value bars
    if (_.has(d3_clustergram.network_data.col_nodes[0], 'value')) {
      col_label_click
        .append('rect')
        .attr('class', 'col_bars')
        // column is rotated - effectively width and height are switched
        .attr('width', function(d) {
          return params.bar_scale_col(d.value);
        })
        // rotate labels - reduce width if rotating
        .attr('height', params.x_scale.rangeBand() * 0.66)
        .attr('fill', function() {
          // return d.color;
          return 'red';
        })
        .attr('opacity', 0.4);
    }

    // add group labels if necessary
    //////////////////////////////////
    if (_.has(params, 'group_colors')) {
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

      // add rects for highlighting - dendrogram-like
      col_class_ini_group
        .append('rect')
        .attr('class', 'col_class_rect')
        .attr('width', params.x_scale.rangeBand())
        .attr('height', function() {
          var inst_height = params.class_room.col - 1;
          return inst_height;
        })
        .style('fill', function(d) {
          var inst_level = params.group_level.col;
          return params.group_colors.col[d.group[inst_level]];
        });

      // optional column callback on click
      if (typeof params.click_group === 'function') {
        col_class_ini_group
          .on('click', function(d) {
            var inst_level = params.group_level.col;
            var inst_group = d.group[inst_level];
            // find all column names that are in the same group at the same group_level
            // get col_nodes
            col_nodes = d3_clustergram.network_data.col_nodes;
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

    // hide spillover from slanted column labels on right side
    container_all_col
      .append('path')
      .style('stroke-width', '0')
      // mini-language for drawing path in d3, used to draw triangle
      .attr('d', 'M 0,0 L 500,-500, L 500,0 Z')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('id', 'right_slant_triangle')
      .attr('transform', 'translate(' + params.clust.dim.width + ',' +
        params.norm_label.width.col + ')');

    // hide spillover from slanted column labels on left side
    container_all_col
      .append('path')
      .style('stroke-width', '0')
      // mini-language for drawing path in d3, used to draw triangle
      .attr('d', 'M 0,0 L 500,-500, L 0,-500 Z')
      .attr('fill', params.background_color)
      .attr('id', 'left_slant_triangle')
      // shift left by 1 px to prevent cutting off labels
      .attr('transform', 'translate(-1,' + params.norm_label.width.col +
        ')');

    // top corner rect
    ///////////////////////////////
    // white rect to cover excess labels
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('width', params.clust.margin.left)
      .attr('height', params.clust.margin.top)
      .attr('id', 'top_left_white');

    // hide spillover from right
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('width', '300px')
      .attr('height', '3000px')
      .attr('transform', function() {
        var tmp_left = params.clust.margin.left + params.clust.dim.width;
        var tmp_top = params.norm_label.margin.top + params.norm_label.width
          .col;
        return 'translate(' + tmp_left + ',' + tmp_top + ')';
      })
      .attr('class', 'white_bars');



    // only make the super titles if they are requested
    if (params.super_labels === 'yes') {

      // super col title
      /////////////////////////////////////
      // add super column title background
      d3.select('#main_svg')
        .append('rect')
        .attr('fill', params.background_color) //!! prog_colors
        .attr('height', params.super_label_width + 'px')
        .attr('width', '3000px')
        .attr('class', 'white_bars')
        .attr('transform', 'translate(0,' + params.grey_border_width + ')');

      // super col title
      d3.select('#main_svg')
        .append('text')
        .text(params.super.col)
        .attr('text-anchor', 'center')
        .attr('transform', function() {
          var inst_x = params.clust.dim.width / 2 + params.norm_label.width
            .row;
          var inst_y = params.super_label_width - params.uni_margin;
          return 'translate(' + inst_x + ',' + inst_y + ')';
        })
        .style('font-size', '14px')
        .style('font-weight', 300);

      // super row title
      /////////////////////////////////////
      // add super row title background
      d3.select('#main_svg')
        .append('rect')
        .attr('fill', params.background_color) //!! prog_colors
        .attr('width', params.super_label_width + 'px')
        .attr('height', '3000px')
        .attr('class', 'white_bars')
        .attr('transform', 'translate(' + params.grey_border_width + ',0)');

      // append super title row group
      // this is used to separate translation from rotation
      d3.select('#main_svg')
        .append('g')
        .attr('id', 'super_row_label')
        .attr('transform', function() {
          // position in the middle of the clustergram
          var inst_x = params.super_label_width - params.uni_margin;
          var inst_y = params.clust.dim.height / 2 + params.norm_label.width
            .col;
          return 'translate(' + inst_x + ',' + inst_y + ')';
        });

      // super row label (rotate the already translated title )
      d3.select('#super_row_label')
        .append('text')
        .text(params.super.row)
        .attr('text-anchor', 'center')
        .attr('transform', 'rotate(-90)')
        .style('font-size', '14px')
        .style('font-weight', 300);

    }

    // white border bottom - prevent clustergram from hitting border
    ///////////////////////////////////////////////////////////////////
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('width', params.svg_dim.width)
      // make this border twice the width of the grey border
      .attr('height', 2 * params.grey_border_width)
      .attr('transform', function() {
        // shift up enough to show the entire border width
        var inst_offset = params.svg_dim.height - 3 * params.grey_border_width;
        return 'translate(0,' + inst_offset + ')';
      });

    // add border to svg in four separate lines - to not interfere with clicking anything
    ///////////////////////////////////////////////////////////////////////////////////////
    // left border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.super_border_color) //!! prog_colors
      .attr('width', params.grey_border_width)
      .attr('height', params.svg_dim.height)
      .attr('transform', 'translate(0,0)');

    // right border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.super_border_color) //!! prog_colors
      .attr('width', params.grey_border_width)
      .attr('height', params.svg_dim.height)
      .attr('transform', function() {
        var inst_offset = params.svg_dim.width - params.grey_border_width;
        return 'translate(' + inst_offset + ',0)';
      });

    // top border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.super_border_color) //!! prog_colors
      .attr('width', params.svg_dim.width)
      .attr('height', params.grey_border_width)
      .attr('transform', function() {
        var inst_offset = 0;
        return 'translate(' + inst_offset + ',0)';
      });

    // bottom border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.super_border_color) //!! prog_colors
      .attr('width', params.svg_dim.width)
      .attr('height', params.grey_border_width)
      .attr('transform', function() {
        var inst_offset = params.svg_dim.height - params.grey_border_width;
        return 'translate(0,' + inst_offset + ')';
      });

    // initialize zoom and translate
    ///////////////////////////////////
    // initialize translate vector to compensate for label margins
    params.zoom.translate([params.clust.margin.left, params.clust.margin.top]);

    // resize window
    d3.select(window).on('resize', timeout_resize);

    // disable double-click zoom: double click should reset zoom level
    // do this for all svg elements
    d3.selectAll('svg').on('dblclick.zoom', null);

    // double click to reset zoom - add transition
    d3.select('#main_svg')
      .on('dblclick', function() {
        // apply the following two translate zoom to reset zoom
        // programatically
        two_translate_zoom(0, 0, 1);
      });
  }


  // parent_div: size and position svg container - svg_div
  //////////////////////////////////////////////
  function parent_div_size_pos(params) {

    if (params.resize === true) {
      // get outer_margins
      var outer_margins = params.outer_margins;

      // get the size of the window
      var screen_width = window.innerWidth;
      var screen_height = window.innerHeight;

      // define width and height of clustergram container
      var container_dim = {};
      container_dim.width = screen_width - outer_margins.left -
        outer_margins.right;
      container_dim.height = screen_height - outer_margins.top -
        outer_margins.bottom;

      // size the svg container div - svg_div
      d3.select('#' + params.svg_div_id)
        .style('margin-left', outer_margins.left + 'px')
        .style('margin-top', outer_margins.top + 'px')
        .style('width', container_dim.width + 'px')
        .style('height', container_dim.height + 'px');
    } else {
      // get outer_margins
      outer_margins = params.outer_margins;

      // size the svg container div - svg_div
      d3.select('#' + params.svg_div_id)
        .style('margin-left', outer_margins.left + 'px')
        .style('margin-top', outer_margins.top + 'px');
    }
  }

  //!! this needs to be improved
  //!! I will have to generalize this
  function highlight_resource_types(params) {

    // var col_nodes = d3_clustergram.network_data.col_nodes;
    var row_nodes = d3_clustergram.network_data.row_nodes;

    // // This will set up the resource type color key
    // // and generate an array of genes for later use
    // //////////////////////////////////////////////////////

    // // res_hexcodes = ['#097054','#FFDE00','#6599FF','#FF9900','#834C24','#003366','#1F1209']

    // var res_hexcodes = ['#0000FF','#FF0000','#C0C0C0', '#FFA500'];

    // define cell line groups
    // var all_groups = ['TF group 1','TF group 2','TF group 3'];

    // var all_groups = _.keys(params.class_colors.row);

    // // generate an object to associate group with color
    // var res_color_dict = {};

    // // initialize the cell line color associations
    // var blue_cl = ['H1437','H1792','HCC15','A549','H1944','H1299','H1355','H838','CAL-12T','H23','H460','H661'];
    // var red_cl = ['H441','HCC78','H1734','H2228','H1781','H1975','H358','HCC827','H1703','H2342','H1650','LOU-NH91'];
    // var grey_cl = ['CALU-3','H2405','H2106', 'HCC44','H1666'];
    // var orange_cl = [] //['HCC44','H1666'];

    // for (var i=0; i<col_nodes.length;i++){
    //   // add blue cell line
    //   if ( $.inArray(col_nodes[i]['name'],blue_cl) > -1 ){
    //     res_color_dict[col_nodes[i]['name']]=res_hexcodes[0];
    //   };
    //   // add red cell line
    //   if ( $.inArray(col_nodes[i]['name'],red_cl)  > -1 ){
    //     res_color_dict[col_nodes[i]['name']]=res_hexcodes[1];
    //   };
    //   // add grey cell line
    //   if ( $.inArray(col_nodes[i]['name'],grey_cl)  > -1 ){
    //     res_color_dict[col_nodes[i]['name']]=res_hexcodes[2];
    //   };
    //   // add orange cell line
    //   if ( $.inArray(col_nodes[i]['name'],orange_cl)  > -1 ){
    //     res_color_dict[col_nodes[i]['name']]=res_hexcodes[3];
    //   };
    // }

    // // export to global variable
    // params.res_color_dict = res_color_dict;

    // // define association between tf groups and colors
    // var res_color_key = {}
    // res_color_key['TF group 1'] = res_hexcodes[0];
    // res_color_key['TF group 2'] = res_hexcodes[1];
    // res_color_key['TF group 3'] = res_hexcodes[2];
    // res_color_key['TF group 4'] = res_hexcodes[3];

    // // add color key
    // ////////////////////
    // // add keys
    // var key_divs = d3.select('#res_color_key_div')
    //   .selectAll('row')
    //   .data(all_groups)
    //   .enter()
    //   .append('row')
    //   .style('padding-top','15px');

    // // add color
    // key_divs
    //   .append('div')
    //   .attr('class','col-xs-2')
    //   // get rid of excess padding
    //   .style('padding-left','5px')
    //   .style('padding-right','0px')
    //   .style('padding-top','1px')
    //   .append('div')
    //   .style('width','12px')
    //   .style('height','12px')
    //   .style('background-color', function(d){
    //     return params.class_colors.row[d];
    //   })

    // // add names
    // key_divs
    //   .append('div')
    //   .attr('class','col-xs-10 res_names_in_key')
    //   .append('text')
    //   .text(function(d){
    //     var inst_res = d.replace(/_/g, ' ');
    //     return inst_res ;
    //   })

    // generate a list of genes for auto complete
    ////////////////////////////////////////////////
    // get all genes
    params.all_genes = [];

    // loop through row_nodes
    for (var i = 0; i < row_nodes.length; i++) {
      params.all_genes.push(row_nodes[i].name);
    }

    // use Jquery autocomplete
    ////////////////////////////////
    $('#gene_search_box').autocomplete({
      source: params.all_genes
    });

    return params;
  }

  // make each row in the clustergram
  function row_function(inp_row_data) {

    // remove zero values to make visualization faster
    var row_data = _.filter(inp_row_data, function(num) {
      return num.value !== 0;
    });

    // load parameters
    var params = d3_clustergram.params;

    // generate tiles in the current row
    var tile = d3.select(this)
      // data join
      .selectAll('rect')
      .data(row_data)
      .enter()
      .append('rect')
      .attr('class', 'tile')
      .attr('transform', function(d) {
        return 'translate(' + params.x_scale(d.pos_x) + ',0)';
      })
      .attr('width', params.x_scale.rangeBand())
      .attr('height', params.y_scale.rangeBand() * 0.98)
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = params.opacity_scale(Math.abs(d.value));
        return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function(d) {
        return d.value > 0 ? params.tile_colors[0] : params.tile_colors[1];
      })
      .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d, i) {
            return i === p.pos_y;
          });
        d3.selectAll('.col_label_text text')
          .classed('active', function(d, i) {
            return i === p.pos_x;
          });
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
      })
      .attr('title', function(d) {
        return d.value;
      });

    // add callback function to tile group - if one is supplied by the user
    if (typeof params.click_tile === 'function') {
      d3.selectAll('.tile')
        .on('click', function(d) {
          // export row/col name and value from tile
          var tile_info = {};
          tile_info.row = d3_clustergram.network_data.row_nodes[d.pos_y].name;
          tile_info.col = d3_clustergram.network_data.col_nodes[d.pos_x].name;
          tile_info.value = d.value;
          if (_.has(d, 'value_up')) {
            tile_info.value_up = d.value_up;
          }
          if (_.has(d, 'value_dn')) {
            tile_info.value_dn = d.value_dn;
          }
          if (_.has(d, 'info')) {
            tile_info.info = d.info;
          }
          // run the user supplied callback function
          params.click_tile(tile_info);
        });
    }

    // append title to group
    if (params.title_tile === true) {
      tile
        .append('title')
        .text(function(d) {
          var inst_string = 'value: ' + d.value;
          return inst_string;
        });
    }
  }

  // make each row in the clustergram
  function row_group_function(inp_row_data) {

    // remove zero values to make visualization faster
    var row_data = _.filter(inp_row_data, function(num) {
      return num.value !== 0;
    });

    // load parameters
    var params = d3_clustergram.params;

    // generate groups
    var tile = d3.select(this)
      // data join
      .selectAll('g')
      .data(row_data)
      .enter()
      .append('g')
      .attr('class', 'tile')
      .attr('transform', function(d) {
        return 'translate(' + params.x_scale(d.pos_x) + ',0)';
      });

    // append rect
    tile
      .append('rect')
      // .attr('class','tile')
      .attr('width', params.x_scale.rangeBand())
      .attr('height', params.y_scale.rangeBand() * 0.98)
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = params.opacity_scale(Math.abs(d.value));
        if (Math.abs(d.value_up) > 0 && Math.abs(d.value_dn) > 0) {
          output_opacity = 0;
        }
        return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function(d) {
        // normal rule
        return d.value > 0 ? params.tile_colors[0] : params.tile_colors[1];
        // //!! special rule for LDRgram
        // return d.value_dn < 0 ? params.tile_colors[0] : params.tile_colors[1] ;
      });

    tile
      .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d, i) {
            return i === p.pos_y;
          });
        d3.selectAll('.col_label_text text')
          .classed('active', function(d, i) {
            return i === p.pos_x;
          });
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
      })
      .attr('title', function(d) {
        return d.value;
      });


    // // append evidence highlighting - black rects
    if (params.highlight === 1) {
      // console.log(row_data[0])
      tile
        .append('rect')
        .attr('width', params.x_scale.rangeBand() * 0.80)
        .attr('height', params.y_scale.rangeBand() * 0.80)
        .attr('class', 'highlighting_rect')
        .attr('transform', 'translate(' + params.x_scale.rangeBand() / 10 +
          ' , ' + params.y_scale.rangeBand() / 10 + ')')
        .attr('class', 'cell_highlight')
        .attr('stroke', 'black')
        .attr('stroke-width', 1.0)
        .attr('fill-opacity', 0.0)
        .attr('stroke-opacity', function(d) {
          // initialize opacity to 0
          var inst_opacity = 0;
          // set opacity to 1 if there is evidence
          if (d.highlight === 1) {
            inst_opacity = 1;
          }
          return inst_opacity;
        });
    }

    // add callback function to tile group - if one is supplied by the user
    if (typeof params.click_tile === 'function') {
      // d3.selectAll('.tile')
      tile
        .on('click', function(d) {
          // export row/col name and value from tile
          var tile_info = {};
          tile_info.row = d3_clustergram.network_data.row_nodes[d.pos_y].name;
          tile_info.col = d3_clustergram.network_data.col_nodes[d.pos_x].name;
          tile_info.value = d.value;
          if (_.has(d, 'value_up')) {
            tile_info.value_up = d.value_up;
          }
          if (_.has(d, 'value_dn')) {
            tile_info.value_dn = d.value_dn;
          }
          if (_.has(d, 'info')) {
            tile_info.info = d.info;
          }
          // run the user supplied callback function
          params.click_tile(tile_info);
        });
    }


    // split-up
    tile
      .append('path')
      .style('stroke', 'black')
      .style('stroke-width', 0)
      .attr('d', function() {
        var start_x = 0;
        var final_x = params.x_scale.rangeBand();
        var start_y = 0;
        var final_y = params.y_scale.rangeBand() - params.y_scale.rangeBand() /
          60;
        var output_string = 'M' + start_x + ',' + start_y + ', L' +
          start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
        return output_string;
      })
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = 0;
        if (Math.abs(d.value_dn) > 0) {
          output_opacity = params.opacity_scale(Math.abs(d.value_up));
        }
        return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function() {
        // rl_t (released) blue
        return params.tile_colors[0];
      });


    // split-dn
    tile
      .append('path')
      .style('stroke', 'black')
      .style('stroke-width', 0)
      .attr('d', function() {
        var start_x = 0;
        var final_x = params.x_scale.rangeBand();
        var start_y = params.y_scale.rangeBand() - params.y_scale.rangeBand() /
          60;
        var final_y = params.y_scale.rangeBand() - params.y_scale.rangeBand() /
          60;
        var output_string = 'M' + start_x + ', ' + start_y + ' ,       L' +
          final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
        return output_string;
      })
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = 0;
        if (Math.abs(d.value_up) > 0) {
          output_opacity = params.opacity_scale(Math.abs(d.value_dn));
        }
        return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function() {
        // rl_f (not released) orange
        return params.tile_colors[1];
      });

    // append title to group
    if (params.title_tile === true) {
      tile
        .append('title')
        .text(function(d) {
          var inst_string = 'value: ' + d.value;
          return inst_string;
        });
    }
  }

  // reorder the matrix using the toggle switch
  function reorder(inst_order) {

    // load parameters from d3_clustergram
    var params = d3_clustergram.params;

    // set running transition value
    d3_clustergram.params.run_trans = 1;

    // load orders
    if (inst_order === 'clust') {
      params.x_scale.domain(params.orders.clust_row);
      params.y_scale.domain(params.orders.clust_col);
    } else if (inst_order === 'rank') {
      params.x_scale.domain(params.orders.rank_row);
      params.y_scale.domain(params.orders.rank_col);
    } else if (inst_order === 'class') {
      params.x_scale.domain(params.orders.class_row);
      params.y_scale.domain(params.orders.class_col);
    }

    // define the t variable as the transition function
    var t = params.clust_group.transition().duration(2500);

    // reorder matrix
    t.selectAll('.row')
      .attr('transform', function(d, i) {
        return 'translate(0,' + params.y_scale(i) + ')';
      })
      .selectAll('.tile')
      .attr('transform', function(d) {
        return 'translate(' + params.x_scale(d.pos_x) + ' , 0)';
      });

    // Move Row Labels
    d3.select('#row_labels').selectAll('.row_label_text')
      .transition().duration(2500)
      .attr('transform', function(d, i) {
        return 'translate(0,' + params.y_scale(i) + ')';
      });

    // t.selectAll('.column')
    d3.select('#col_labels').selectAll('.col_label_text')
      .transition().duration(2500)
      .attr('transform', function(d, i) {
        return 'translate(' + params.x_scale(i) + ')rotate(-90)';
      });

    // reorder row_label_triangle groups
    d3.selectAll('.row_triangle_group')
      .transition().duration(2500)
      .attr('transform', function(d, i) {
        return 'translate(0,' + params.y_scale(i) + ')';
      });

    // reorder col_class groups
    d3.selectAll('.col_class_group')
      .transition().duration(2500)
      .attr('transform', function(d, i) {
        return 'translate(' + params.x_scale(i) + ',0)';
      })
      .each('end', function() {
        // set running transition to 0
        console.log('finished with transition ');
        d3_clustergram.params.run_trans = 0;
      });

    // backup allow programmatic zoom
    setTimeout(end_reorder, 2500);

  }

  // tmp backup function to allow programmatic zoom after reordering
  function end_reorder() {
    d3_clustergram.params.run_trans = 0;
  }

  // recalculate the size of the visualization
  // and remake the clustergram
  function reset_visualization_size() {

    // remake the clustergram
    d3_clustergram.make_clust(d3_clustergram.params.args);

    // reset zoom and translate
    d3_clustergram.params.zoom.scale(1).translate([d3_clustergram.params.clust
      .margin.left, d3_clustergram.params.clust.margin.top
    ]);

    // // turn off the wait sign
    // $.unblockUI();
  }

  // define zoomed function
  function zoomed() {

    // gather transformation components
    /////////////////////////////////////
    // gather zoom components
    var zoom_x = d3.event.scale;
    var zoom_y = d3.event.scale;

    // gather translate vector components
    var trans_x = d3.event.translate[0] - d3_clustergram.params.clust.margin
      .left;
    var trans_y = d3.event.translate[1] - d3_clustergram.params.clust.margin
      .top;

    // apply transformation
    apply_transformation(trans_x, trans_y, zoom_x, zoom_y);

    // reset highlighted col
    d3.select('#clicked_col')
      .style('font-weight', 'bold');
  }

  // apply transformation
  function apply_transformation(trans_x, trans_y, zoom_x, zoom_y) {

    // load parameters
    var params = d3_clustergram.params;

    // define d3 scale
    var d3_scale = zoom_x;

    // y - rules
    ///////////////////////////////////////////////////
    // available panning room in the y direction
    // multiple extra room (zoom - 1) by the width
    // always defined in the same way
    var pan_room_y = (d3_scale - 1) * params.clust.dim.height;

    // do not translate if translate in y direction is positive
    if (trans_y >= 0) {
      // restrict transformation parameters
      // no panning in either direction
      trans_y = 0;
    }
    // restrict y pan to pan_room_y if necessary
    else if (trans_y <= -pan_room_y) {
      trans_y = -pan_room_y;
    }

    // x - rules
    ///////////////////////////////////////////////////
    // zoom in y direction only - translate in y only
    if (d3_scale < params.zoom_switch) {
      // no x translate or zoom
      trans_x = 0;
      zoom_x = 1;
    }
    // zoom in both directions
    // scale is greater than params.zoom_switch
    else {
      // available panning room in the x direction
      // multiple extra room (zoom - 1) by the width
      var pan_room_x = (d3_scale / params.zoom_switch - 1) * params.clust.dim
        .width;

      // no panning in the positive direction
      if (trans_x > 0) {
        // restrict transformation parameters
        // no panning in the x direction
        trans_x = 0;
        // set zoom_x
        zoom_x = d3_scale / params.zoom_switch;
      }
      // restrict panning to pan_room_x
      else if (trans_x <= -pan_room_x) {
        // restrict transformation parameters
        // no panning in the x direction
        trans_x = -pan_room_x;
        // set zoom_x
        zoom_x = d3_scale / params.zoom_switch;
      }
      // allow two dimensional panning
      else {
        // restrict transformation parameters
        // set zoom_x
        zoom_x = d3_scale / params.zoom_switch;
      }
    }

    // apply transformation and reset translate vector
    // the zoom vector (zoom.scale) never gets reset
    ///////////////////////////////////////////////////
    // translate clustergram
    params.clust_group
      .attr('transform', 'translate(' + [trans_x, trans_y] + ') scale(' +
        zoom_x + ',' + zoom_y + ')');

    // transform row labels
    d3.select('#row_labels')
      .attr('transform', 'translate(' + [0, trans_y] + ') scale(' + zoom_y +
        ')');

    // transform row_label_triangles
    // use the offset saved in params, only zoom in the y direction
    d3.select('#row_label_triangles')
      .attr('transform', 'translate(' + [0, trans_y] + ') scale( 1,' +
        zoom_y + ')');

    // transform col labels
    // move down col labels as zooming occurs, subtract trans_x - 20 almost works
    d3.select('#col_labels')
      .attr('transform', 'translate(' + [trans_x, 0] + ') scale(' + zoom_x +
        ')');

    // transform col_class
    d3.select('#col_class')
      .attr('transform', 'translate(' + [trans_x, 0] + ') scale(' + zoom_x +
        ',1)');

    // reset translate vector - add back margins to trans_x and trans_y
    params.zoom
      .translate([trans_x + params.clust.margin.left, trans_y + params.clust
        .margin.top
      ]);

    // // Font Sizes
    // ////////////////////////////////////////////////////////
    // // reduce the font size by dividing by some part of the zoom
    // // if reduce_font_size_factor_ is 1, then the font will be divided by the whole zoom - and the labels will not increase in size
    // // if reduce_font_size_factor_ is 0, then the font will be divided 1 - and the labels will increase cuction of the font size
    // var reduce_fs_scale_row = d3.scale.linear().domain([0,1]).range([1,zoom_y]).clamp('true');
    // // scale down the font to compensate for zooming
    // // var fin_font_row = params.default_fs_row/(reduce_fs_scale_row( params.reduce_font_size.row ));
    // var fin_font_row = (params.y_scale.rangeBand()*0.75)/(reduce_fs_scale_row( params.reduce_font_size.row ));
    // // add back the 'px' to the font size
    // fin_font_row = fin_font_row + 'px';

    // // change the font size of the labels
    // d3.selectAll('.row_label_text')
    //   .select('text')
    //   .style('font-size', fin_font_row);

    // // console.log('zoom x')
    // // console.log(zoom_x)
    // // console.log(zoom_y)
    // // console.log('real font size')

    // // reduce font-size to compensate for zoom
    // // calculate the recuction of the font size
    // var reduce_fs_scale_col = d3.scale.linear().domain([0,1]).range([1,zoom_x]).clamp('true');
    // // scale down the font to compensate for zooming
    // // var fin_font_col = params.default_fs_col/(reduce_fs_scale_col( params.reduce_font_size.col ));
    // var fin_font_col = (params.x_scale.rangeBand()*0.6)/(reduce_fs_scale_col( params.reduce_font_size.col ));
    // // add back the 'px' to the font size
    // fin_font_col = fin_font_col + 'px';
    // // change the font size of the labels
    // d3.selectAll('.col_label_text')
    //   .select('text')
    //   .style('font-size', fin_font_col);

    // console.log( d3_clustergram.params.zoom.scale()* d3.select('.row_label_text').select('text').node().getBBox().width )



    // check if widest row or col are wider than the allowed label width
    ////////////////////////////////////////////////////////////////////////

    if (params.bounding_width_max.row * params.zoom.scale() > params.norm_label.width.row) {
      params.zoom_scale_font.row = params.norm_label.width.row / (params.bounding_width_max
        .row * params.zoom.scale());

      // reduce font size
      d3.selectAll('.row_label_text').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.default_fs_row * params.zoom_scale_font.row + 'px')
          .attr('y', params.y_scale.rangeBand() * params.scale_font_offset(
            params.zoom_scale_font.row));
      });

    } else {
      // reset font size
      d3.selectAll('.row_label_text').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.default_fs_row + 'px')
          .attr('y', params.y_scale.rangeBand() * 0.75);
      });
    }

    if (params.bounding_width_max.col * (params.zoom.scale() / params.zoom_switch) >
      params.norm_label.width.col) {
      params.zoom_scale_font.col = params.norm_label.width.col / (params.bounding_width_max
        .col * (params.zoom.scale() / params.zoom_switch));

      // reduce font size
      d3.selectAll('.col_label_click').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.default_fs_col * params.zoom_scale_font
            .col + 'px');
      });

    } else {
      // reset font size
      d3.selectAll('.col_label_click').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.default_fs_col + 'px');
      });
    }


    // column value bars
    ///////////////////////

    if (_.has(d3_clustergram.network_data.col_nodes[0], 'value')) {
      d3.selectAll('.col_bars')
        // column is rotated - effectively width and height are switched
        .attr('width', function(d) {
          return params.bar_scale_col(d.value) / (zoom_x);
        });
    }

    // //!! change the size of the highlighting rects
    // //////////////////////////////////////////////
    // // re-size of the highlighting rects
    // d3.select('#row_labels')
    //   .each(function(){
    //     // get the bounding box of the row label text
    //     var bbox = d3.select(this)
    //                  .select('text')[0][0]
    //                  .getBBox();
    //     // use the bounding box to set the size of the rect
    //     d3.select(this)
    //       .select('rect')
    //     .attr('x', bbox.x*0.5)
    //     .attr('y', 0)
    //     .attr('width', bbox.width*0.5)
    //     .attr('height', params.y_scale.rangeBand())
    //     .style('fill','yellow');
    // });

    // // col_label_click
    // d3.select('#col_labels')
    //   .each(function(){
    //     // get the bounding box of the row label text
    //     var bbox = d3.select(this)
    //                  .select('text')[0][0]
    //                  .getBBox();
    //     // use the bounding box to set the size of the rect
    //     d3.select(this)
    //       .select('rect')
    //     .attr('x', bbox.x*1.25)
    //     .attr('y', 0)
    //     .attr('width', bbox.width * 1.25)
    //     // used thd reduced rect width for the columsn
    //     // reduced because thee rects are slanted
    //     .attr('height', params.x_scale.rangeBand()*0.6)
    //     .style('fill','yellow')
    //     .style('opacity',0);
    //   });
  }

  function two_translate_zoom(pan_dx, pan_dy, fin_zoom) {

    // get parameters
    var params = d3_clustergram.params;

    if (d3_clustergram.params.run_trans === 0) {

      // define the commonly used variable half_height
      var half_height = params.clust.dim.height / 2;

      // y pan room, the pan room has to be less than half_height since
      // zooming in on a gene that is near the top of the clustergram also causes
      // panning out of the visible region
      var y_pan_room = half_height / params.zoom_switch;

      // prevent visualization from panning down too much
      // when zooming into genes near the top of the clustergram
      if (pan_dy >= half_height - y_pan_room) {

        // explanation of panning rules
        /////////////////////////////////
        // prevent the clustergram from panning down too much
        // if the amount of panning is equal to the half_height then it needs to be reduced
        // effectively, the the visualization needs to be moved up (negative) by some factor
        // of the half-width-of-the-visualization.
        //
        // If there was no zooming involved, then the
        // visualization would be centered first, then panned to center the top term
        // this would require a
        // correction to re-center it. However, because of the zooming the offset is
        // reduced by the zoom factor (this is because the panning is occurring on something
        // that will be zoomed into - this is why the pan_dy value is not scaled in the two
        // translate transformations, but it has to be scaled afterwards to set the translate
        // vector)
        // pan_dy = half_height - (half_height)/params.zoom_switch

        // if pan_dy is greater than the pan room, then panning has to be restricted
        // start by shifting back up (negative) by half_height/params.zoom_switch then shift back down
        // by the difference between half_height and pan_dy (so that the top of the clustergram is
        // visible)
        var shift_top_viz = half_height - pan_dy;
        var shift_up_viz = -half_height / params.zoom_switch +
          shift_top_viz;

        // reduce pan_dy so that the visualization does not get panned to far down
        pan_dy = pan_dy + shift_up_viz;
      }

      // prevent visualization from panning up too much
      // when zooming into genes at the bottom of the clustergram
      if (pan_dy < -(half_height - y_pan_room)) {

        // console.log('restricting pan up')
        shift_top_viz = half_height + pan_dy;

        shift_up_viz = half_height / params.zoom_switch - shift_top_viz; //- move_up_one_row;

        // reduce pan_dy so that the visualization does not get panned to far down
        pan_dy = pan_dy + shift_up_viz;

      }

      // will improve this !!
      var zoom_y = fin_zoom;
      var zoom_x = 1;

      // search duration - the duration of zooming and panning
      var search_duration = 700;

      // center_y
      var center_y = -(zoom_y - 1) * half_height;

      // transform clust group
      ////////////////////////////
      params.clust_group
        .transition()
        .duration(search_duration)
        // first apply the margin transformation
        // then zoom, then apply the final transformation
        .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
          ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [pan_dx,
            pan_dy
          ] + ')');

      // transform row labels
      d3.select('#row_labels')
        .transition()
        .duration(search_duration)
        .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
          zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

      // transform row_label_triangles
      // use the offset saved in params, only zoom in the y direction
      d3.select('#row_label_triangles')
        .transition()
        .duration(search_duration)
        .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
          1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

      // transform col labels
      d3.select('#col_labels')
        .transition()
        .duration(search_duration)
        .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
          pan_dx, 0
        ] + ')');

      // transform col_class
      d3.select('#col_class')
        .transition()
        .duration(search_duration)
        .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
          pan_dx, 0
        ] + ')');

      // set y translate: center_y is positive, positive moves the visualization down
      // the translate vector has the initial margin, the first y centering, and pan_dy
      // times the scaling zoom_y
      var net_y_offset = params.clust.margin.top + center_y + pan_dy *
        zoom_y;

      // reset the zoom translate and zoom
      params.zoom.scale(zoom_y);
      params.zoom.translate([pan_dx, net_y_offset]);

      // // Font Sizes
      // /////////////////////////////////////////////////
      // // reduce font-size to compensate for zoom
      // // calculate the recuction of the font size
      // var reduce_fs_scale_row = d3.scale.linear().domain([0,1]).range([1,zoom_y]).clamp('true');
      // // scale down the font to compensate for zooming
      // var fin_font_row = params.default_fs_row/(reduce_fs_scale_row( params.reduce_font_size.row ));
      // // add back the 'px' to the font size
      // fin_font_row = fin_font_row + 'px';
      // // change the font size of the labels
      // d3.selectAll('.row_label_text')
      //   .transition()
      //   .duration(search_duration)
      //   .select('text')
      //   .style('font-size', fin_font_row);

      // // reduce font-size to compensate for zoom
      // // calculate the recuction of the font size
      // var reduce_fs_scale_col = d3.scale.linear().domain([0,1]).range([1,zoom_x]).clamp('true');
      // // scale down the font to compensate for zooming
      // var fin_font_col = params.default_fs_col/(reduce_fs_scale_col( params.reduce_font_size.col ));
      // // add back the 'px' to the font size
      // fin_font_col = fin_font_col + 'px';
      // // change the font size of the labels
      // d3.selectAll('.col_label_text')
      //   .transition()
      //   .duration(search_duration)
      //   .select('text')
      //   .style('font-size', fin_font_col);

      // check if widest row or col are wider than the allowed label width
      ////////////////////////////////////////////////////////////////////////

      if (params.bounding_width_max.row * params.zoom.scale() > params.norm_label
        .width.row) {
        params.zoom_scale_font.row = params.norm_label.width.row / (params.bounding_width_max
          .row * params.zoom.scale());

        // reduce font size
        d3.selectAll('.row_label_text').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.default_fs_row * params.zoom_scale_font
              .row + 'px')
            .attr('y', params.y_scale.rangeBand() * params.scale_font_offset(
              params.zoom_scale_font.row));
        });

      } else {
        // reset font size
        d3.selectAll('.row_label_text').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.default_fs_row + 'px')
            .attr('y', params.y_scale.rangeBand() * 0.75);
        });
      }

      if (params.bounding_width_max.col * (params.zoom.scale() / params.zoom_switch) >
        params.norm_label.width.col) {
        params.zoom_scale_font.col = params.norm_label.width.col / (params.bounding_width_max
          .col * (params.zoom.scale() / params.zoom_switch));

        // reduce font size
        d3.selectAll('.col_label_click').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.default_fs_col * params.zoom_scale_font
              .col + 'px');
        });

      } else {
        // reset font size
        d3.selectAll('.col_label_click').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.default_fs_col + 'px');
        });
      }

      // re-size of the highlighting rects
      /////////////////////////////////////////
      d3.select('#row_labels')
        .each(function() {
          // get the bounding box of the row label text
          var bbox = d3.select(this)
            .select('text')[0][0]
            .getBBox();

          // use the bounding box to set the size of the rect
          d3.select(this)
            .select('rect')
            .attr('x', bbox.x * 0.5)
            .attr('y', 0)
            .attr('width', bbox.width * 0.5)
            .attr('height', params.y_scale.rangeBand())
            .style('fill', 'yellow');
        });


      // column value bars
      ///////////////////////
      // reduce the height of the column value bars based on the zoom applied
      // recalculate the height and divide by the zooming scale
      // col_label_obj.select('rect')
      if (_.has(d3_clustergram.network_data.col_nodes[0], 'value')) {
        d3.selectAll('.col_bars')
          .transition()
          .duration(search_duration)
          // column is rotated - effectively width and height are switched
          .attr('width', function(d) {
            return params.bar_scale_col(d.value) / (zoom_x);
          });
      }
    }
  }

  // reorder columns with row click
  function reorder_click_row() {

    // set running transition value
    d3_clustergram.params.run_trans = 1;

    // get parameters
    var params = d3_clustergram.params;

    // get row_nodes from global variable
    var row_nodes = d3_clustergram.network_data.row_nodes;
    var col_nodes = d3_clustergram.network_data.col_nodes;

    // get inst row (gene)
    var inst_gene = d3.select(this).select('text').text();

    // highlight clicked column
    // first un-highlight all others
    d3.selectAll('.rol_label_text').select('text')
      .style('font-weight', 'normal');
    // remove previous id
    d3.select('#clicked_row')
      .attr('id', '');

    // find the row number of this term from row_nodes
    // gather row node names
    var tmp_arr = [];
    _.each(row_nodes, function(node) {
      tmp_arr.push(node.name);
    });

    // find index
    var inst_row = _.indexOf(tmp_arr, inst_gene);

    // gather the values of the input genes
    tmp_arr = [];
    _.each(col_nodes, function(node, index) {
      tmp_arr.push(params.matrix[inst_row][index].value);
    });

    // sort the rows
    var tmp_sort = d3.range(tmp_arr.length).sort(function(a, b) {
      return tmp_arr[b] - tmp_arr[a];
    });

    // resort the columns (resort x)
    ///////////////////////////////////
    params.x_scale.domain(tmp_sort);

    // reorder
    ////////////////////

    // define the t variable as the transition function
    var t = params.clust_group.transition().duration(2500);

    // reorder matrix
    t.selectAll('.tile')
      .attr('transform', function(data) {
        return 'translate(' + params.x_scale(data.pos_x) + ',0)';
      });

    // Move Col Labels
    d3.select('#col_labels').selectAll('.col_label_text')
      .transition().duration(2500)
      .attr('transform', function(data, index) {
        return 'translate(' + params.x_scale(index) + ')rotate(-90)';
      });


    // reorder col_class groups
    d3.selectAll('.col_class_group')
      .transition().duration(2500)
      .attr('transform', function(data, index) {
        return 'translate(' + params.x_scale(index) + ',0)';
      })
      .each('end', function() {
        // set running transition to 0
        d3_clustergram.params.run_trans = 0;
      });

    // highlight selected row
    ///////////////////////////////
    d3.selectAll('.row_label_text')
      .select('rect')
      .style('opacity', 0);

    // highlight column name
    d3.select(this)
      .select('rect')
      .style('opacity', 1);

    // backup allow programmatic zoom
    setTimeout(end_reorder, 2500);
  }

  // reorder rows with column click
  function reorder_click_col() {

    // set running transition value
    d3_clustergram.params.run_trans = 1;

    // get parameters
    var params = d3_clustergram.params;

    // get row_nodes from global variable
    var row_nodes = d3_clustergram.network_data.row_nodes;
    var col_nodes = d3_clustergram.network_data.col_nodes;

    // get inst col (term)
    var inst_term = d3.select(this).select('text').attr('full_name');

    // find the column number of this term from col_nodes
    // gather column node names
    var tmp_arr = [];
    _.each(col_nodes, function(node) {
      tmp_arr.push(node.name);
    });

    // find index
    var inst_col = _.indexOf(tmp_arr, inst_term);

    // gather the values of the input genes
    tmp_arr = [];
    _.each(row_nodes, function(node, index) {
      tmp_arr.push(params.matrix[index][inst_col].value);
    });

    // sort the rows
    var tmp_sort = d3.range(tmp_arr.length).sort(function(a, b) {
      return tmp_arr[b] - tmp_arr[a];
    });

    // resort rows - y axis
    ////////////////////////////
    params.y_scale.domain(tmp_sort);

    // reorder
    // define the t variable as the transition function
    var t = params.clust_group.transition().duration(2500);

    // reorder matrix
    t.selectAll('.row')
      .attr('transform', function(data, index) {
        return 'translate(0,' + params.y_scale(index) + ')';
      });

    // reorder row_label_triangle groups
    d3.selectAll('.row_triangle_group')
      .transition().duration(2500)
      .attr('transform', function(data, index) {
        return 'translate(0,' + params.y_scale(index) + ')';
      });

    // Move Row Labels
    d3.select('#row_labels').selectAll('.row_label_text')
      .transition().duration(2500)
      .attr('transform', function(data, index) {
        return 'translate(0,' + params.y_scale(index) + ')';
      });

    // t.selectAll('.column')
    d3.select('#col_labels').selectAll('.col_label_text')
      .transition().duration(2500)
      .attr('transform', function(data, index) {
        return 'translate(' + params.x_scale(index) + ')rotate(-90)';
      })
      .each('end', function() {
        // set running transition to 0
        d3_clustergram.params.run_trans = 0;
      });

    // highlight selected column
    ///////////////////////////////
    // unhilight and unbold all columns (already unbolded earlier)
    d3.selectAll('.col_label_text')
      .select('rect')
      .style('opacity', 0);

    // highlight column name
    d3.select(this)
      .select('rect')
      .style('opacity', 1);

    // backup allow programmatic zoom
    setTimeout(end_reorder, 2500);

  }

  // resize clustergram with screensize change
  var doit;

  function timeout_resize() {

    // get params
    var params = d3_clustergram.params;

    // only resize if allowed
    if (params.resize === true) {

      // clear timeout
      clearTimeout(doit);

      // // set up wait message before request is made
      // $.blockUI({ css: {
      //         border: 'none',
      //         padding: '15px',
      //         backgroundColor: '#000',
      //         '-webkit-border-radius': '10px',
      //         '-moz-border-radius': '10px',
      //         opacity: .8,
      //         color: '#fff'
      //     } });

      doit = setTimeout(reset_visualization_size, 500);

    }
  }

  // zoom into and highlight the found the gene
  function zoom_and_highlight_found_gene(search_gene) {

    // get parameters
    var params = d3_clustergram.params;

    // unhighlight and unbold all genes
    d3.selectAll('.row_label_text')
      .select('text')
      .style('font-weight', 'normal');
    d3.selectAll('.row_label_text')
      .select('rect')
      .style('opacity', 0);

    // find the index of the gene
    var inst_gene_index = _.indexOf(params.all_genes, search_gene);

    // get y position
    var inst_y_pos = params.y_scale(inst_gene_index);


    // highlight row name
    d3.selectAll('.row_label_text')
      .filter(function(d) {
        return d.name === search_gene;
      })
      .select('rect')
      .style('opacity', 1);

    // calculate the y panning required to center the found gene
    var pan_dy = params.clust.dim.height / 2 - inst_y_pos;

    // use two translate method to control zooming
    // pan_x, pan_y, zoom
    two_translate_zoom(0, pan_dy, params.zoom_switch);
  }

  // submit genes button
  $('#gene_search_box').keyup(function(e) {
    if (e.keyCode === 13) {
      find_row();
    }
  });

  // find gene in clustergram
  function find_row() {
    // get the searched gene
    var search_gene = $('#gene_search_box').val();

    if (d3_clustergram.params.all_genes.indexOf(search_gene) !== -1) {
      // zoom and highlight found gene
      zoom_and_highlight_found_gene(search_gene);
    }
  }

  // transpose matrix funciton
  function transpose_network(net) {
    var tnet = {};
    tnet.row_nodes = net.col_nodes;
    tnet.col_nodes = net.row_nodes;
    tnet.links = [];

    for (var i = 0; i < net.links.length; i++) {
      var inst_link = {};
      inst_link.source = net.links[i].target;
      inst_link.target = net.links[i].source;
      inst_link.value = net.links[i].value;

      // optional highlight
      if (_.has(net.links[i], 'highlight')) {
        inst_link.highlight = net.links[i].highlight;
      }
      if (_.has(net.links[i], 'value_up')) {
        inst_link.value_up = net.links[i].value_up;
      }
      if (_.has(net.links[i], 'value_dn')) {
        inst_link.value_dn = net.links[i].value_dn;
      }
      if (_.has(net.links[i], 'info')) {
        inst_link.info = net.links[i].info;
      }

      tnet.links.push(inst_link);
    }
    return tnet;
  }

  // return d3_clustergram modules
  return {
    'make_clust': make_d3_clustergram,
    'reorder': reorder,
    'find_row': find_row
  };

  // end closure
}());
