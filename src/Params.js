/* Params it's like all the little measurements that you need to like literally you all the distances you need.
 */
function Params(config) {

  var params = initialize_visualization(config);

  // Define Visualization Dimensions
  function initialize_visualization(config) {

    // initialize params object from config
    var params = config;

    // // deep copy 
    // params = jQuery.extend(true, {}, config)

    // // shallow copy 
    // var params = jQuery.extend({}, config)

    // run initial filtering if necessary 
    if (_.isNull(params.ini_view) === false) {

      console.log(params.ini_view);
      params.network_data = change_network_view(params, params.network_data, params.ini_view);

      // remove ini_view 
      params.ini_view = null;
    }

    // if (_.isNull(params.current_col_cat) === false){
    //   console.log('\nVizParams: ini cat '+String(params.current_col_cat) );

    //   // fitler categories 
    //   params.network_data = show_one_cat(params.network_data, params);

    //   params.network_data = filter_using_new_nodes( params.network_data, params.network_data.links, params.network_data.views);

    // }

    // Label Paramsters
    params.labels = {};
    params.labels.super_label_scale = config.super_label_scale;
    params.labels.super_labels = config.super_labels;
    // Super Labels Detais
    if (params.labels.super_labels) {
      params.labels.super_label_width = 20 * params.labels.super_label_scale;
      params.labels.super = {};
      params.labels.super.row = config.super.row;
      params.labels.super.col = config.super.col;
    } else {
      params.labels.super_label_width = 0;
    }

    // optional classification
    params.labels.show_categories = config.show_categories;
    if (params.labels.show_categories) {
      params.labels.class_colors = config.class_colors;
    }
    params.labels.show_label_tooltips = config.show_label_tooltips;

    // Matrix Options
    params.matrix = {};
    params.matrix.tile_colors = config.tile_colors;
    params.matrix.bar_colors = config.bar_colors;
    params.matrix.outline_colors = config.outline_colors;
    params.matrix.hlight_color = config.highlight_color;
    params.matrix.tile_title = config.tile_title;
    params.matrix.show_tile_tooltips = config.show_tile_tooltips;

    // transfer tile tooltip function 
    params.matrix.make_tile_tooltip = config.make_tile_tooltip;

    // Visualization Options
    params.viz = {};

    params.viz.viz_wrapper = config.root + ' .viz-wrapper';
    params.viz.viz_svg = params.viz.viz_wrapper + ' .viz_svg';

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

    params.viz.uni_duration = 1000;

    // initialized clicked tile and rows
    params.matrix.click_hlight_x = -666;
    params.matrix.click_hlight_y = -666;
    params.matrix.click_hlight_row = -666;
    params.matrix.click_hlight_col = -666;

    // definition of a large matrix - based on number of links 
    // cutoff between large and small matrix
    // below this cutoff reordering is done with transitions
    // and tiles are drawn individually - not in rows 
    params.matrix.def_large_matrix = 10000;

    // initial order of clustergram, row and col are separate 
    params.viz.inst_order = config.inst_order;

    params.matrix.opacity_function = config.opacity_scale;

    // not initialized in expand state
    // params.viz.expand = false;
    if (params.viz.expand === true) {
      d3.select('#clust_instruct_container')
        .style('display', 'none');
    }
    params.viz.expand_button = config.expand_button;

    // // pass network_data to params
    // params.network_data = config.network_data;

    var col_nodes = params.network_data.col_nodes;
    var row_nodes = params.network_data.row_nodes;


    // Create wrapper around SVG visualization
    var class_name = params.viz.viz_wrapper.replace('.', '');
    d3.select(config.root).append('div').attr('class', class_name);

    // resize based on parent div
    parent_div_size_pos(params);

    params.viz.svg_dim = {};
    params.viz.svg_dim.width = Number(d3.select(params.viz.viz_wrapper).style('width').replace('px', ''));
    params.viz.svg_dim.height = Number(d3.select(params.viz.viz_wrapper).style('height').replace('px', ''));

    params.viz.parent_div_size_pos = parent_div_size_pos;

    // Variable Label Widths
    // based on the length of the row/col labels - longer labels mean more space given
    // get row col data

    params.network_data.row_nodes_names = _.pluck(row_nodes, 'name');
    params.network_data.col_nodes_names = _.pluck(col_nodes, 'name');

    // find the label with the most characters and use it to adjust the row and col margins
    var row_max_char = _.max(row_nodes, function (inst) {
      return inst.name.length;
    }).name.length;
    var col_max_char = _.max(col_nodes, function (inst) {
      return inst.name.length;
    }).name.length;

    params.labels.row_max_char = row_max_char;
    params.labels.col_max_char = col_max_char;

    // the maximum number of characters in a label
    params.labels.max_label_char = 10;
    // params.labels.max_label_char = 15;

    // define label scale parameters: the more characters in the longest name, the larger the margin
    var min_num_char = 5;
    var max_num_char = params.labels.max_label_char;

    // number of characters to show
    params.labels.show_char = 10;

    // calc how much of the label to keep
    var keep_label_scale = d3.scale.linear()
      .domain([params.labels.show_char, max_num_char])
      .range([1, params.labels.show_char / max_num_char]).clamp('true');

    params.labels.row_keep = keep_label_scale(row_max_char);
    params.labels.col_keep = keep_label_scale(col_max_char);

    // define label scale
    ///////////////////////////
    var min_label_width = 65;
    var max_label_width = 115;
    var label_scale = d3.scale.linear()
      .domain([min_num_char, max_num_char])
      .range([min_label_width, max_label_width]).clamp('true');

    // rotated column labels - approx trig
    params.norm_label = {};
    params.norm_label.width = {};

    // Label Scale
    ///////////////////////
    // dependent on max char length or row/col labels, screensize,
    // and user-defined factor: row_label_scale and col_label_scale
    params.norm_label.width.row = label_scale(row_max_char)
      * params.row_label_scale;

    params.norm_label.width.col = label_scale(col_max_char)
      * params.col_label_scale;

    // normal label margins
    params.norm_label.margin = {};
    params.norm_label.margin.left = params.viz.grey_border_width + params.labels.super_label_width;
    params.norm_label.margin.top = params.viz.grey_border_width + params.labels.super_label_width;

    // row groups - only add if the rows have a group attribute
    // Define the space needed for the classification of rows - includes classification triangles and rects
    params.class_room = {};

    // the width of the classification triangle and group rectangle
    params.class_room.symbol_width = 11;

    if (params.viz.show_dendrogram) {
      // make room for group rects
      params.class_room.row = 2 * params.class_room.symbol_width;
      params.class_room.col = params.class_room.symbol_width;

      config.group_level = {
        row: 5,
        col: 5
      };

    } else {
      // do not make room for group rects
      params.class_room.row = params.class_room.symbol_width;
      params.class_room.col = 0;
    }

    // norm label background width, norm-label-width plus class-width plus margin
    params.norm_label.background = {};
    params.norm_label.background.row = params.norm_label.width.row + params.class_room.row + params.viz.uni_margin;
    params.norm_label.background.col = params.norm_label.width.col + params.class_room.col + params.viz.uni_margin;

    // clustergram dimensions
    params.viz.clust = {};
    params.viz.clust.margin = {};
    // clust margin is the margin of the norm_label plus the width of the entire norm_label group
    params.viz.clust.margin.left = params.norm_label.margin.left + params.norm_label.background.row;
    params.viz.clust.margin.top = params.norm_label.margin.top + params.norm_label.background.col;

    // svg size: less than svg size
    ///////////////////////////////////
    // 0.8 approximates the trigonometric distance required for hiding the spillover
    params.viz.spillover_x_offset = label_scale(col_max_char) * 0.7 * params.col_label_scale;


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

    // calculate clustergram width
    // reduce clustergram width if triangles are taller than the normal width
    // of the columns
    var tmp_x_scale = d3.scale.ordinal().rangeBands([0, ini_clust_width]);
    tmp_x_scale.domain(_.range(col_nodes.length));
    var triangle_height = tmp_x_scale.rangeBand() / 2;

    if (triangle_height > params.norm_label.width.col) {
      ini_clust_width = ini_clust_width * ( params.norm_label.width.col / triangle_height );
    }
    params.viz.clust.dim.width = ini_clust_width;

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
    if (config.force_square === 1) {
      params.viz.force_square = 1;
    }

    // set up bar_scale_row and bar_scale_col if there are values for rows/cols
    // get max value

    // the enrichment bar should be 3/4ths of the height of the column labels
    var enr_max = Math.abs(_.max(col_nodes, function (d) {
      return Math.abs(d.value)
    }).value);

    console.log('\n\nenr_max')
    console.log(enr_max)
    console.log('\n\n')

    params.labels.bar_scale_col = d3.scale
      .linear()
      .domain([0, enr_max])
      .range([0, 0.75 * params.norm_label.width.col]);

    // set bar scale
    var enr_max = Math.abs(_.max(row_nodes, function (d) {
      return Math.abs(d.value)
    }).value);
    params.labels.bar_scale_row = d3.scale
      .linear()
      .domain([0, enr_max])
      .range([0, params.norm_label.width.row]);


    // Define Orderings
    ////////////////////////////

    // Define Orderings
    params.matrix.orders = {
      // ini
      ini_row: d3.range(params.viz.num_col_nodes).sort(function (a, b) {
        return col_nodes[b].ini - col_nodes[a].ini;
      }),
      ini_col: d3.range(params.viz.num_row_nodes).sort(function (a, b) {
        return row_nodes[b].ini - row_nodes[a].ini;
      }),
      // rank
      rank_row: d3.range(params.viz.num_col_nodes).sort(function (a, b) {
        return col_nodes[b].rank - col_nodes[a].rank;
      }),
      rank_col: d3.range(params.viz.num_row_nodes).sort(function (a, b) {
        return row_nodes[b].rank - row_nodes[a].rank;
      }),
      // clustered
      clust_row: d3.range(params.viz.num_col_nodes).sort(function (a, b) {
        return col_nodes[b].clust - col_nodes[a].clust;
      }),
      clust_col: d3.range(params.viz.num_row_nodes).sort(function (a, b) {
        return row_nodes[b].clust - row_nodes[a].clust;
      })
    };


    // // define class ordering - define on front-end
    // if (_.has(col_nodes[0],'cl')){

    //   // the order should be interpreted as the nth node should be positioned here 
    //   // in the order 

    //   var tmp_col_nodes = _.sortBy(col_nodes,'cl')

    //   var ordered_col_names = []
    //   for (var i=0; i< tmp_col_nodes.length; i++){
    //     ordered_col_names.push( tmp_col_nodes[i].name );
    //   }

    //   var order_col_class = []
    //   for (var i=0; i< col_nodes.length; i++){
    //     var inst_col_name = ordered_col_names[i];
    //     order_col_class.push( _.indexOf( params.network_data.col_nodes_names, inst_col_name) );
    //   }

    //   params.matrix.orders.class_row = order_col_class;
    // }

    // define class orderings using category-sub-clustered orderings 
    if (_.has(col_nodes[0], 'cl_index')) {
      params.matrix.orders.class_row = d3.range(params.viz.num_col_nodes).sort(function (a, b) {
        return col_nodes[b].cl_index - col_nodes[a].cl_index;
      });

    }


    // scaling functions to position rows and tiles, define rangeBands
    params.matrix.x_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.width]);
    params.matrix.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);

    if (params.viz.inst_order.row === 'ini') {
      params.matrix.x_scale.domain(params.matrix.orders.ini_row);
    } else if (params.viz.inst_order.row === 'clust') {
      params.matrix.x_scale.domain(params.matrix.orders.clust_row);
    } else if (params.viz.inst_order.row === 'rank') {
      params.matrix.x_scale.domain(params.matrix.orders.rank_row);
    } else if (params.viz.inst_order.row === 'class') {
      if (_.has(params.matrix.orders, 'class_row')) {
        params.matrix.x_scale.domain(params.matrix.orders.class_row);
      } else {
        params.matrix.x_scale.domain(params.matrix.orders.clust_row);
      }

    }

    if (params.viz.inst_order.col === 'ini') {
      params.matrix.y_scale.domain(params.matrix.orders.ini_col);
    } else if (params.viz.inst_order.col === 'clust') {
      params.matrix.y_scale.domain(params.matrix.orders.clust_col);
    } else if (params.viz.inst_order.col === 'rank') {
      params.matrix.y_scale.domain(params.matrix.orders.rank_col);
    } else if (params.viz.inst_order.col === 'class') {
      if (_.has(params.matrix.orders, 'class_row')) {
        params.matrix.y_scale.domain(params.matrix.orders.class_col);
      } else {
        params.matrix.y_scale.domain(params.matrix.orders.clust_col);
      }
    }

    // add names and instantaneous positions to links 
    _.each(params.network_data.links, function (d) {
      // d.name = row_nodes[d.source].name + '_' + col_nodes[d.target].name;
      // d.row_name = row_nodes[d.source].name;
      // d.col_name = col_nodes[d.target].name;
      d.x = params.matrix.x_scale(d.target);
      d.y = params.matrix.y_scale(d.source);
    });

    // make lnks crossfilter 
    params.cf = {};
    params.cf.links = crossfilter(params.network_data.links);
    params.cf.dim_x = params.cf.links.dimension(function (d) {
      return d.x;
    });
    params.cf.dim_y = params.cf.links.dimension(function (d) {
      return d.y;
    });

    // // test-filter 
    // // params.cf.dim_x.filter([200,350]);
    // params.cf.dim_y.filter([400,800]);
    // // redefine links 
    // params.network_data.links = params.cf.dim_x.top(Infinity);

    // initialize matrix 
    params.matrix.matrix = initialize_matrix(params.network_data);

    // visualization parameters
    //////////////////////////////

    // border_width - width of white borders around tiles
    params.viz.border_fraction = 55;
    params.viz.border_width = params.matrix.x_scale.rangeBand() /
      params.viz.border_fraction;

    // zoom_switch from 1 to 2d zoom
    params.viz.zoom_switch = (params.viz.clust.dim.width / params.viz.num_col_nodes) / (params.viz.clust.dim.height / params.viz.num_row_nodes);

    // zoom_switch can not be less than 1
    if (params.viz.zoom_switch < 1) {
      params.viz.zoom_switch = 1;
    }

    // precalc rect_width and height 
    params.matrix.rect_width = params.matrix.x_scale.rangeBand() - 1 * params.viz.border_width;
    params.matrix.rect_height = params.matrix.y_scale.rangeBand() - 1 * params.viz.border_width / params.viz.zoom_switch;

    // scale font offset, when the font size is the height of the rects then it should be almost the full width of the rects
    // when the font size is small, then the offset should be almost equal to half the rect width
    params.scale_font_offset = d3.scale
      .linear().domain([1, 0])
      .range([0.8, 0.5]);

    // the default font sizes are set here
    params.labels.default_fs_row = params.matrix.y_scale.rangeBand() * 1.01;
    params.labels.default_fs_col = params.matrix.x_scale.rangeBand() * 0.87;

    // initialize font size zooming parameters
    params.viz.zoom_scale_font = {};
    params.viz.zoom_scale_font.row = 1;
    params.viz.zoom_scale_font.col = 1;

    // allow user to do 'real' 2D zoom until visual aid column triangle
    // is as tall as the normal label width
    params.viz.real_zoom = params.norm_label.width.col / (params.matrix.x_scale.rangeBand() / 2);

    // if this is a filtered view, then use the maximum link value determined from all links 
    if (_.has(params.network_data, 'all_links')) {

      // get max link value from 'all_links'
      params.matrix.max_link = _.max(params.network_data.all_links, function (d) {
        return Math.abs(d.value);
      }).value;

      // console.log('using all links ')

    } else {

      // get max link value current 'links'
      params.matrix.max_link = _.max(params.network_data.links, function (d) {
        return Math.abs(d.value);
      }).value;

      // console.log('using normal links ')
    }

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
    if (Utils.has(params.network_data.links[0], 'value_up') || Utils.has(params.network_data.links[0], 'value_dn')) {
      params.matrix.tile_type = 'updn';
    } else {
      params.matrix.tile_type = 'simple';
    }

    // check if rects should be highlighted
    if (Utils.has(params.network_data.links[0], 'highlight')) {
      params.matrix.highlight = 1;
    } else {
      params.matrix.highlight = 0;
    }

    return params;
  }

  function initialize_resizing(params) {

    d3.select(window).on('resize', null);

    // resize window
    if (params.viz.resize) {
      d3.select(window).on('resize', function () {
        d3.select(params.viz.viz_svg).style('opacity', 0.5);
        var wait_time = 500;
        if (params.viz.run_trans == true) {
          wait_time = 2500;
        }
        setTimeout(reset_visualization_size, wait_time, params);
      });
    }

    if (params.viz.expand_button) {

      d3.select('#expand_button').on('click', null);
      var expand_opacity = 0.4;

      if (d3.select('#expand_button').empty()) {
        var exp_button = d3.select(params.viz.viz_svg)
          .append('text')
          .attr('id', 'expand_button');
      } else {
        var exp_button = d3.select('#expand_button')
      }

      exp_button
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-family', 'FontAwesome')
        .attr('font-size', '30px')
        .text(function (d) {
          if (params.viz.expand === false) {
            // expand button
            return '\uf0b2';
          } else {
            // menu button
            return '\uf0c9';
          }
        })
        .attr('y', '25px')
        .attr('x', '25px')
        .style('cursor', 'pointer')
        .style('opacity', expand_opacity)
        .on('mouseover', function () {
          d3.select(this).style('opacity', 0.75);
        })
        .on('mouseout', function () {
          d3.select(this).style('opacity', expand_opacity);
        })
        .on('click', function () {

          // expand view
          if (params.viz.expand === false) {

            d3.select('#clust_instruct_container')
              .style('display', 'none');
            d3.select(this)
              .text(function (d) {
                // menu button
                return '\uf0c9';
              });
            params.viz.expand = true;

            d3.selectAll('.borders').style('fill', 'white');
            d3.select('.footer_section').style('display', 'none');

            // contract view
          } else {

            d3.select('#clust_instruct_container')
              .style('display', 'block');
            d3.select(this)
              .text(function (d) {
                // expand button
                return '\uf0b2';
              });
            params.viz.expand = false;

            d3.selectAll('.borders').style('fill', '#eee');
            d3.select('.footer_section').style('display', 'block');
          }

          // get updated size for visualization
          params.viz.parent_div_size_pos(params);

          d3.select(params.viz.viz_svg).style('opacity', 0.5);
          var wait_time = 500;
          if (params.viz.run_trans == true) {
            wait_time = 2500;
          }
          setTimeout(reset_visualization_size, wait_time, params);
        });
    }
  }

  // parent_div: size and position svg container - svg_div
  function parent_div_size_pos(params) {

    // get outer_margins
    if (params.viz.expand == false) {
      var outer_margins = params.viz.outer_margins;
    } else {
      var outer_margins = params.viz.outer_margins_expand;
    }

    if (params.viz.resize) {

      // get the size of the window
      var screen_width = window.innerWidth;
      var screen_height = window.innerHeight;

      // define width and height of clustergram container
      var cont_dim = {};
      cont_dim.width = screen_width - outer_margins.left - outer_margins.right;
      cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

      // size the svg container div - svg_div
      d3.select(params.viz.viz_wrapper)
        .style('margin-left', outer_margins.left + 'px')
        .style('margin-top', outer_margins.top + 'px')
        .style('width', cont_dim.width + 'px')
        .style('height', cont_dim.height + 'px');

    } else {

      // size the svg container div - svg_div
      d3.select(params.viz.viz_wrapper)
        .style('margin-left', outer_margins.left + 'px')
        .style('margin-top', outer_margins.top + 'px');
    }
  }

  function initialize_matrix(network_data) {

    var matrix = [];

    _.each(network_data.row_nodes, function (tmp, row_index) {

      matrix[row_index] = {};
      matrix[row_index].name = network_data.row_nodes[row_index].name;
      matrix[row_index].row_data = d3.range(network_data.col_nodes.length).map(
        function (col_index) {

          if (_.has(network_data.links[0], 'value_up') || _.has(network_data.links[0], 'value_dn')) {
            var ini_object = {
              pos_x: col_index,
              pos_y: row_index,
              value: 0,
              value_up: 0,
              value_dn: 0,
              highlight: 0
            };

          } else {

            var ini_object = {
              pos_x: col_index,
              pos_y: row_index,
              value: 0,
              highlight: 0
            };

          }
          return ini_object;
        });

    });

    _.each(network_data.links, function (link) {

      // transfer additional link information is necessary
      matrix[link.source].row_data[link.target].value = link.value;
      matrix[link.source].row_data[link.target].row_name = link.row_name;
      matrix[link.source].row_data[link.target].col_name = link.col_name;

      if (_.has(link, 'value_up') || _.has(link, 'value_dn')) {
        matrix[link.source].row_data[link.target].value_up = link.value_up;
        matrix[link.source].row_data[link.target].value_dn = link.value_dn;
      }

      if (link.highlight) {
        matrix[link.source].row_data[link.target].highlight = link.highlight;
      }
      if (link.info) {
        matrix[link.source].row_data[link.target].info = link.info;
      }
    });

    return matrix;
  }

  // instantiate zoom object
  params.zoom_obj = Zoom(params);

  // define the variable zoom, a d3 method
  params.zoom = d3.behavior
    .zoom()
    .scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch])
    .on('zoom', params.zoom_obj.zoomed);

  params.initialize_resizing = initialize_resizing;

  return params;

}