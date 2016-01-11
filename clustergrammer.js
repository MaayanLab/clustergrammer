/* clustergrammer 1.0
 * Nick Fernandez, Ma'ayan Lab, Icahn School of Medicine at Mount Sinai
 * (c) 2015
 */
function clustergrammer(args) {
    'use strict';

/* Utility functions
 * ----------------------------------------------------------------------- */
var Utils = {

    /* Returns whether or not an object has a certain property.
     */
    has: function(obj, key) {
        return obj != null && hasOwnProperty.call(obj, key);
    },

    /* Returns true if the object is undefined.
     */
    is_undefined: function(obj) {
        return obj === void 0;
    },

    /* Mixes two objects in together, overwriting a target with a source.
     */
    extend: function(target, source) {
        target = target || {};
        for (var prop in source) {
            if (typeof source[prop] === 'object') {
                target[prop] = this.extend(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
        return target;
    }
};

function Config(args) {

  var config,
    defaults;

  defaults = {

    // Label options
    row_label_scale: 1,
    col_label_scale: 1,
    super_labels: false,
    show_label_tooltips: false,
    show_tile_tooltips: false,

    // matrix options
    transpose: false,
    tile_colors: ['#FF0000', '#1C86EE'],
    bar_colors: ['#FF0000', '#1C86EE'],
    outline_colors: ['orange','black'],
    highlight_color: '#FFFF00',
    tile_title: false,
    // Default domain is set to 0, which means that the domain will be set automatically
    input_domain: 0,
    opacity_scale: 'linear',

    // Viz Options
    // This should be a DOM element, not a selector.
    svg_div_id: 'svg_id',
    do_zoom: true,
    background_color: '#FFFFFF',
    super_border_color: '#F5F5F5',
    resize: true,
    outer_margins: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    },
    outer_margins_expand:{
      top: -666,
      bottom: 0,
      left: 0,
      right: 0
    },
    ini_expand:false,
    // Gray border around the visualization
    grey_border_width: 3,
    // the distance between labels and clustergram
    // a universal margin for the clustergram
    uni_margin: 4,
    // force the visualization to be square
    force_square:0,
    tile_click_hlight:false,
    super_label_scale: 1,
    make_tile_tooltip:function(d){return d.info;},
    ini_view:null 
  };

  // Mixin defaults with user-defined arguments.
  config = Utils.extend(defaults, args);

  if (config.outer_margins_expand.top === -666){
    config.expand_button = false;
  } else {
    config.expand_button = true;
  }

  // save network_data to config
  // extend does not properly pass network_data
  config.network_data = args.network_data;

  // replace undersores with space in row/col names 
  _.each(config.network_data.row_nodes, function(d){
    d.name = d.name.replace(/_/g, ' ');
  });
  _.each(config.network_data.col_nodes, function(d){
    d.name = d.name.replace(/_/g, ' ');
  });
  
  // replace underscore with space in row/col names from views 
  _.each(config.network_data.views, function(inst_view){

    var inst_nodes = inst_view.nodes;

    // fix rows in views 
    _.each(inst_nodes.row_nodes, function(d){
      d.name = d.name.replace(/_/g, ' ');
    });

    // fix cols in views 
    _.each(inst_nodes.col_nodes, function(d){
      d.name = d.name.replace(/_/g, ' ');
    });

  })

  var col_nodes = config.network_data.col_nodes;
  var row_nodes = config.network_data.row_nodes;

  // add names and instantaneous positions to links 
  _.each(config.network_data.links, function(d){
    d.name = row_nodes[d.source].name + '_' + col_nodes[d.target].name;
    d.row_name = row_nodes[d.source].name;
    d.col_name = col_nodes[d.target].name;
  });  


  // transpose network if necessary
  if (config.transpose) {
    config.network_data = transpose_network(args.network_data);
    var tmp_col_label = args.col_label;
    var tmp_row_label = args.row_label;
    args.row_label = tmp_col_label;
    args.col_label = tmp_row_label;
  }

  // super-row/col labels
  if (!Utils.is_undefined(args.row_label) && !Utils.is_undefined(args.col_label)) {
    config.super_labels = true;
    config.super = {};
    config.super.row = args.row_label;
    config.super.col = args.col_label;
  }

  // initialize cluster ordering - both rows and columns 
  config.inst_order = {};
  if (!Utils.is_undefined(args.order) && is_supported_order(args.order)) {
    config.inst_order.row = args.order;
    config.inst_order.col = args.order;
  } else {
    config.inst_order.row = 'clust';
    config.inst_order.col = 'clust';
  }

  // set row or column order directly -- note that row/col are swapped 
  // !! need to swap row/col orderings 
  if (!Utils.is_undefined(args.row_order) && is_supported_order(args.row_order)) {
    // !! row and col orderings are swapped, need to fix 
    config.inst_order.col = args.row_order;
  }

  if (!Utils.is_undefined(args.col_order) && is_supported_order(args.col_order)) {
    // !! row and col orderings are swapped, need to fix 
    config.inst_order.row = args.col_order;
  }

  config.show_dendrogram = Utils.has(args.network_data.row_nodes[0], 'group') || Utils.has(args.network_data.col_nodes[0], 'group');
  config.show_categories = Utils.has(args.network_data.row_nodes[0], 'cl')    || Utils.has(args.network_data.col_nodes[0], 'cl');


  // check for category information
  if (config.show_categories) {

    // !! set up option for manual color specification
    config.class_colors = {};

    // associate classes with colors
    var class_rows = _.uniq(_.pluck(args.network_data.row_nodes, 'cl'));
    config.class_colors.row = {};
    _.each(class_rows, function(c_row, i) {
      if (i === 0) {
        config.class_colors.row[c_row] = '#eee';
      } else {
        config.class_colors.row[c_row] = Colors.get_random_color(i);
      }
    });

    // associate classes with colors
    var class_cols = _.uniq(_.pluck(args.network_data.col_nodes, 'cl'));
    config.class_colors.col = {};
    _.each(class_cols, function(c_col, i) {
      if (i === 0) {
        config.class_colors.col[c_col] = '#eee';
      } else {
        config.class_colors.col[c_col] = Colors.get_random_color(i);
      }
    });
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


  function is_supported_order(order) {
    return order === 'ini' || order === 'clust' || order === 'rank' || order === 'class';
  }

  return config;
}

var Colors = (function() {

    // colors from http://graphicdesign.stackexchange.com/revisions/3815/8
    var rand_colors;

    // generate random colors 
    var tmp0 = ['#000000', '#FF34FF', '#FFFF00', '#FF4A46']
    var tmp1 = d3.scale.category20().range().reverse();
    var tmp2 = d3.scale.category20b().range();
    var tmp3 = d3.scale.category20c().range();
    rand_colors = tmp0.concat(tmp1).concat(tmp2).concat(tmp3);

    function get_default_color() {
        //return rand_colors[0];
        return '#EEE';
    }

    function get_random_color(i) {
        return rand_colors[i % get_num_colors()];
    }

    function get_num_colors() {
        return rand_colors.length;
    }

    return {
        get_default_color: get_default_color,
        get_random_color: get_random_color,
        get_num_colors: get_num_colors
    }
    
})();


/* Dendrogram color bar.
 */
function Dendrogram(type, params) {

  var group_colors = [],
    dom_class,
    i;

  build_color_groups();

  if (type === 'row') {
    dom_class = 'row_class_rect';
    build_row_dendro();
  } else {
    dom_class = 'col_class_rect';
    build_col_dendro();
  }

  function build_color_groups() {
    var max_groups ;
    if ( params.network_data.row_nodes.length > params.network_data.col_nodes.length){
      max_groups = params.network_data.row_nodes;
    } else {
      max_groups = params.network_data.col_nodes;
    }
    for (i = 0; i < params.network_data.row_nodes.length; i++) {
      // grab colors from the list
      if (i === 1) {
        group_colors[i] = Colors.get_default_color();
      } else {
        group_colors[i] = Colors.get_random_color(i);
      }
    }
  }

  /* Changes the groupings (x- and y-axis color bars).
   */
  function change_groups(inst_rc, inst_index) {
    d3.selectAll('.' + dom_class)
      .style('fill', function(d) {
        return group_colors[d.group[inst_index]];
      });

    if (inst_rc==='row'){
      params.group_level.row = inst_index;
    } else if (inst_rc==='col'){
      params.group_level.col = inst_index;
    }

  }

  function color_group(j) {
    return group_colors[j];
  }

  function get_group_color(j) {
    return group_colors[j];
  }

  function build_row_dendro() {


    // if (params.labels.show_label_tooltips){
    //   // d3-tooltip - for tiles 
    //   var tip = d3.tip()
    //     .attr('class', 'd3-tip')
    //     .direction('e')
    //     .offset([0, 0])
    //     .html(function(group_nodes_list){
    //       return group_nodes_list.join('\t');
    //     });

    //   d3.select('#row_viz_zoom_container')
    //     .call(tip);
    // } 

    d3.selectAll('.row_viz_group')
      .each(function(d){

        var inst_level = params.group_level.row;

        var dendro_rect = d3.select(this)
          .append('rect')
          .attr('class', dom_class)
          .attr('width', function() {
            var inst_width = params.class_room.symbol_width - 1;
            return inst_width + 'px';
          })
          .attr('height', params.matrix.y_scale.rangeBand())
          .style('fill', function(d) {
            return get_group_color(d.group[inst_level]);
          })
          .attr('x', function() {
            var inst_offset = params.class_room.symbol_width + 1;
            return inst_offset + 'px';
          })

        // if (params.labels.show_label_tooltips){
        //   dendro_rect
        //     .on('mouseover', function(d){
        //       var group_nodes_list = get_inst_group('row',d);
        //       tip.show(group_nodes_list);
        //     })
        //     .on('mouseout', function(d){
        //       tip.hide();
        //     });
        // }

        // show group in modal 
        if (typeof params.click_group === 'function'){
          dendro_rect
            .on('click', function(d){
              var group_nodes_list = get_inst_group('row',d);
              params.click_group('row', group_nodes_list);
            });
        }       

      })

  }

  function build_col_dendro() {

    var col_nodes = params.network_data.col_nodes;
    var col_nodes_names = _.pluck(col_nodes, 'name');

    // append groups - each will hold a classification rect
    var col_class_ini_group = d3.select('#col_viz_zoom_container')
    .selectAll('g')
    .data(col_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'col_viz_group')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
    });

    // if (params.labels.show_label_tooltips){
    //   // d3-tooltip - for tiles 
    //   var tip = d3.tip()
    //     .attr('class', 'd3-tip')
    //     .direction('s')
    //     .offset([0, 0])
    //     .html(function(group_nodes_list){
    //       return group_nodes_list.join('\t');
    //     });

    //   d3.select('#row_viz_zoom_container')
    //     .call(tip);
    // }    

    d3.selectAll('.col_viz_group')
      .each(function(d){

        var inst_level = params.group_level.col;

        var dendro_rect = d3.select(this)
          .append('rect')
          .attr('class', dom_class)
          .attr('width', params.matrix.x_scale.rangeBand())
          .attr('height', function() {
            var inst_height = params.class_room.col - 1;
            return inst_height;
          })
          .style('fill', function(d) {
            return get_group_color(d.group[inst_level]);
          });

        // if (params.labels.show_label_tooltips){
        //   dendro_rect
        //     .on('mouseover', function(d){
        //       var group_nodes_list = get_inst_group('col',d);
        //       tip.show(group_nodes_list );
        //     })
        //     .on('mouseout', function(d){
        //       tip.hide();
        //     }); 
        // }

        if (typeof params.click_group==='function'){
          dendro_rect
            .on('click',function(d){
              var group_nodes_list = get_inst_group('col',d);
              params.click_group('col',group_nodes_list);
            });
        }

    })
  }

  function get_inst_group(inst_rc,d){

    if (inst_rc === 'col'){
      var inst_level = params.group_level.col;
      var inst_nodes = params.network_data.col_nodes;
    } else if (inst_rc==='row') {
      var inst_level = params.group_level.row;
      var inst_nodes = params.network_data.row_nodes;
    }

    var inst_group = d.group[inst_level];
    var group_nodes_list = [];

    _.each(inst_nodes, function(node){
      if (node.group[inst_level] === inst_group){
        group_nodes_list.push(node.name);
      }
    });

    return group_nodes_list;
  }

  // add callback functions 
  /////////////////////////////
  
  // // !! optional row callback on click
  // if (typeof params.click_group === 'function') {
  //   // only add click functionality to row rect
  //   row_class_rect
  //     .on('click', function(d) {
  //       var inst_level = params.group_level.row;
  //      var inst_group = d.group[inst_level];
  //       // find all row names that are in the same group at the same group_level
  //       // get row_nodes
  //       row_nodes = params.network_data.row_nodes;
  //       var group_nodes = [];

  //       _.each(row_nodes, function(node) {
  //         // check that the node is in the group
  //         if (node.group[inst_level] === inst_group) {
  //         // make a list of genes that are in inst_group at this group_level
  //         group_nodes.push(node.name);
  //         }
  //     });

  //     // return the following information to the user
  //     // row or col, distance cutoff level, nodes
  //     var group_info = {};
  //     group_info.type = 'row';
  //     group_info.nodes = group_nodes;
  //     group_info.info = {
  //       'type': 'distance',
  //       'cutoff': inst_level / 10
  //     };

  //     // pass information to group_click callback
  //     params.click_group(group_info);

  //   });
  // }


  // // optional column callback on click
  // if (typeof params.click_group === 'function') {

  //   d3.select('#col_viz_outer_container')
  //     .on('click', function(d) {
  //     var inst_level = params.group_level.col;
  //     var inst_group = d.group[inst_level];
  //     // find all column names that are in the same group at the same group_level
  //     // get col_nodes
  //     col_nodes = params.network_data.col_nodes;
  //     var group_nodes = [];
  //     _.each(col_nodes, function(node) {
  //       // check that the node is in the group
  //       if (node.group[inst_level] === inst_group) {
  //       // make a list of genes that are in inst_group at this group_level
  //       group_nodes.push(node.name);
  //       }
  //     });

  //   // return the following information to the user
  //   // row or col, distance cutoff level, nodes
  //   var group_info = {};
  //   group_info.type = 'col';
  //   group_info.nodes = group_nodes;
  //   group_info.info = {
  //     'type': 'distance',
  //     'cutoff': inst_level / 10
  //   };

  //   // pass information to group_click callback
  //   params.click_group(group_info);

  //   });
  // }

  return {
    color_group: color_group,
    get_group_color: get_group_color,
    change_groups: change_groups
  };
}



function Matrix(network_data, svg_elem, params) {

  var matrix = [],
  row_nodes = network_data.row_nodes,
  col_nodes = network_data.col_nodes,
  clust_group;

  var row_nodes_names = _.pluck(row_nodes, 'name');
  var col_nodes_names = _.pluck(col_nodes, 'name');



  // append a group that will hold clust_group and position it once
  clust_group = svg_elem
    .append('g')
    .attr('id','clust_group_container')
    .attr('transform', 'translate(' +
      params.viz.clust.margin.left + ',' +
      params.viz.clust.margin.top + ')')
    .append('g')
    .attr('id', 'clust_group');

  if (params.matrix.show_tile_tooltips){
    // d3-tooltip - for tiles 
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .direction('n')
      .offset([0, 0])
      .html(params.matrix.make_tile_tooltip);

    d3.select('#clust_group')
      .call(tip);
  }

  // clustergram background rect
  clust_group
    .append('rect')
    .attr('class', 'background')
    .attr('id', 'grey_background')
    .style('fill', '#eee')
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);

  // console.log('making downsampled version rathe than original')
  // var DS = DownSampling();
  // var ds_data = DS.calc_ds_matrix(params, 5);
  // DS.draw_ds_matrix(params, ds_data);
  
  // make row matrix - add key names to rows in matrix 
  var row_groups = clust_group.selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'row')
    .attr('transform', function(d) {
      var tmp_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(tmp_index) + ')';
    })
    .each(make_simple_rows);
    
  // add callback function to tile group - if one is supplied by the user
  if (typeof params.click_tile === 'function') {
    d3.selectAll('.tile')
    .on('click', function(d) {

      // export row/col name and value from tile
      var tile_info = {};
      tile_info.row = params.network_data.row_nodes[d.pos_y].name;
      tile_info.col = params.network_data.col_nodes[d.pos_x].name;
      tile_info.value = d.value;

      if (Utils.has(d, 'value_up')) {
        tile_info.value_up = d.value_up;
      }
      if (Utils.has(d, 'value_dn')) {
        tile_info.value_dn = d.value_dn;
      }
      if (Utils.has(d, 'info')) {
        tile_info.info = d.info;
      }
      // run the user supplied callback function
      params.click_tile(tile_info);
      add_click_hlight(this);

    });

  } else {

    // highlight clicked tile
    if (params.tile_click_hlight){
      d3.selectAll('.tile')
        .on('click',function(d){
          add_click_hlight(this)
        })
    }
  }


  function add_click_hlight(clicked_rect){

    // get x position of rectangle
    d3.select(clicked_rect).each(function(d){
      var pos_x = d.pos_x;
      var pos_y = d.pos_y;

      d3.selectAll('.click_hlight')
        .remove();

      if (pos_x!=params.matrix.click_hlight_x || pos_y!=params.matrix.click_hlight_y){

        // save pos_x to params.viz.click_hlight_x
        params.matrix.click_hlight_x = pos_x;
        params.matrix.click_hlight_y = pos_y;

        // draw the highlighting rectangle as four rectangles
        // so that the width and height can be controlled
        // separately

        var rel_width_hlight = 6;
        var opacity_hlight = 0.85;

        var hlight_width  = rel_width_hlight*params.viz.border_width;
        var hlight_height = rel_width_hlight*params.viz.border_width/params.viz.zoom_switch;

        // top highlight
        d3.select(clicked_rect.parentNode)
          .append('rect')
          .attr('class','click_hlight')
          .attr('id','top_hlight')
          .attr('width', params.matrix.x_scale.rangeBand())
          .attr('height', hlight_height)
          .attr('fill',params.matrix.hlight_color)
          .attr('transform', function() {
            return 'translate(' + params.matrix.x_scale(pos_x) + ',0)';
          })
          .attr('opacity',opacity_hlight);

        // left highlight
        d3.select(clicked_rect.parentNode)
          .append('rect')
          .attr('class','click_hlight')
          .attr('id','left_hlight')
          .attr('width', hlight_width)
          .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
          .attr('fill',params.matrix.hlight_color)
          .attr('transform', function() {
            return 'translate(' + params.matrix.x_scale(pos_x) + ','+
              hlight_height*0.99+')';
          })
          .attr('opacity',opacity_hlight);

        // right highlight
        d3.select(clicked_rect.parentNode)
          .append('rect')
          .attr('class','click_hlight')
          .attr('id','right_hlight')
          .attr('width', hlight_width)
          .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
          .attr('fill',params.matrix.hlight_color)
          .attr('transform', function() {
            var tmp_translate = params.matrix.x_scale(pos_x) + params.matrix.x_scale.rangeBand() - hlight_width;
            return 'translate(' + tmp_translate + ','+
              hlight_height*0.99+')';
          })
          .attr('opacity',opacity_hlight);

        // bottom highlight
        d3.select(clicked_rect.parentNode)
          .append('rect')
          .attr('class','click_hlight')
          .attr('id','bottom_hlight')
          .attr('width', function(){
            return params.matrix.x_scale.rangeBand() - 1.98*hlight_width})
          .attr('height', hlight_height)
          .attr('fill',params.matrix.hlight_color)
          .attr('transform', function() {
            var tmp_translate_x = params.matrix.x_scale(pos_x) + hlight_width*0.99;
            var tmp_translate_y = params.matrix.y_scale.rangeBand() - hlight_height;
            return 'translate(' + tmp_translate_x + ','+
              tmp_translate_y+')';
          })
          .attr('opacity',opacity_hlight);

        } else {
          params.matrix.click_hlight_x = -666;
          params.matrix.click_hlight_y = -666;
        }


    })
  }

  // draw grid lines after drawing tiles
  draw_grid_lines(row_nodes, col_nodes);

  // make each row in the clustergram
  function make_simple_rows(ini_inp_row_data) {

    var inp_row_data = ini_inp_row_data.row_data;

    // value: remove zero values to make visualization faster
    var row_values = _.filter(inp_row_data, function(num) {
      return num.value !== 0;
    });

    // generate tiles in the current row
    var tile = d3.select(this)
      .selectAll('rect')
      .data(row_values, function(d){return d.col_name;})
      .enter()
      .append('rect')
      .attr('class', 'tile row_tile')
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
      // switch the color based on up/dn value
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .on('mouseover', function(p) {

        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return p.row_name.replace(/_/g, ' ') === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });

        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }

      })
      .on('mouseout', function(d) {
        d3.selectAll('text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
      })
      .attr('title', function(d) {
        return d.value;
      })
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      })
      .attr('transform', function(d) {
        var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate(' + x_pos + ','+y_pos+')';
      });

    if (params.matrix.tile_type == 'updn'){

      // value split 
      var row_split_data = _.filter(inp_row_data, function(num){
        return num.value_up != 0 || num.value_dn !=0 ;
      });

      // tile_up 
      d3.select(this)
        .selectAll('.tile_up')
        .data(row_split_data, function(d){return d.col_name;})
        .enter()
        .append('path')
        .attr('class','tile_up')
        .attr('d', function(d) {

          // up triangle 
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand();
          var start_y = 0;
          var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;

          var output_string = 'M' + start_x + ',' + start_y + ', L' +
          start_x + ', ' + final_y + ', L' + final_x + ',0 Z';

          return output_string;
        })  
        .attr('transform', function(d) {
          var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
          var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
          return 'translate(' + x_pos + ','+y_pos+')';
        })
        .style('fill', function() {
          return params.matrix.tile_colors[0];
        })
        .style('fill-opacity',function(d){
          var inst_opacity = 0;
          if (Math.abs(d.value_dn)>0){
            inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_up));
          }
          return inst_opacity;
        })
        .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return p.row_name.replace(/_/g, ' ') === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });
        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }
      })
      .on('mouseout', function(d) {
        d3.selectAll('text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
      });

      // tile_dn 
      d3.select(this)
        .selectAll('.tile_dn')
        .data(row_split_data, function(d){return d.col_name;})
        .enter()
        .append('path')
        .attr('class','tile_dn')
        .attr('d', function(d) {

          // dn triangle 
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand();
          var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
          var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;

          var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
          final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';

          return output_string;
        })  
        .attr('transform', function(d) {
          var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
          var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
          return 'translate(' + x_pos + ','+y_pos+')';
        })
        .style('fill', function() {
          return params.matrix.tile_colors[1];
        })
        .style('fill-opacity',function(d){
          var inst_opacity = 0;
          if (Math.abs(d.value_up)>0){
            inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_dn));
          }
          return inst_opacity;
        })
        .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return p.row_name.replace(/_/g, ' ') === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });
        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }
      })
      .on('mouseout', function(d) {
        d3.selectAll('text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
      });

      // remove tiles when splitting is done 
      tile
        .each(function(d){
          if ( Math.abs(d.value_up)>0 && Math.abs(d.value_dn)>0 ){
            d3.select(this).remove();
          }
        });

    }

    // append title to group
    if (params.matrix.tile_title) {
      tile.append('title')
      .text(function(d) {
        var inst_string = 'value: ' + d.value;
        return inst_string;
      });
    }

  }


  

  // Matrix API
  return {
    get_clust_group: function() {
      return clust_group;
    },
    get_matrix: function(){
      return matrix;
    },
    get_nodes: function(type){
      if (type === 'row'){
      var nodes = network_data.row_nodes;
      } else {
      var nodes = network_data.col_nodes;
      }
      return nodes;
    }
  }

}

/* DownSampling module
*/

function DownSampling(params, min_rect_height){
  function calc_ds_matrix(params, min_rect_height){
    var ini_num_rows = params.network_data.row_nodes.length;

    // calc the increase in rect size required 
    // first get the current size of the rectangle 
    var ini_rect_height = params.matrix.rect_height;
    var reduce_num_rows_by = min_rect_height/ini_rect_height;

    var col_nodes = params.network_data.col_nodes;

    var new_num_rows = Math.floor(ini_num_rows/reduce_num_rows_by);

    // get cluster height
    var clust_height = params.viz.clust.dim.height;
    // initialize scale
    var y_scale = d3.scale.ordinal().rangeBands([0,clust_height]);
    // define domain 
    y_scale.domain(_.range(new_num_rows));

    // get new rangeBand to calculate new y position 
    var tile_height = y_scale.rangeBand();

    var ini_tile_height = params.matrix.y_scale.rangeBand();

    var increase_ds = 1;

    var ds_factor = 2*ini_tile_height/tile_height * increase_ds;

    // use crossfilter to calculate new links 
    //////////////////////////////////////////

    // load data into crossfilter  
    var cfl = crossfilter(params.network_data.links);

    // downsample dimension - define the key that will be used to do the reduction
    var dim_ds = cfl.dimension(function(d){
      // merge together rows into a smaller number of rows 
      var row_num = Math.floor(d.y/tile_height);
      var col_name = col_nodes[d.target].name;
      var inst_key = 'row_'+row_num + '_' + col_name;
      return inst_key;
    })

    // define reduce functions 
    function reduceAddAvg(p,v) {
      ++p.count
      if (v.value > 0){
        p.sum_up += v.value;
      } else {
        p.sum_dn += v.value;
      }
      p.value_up = p.sum_up/p.count;
      p.value_dn = p.sum_dn/p.count;

      // make new row name 
      p.name = 'row_'+ String(Math.floor(v.y/tile_height)) + '_' + col_nodes[v.target].name;

      p.source = Math.floor(v.y/tile_height);
      p.target = v.target;
      return p;
    }
    function reduceRemoveAvg(p,v) {
      --p.count
      if (v.value > 0){
        p.sum_up -= v.value;
      } else {
        p.sum_dn -= v.value;
      }
      p.value_up = p.sum_up/p.count;
      p.value_dn = p.sum_dn/p.count;

      p.name = 'no name';
      p.target = 0;
      p.source = 0;
      return p;
    }
    function reduceInitAvg() {
      return {count:0, sum_up:0, sum_dn:0, avg:0, name:'',source:0,target:0};
    }

    // gather tmp version of new links 
    var tmp_red = dim_ds
                  .group()
                  .reduce(reduceAddAvg, reduceRemoveAvg, reduceInitAvg)
                  .top(Infinity);

    // initialize array of new_links
    var new_links = [];

    // gather data from reduced sum 
    new_links = _.pluck(tmp_red, 'value');

    // define compound color scale 
    var color_scale = d3.scale.linear().domain([-1,1])
      .range([params.matrix.tile_colors[1], params.matrix.tile_colors[0]]);


    // redefine matrix 
    /////////////////////////
    var matrix = []; 

      _.each(_.range(new_num_rows), function(tmp, row_index) {
        matrix[row_index] = {};
        matrix[row_index].name = row_index;
        matrix[row_index].row_data = d3.range(col_nodes.length).map(
          function(col_index) {
            return {
              pos_x: col_index,
              pos_y: row_index,
              value: 0,
              value_up: 0,
              value_dn: 0,
              highlight:0
            } ;
          });
      });

      _.each(new_links, function(link) {
        // transfer additional link information is necessary
        matrix[link.source].row_data[link.target].value = link.value;
        matrix[link.source].row_data[link.target].row_name = link.row_name;
        matrix[link.source].row_data[link.target].col_name = link.col_name;
        // if (link.value_up && link.value_dn) {
          matrix[link.source].row_data[link.target].value_up = link.value_up;
          matrix[link.source].row_data[link.target].value_dn = link.value_dn;
        // }
        
      });

      return {
        'matrix':matrix, 
        'y_scale':y_scale, 
        'tile_height':tile_height,
        'color_scale':color_scale,
        'ds_factor':ds_factor
      };
  }

  function draw_ds_matrix(params, ds_data){
    var ds_matrix = ds_data.matrix;
    var y_scale = ds_data.y_scale;
    var tile_height = ds_data.tile_height;
    var color_scale = ds_data.color_scale;
    var ds_factor = ds_data.ds_factor;

    d3.selectAll('.horz_lines').remove();

    // update bound data on rows 
    var ds_clust = d3.select('#clust_group')
      .selectAll('.row')
      .data(ds_matrix, function(d){return d.name;});

    // remove old rows - all old rows will be removed in downsampling 
    ds_clust
      .exit()
      .remove();

    // enter new rows 
    ds_clust
      .enter()
      .append('g')
      .attr('class','row')
      .attr('transform', function(d, i){
        return 'translate(0,'+y_scale(i)+')';
      })
      .each(enter_ds_row);

    function enter_ds_row(ini_inp_row_data){
      var inp_row_data = ini_inp_row_data.row_data;

      // remove zero values to make visualization fater 
      var row_data = _.filter(inp_row_data, function(num){
        return num.value_up !==0 || num.value_dn !==0 ;
      });

      row_data = inp_row_data;

      // generate tiles in the current row 
      var tile = d3.select(this)
        .selectAll('rect')
        .data(row_data)
        .enter()
        .append('rect')
        .attr('class', 'tile row_tile')
        .attr('width', params.matrix.rect_width)
        .attr('height', tile_height)
        .style('fill', function(d){
          var abs_val_up = Math.abs(d.value_up);
          var abs_val_dn = Math.abs(d.value_dn);
          var inst_value = (abs_val_up - abs_val_dn) / (abs_val_up + abs_val_dn);
          return color_scale(inst_value);
        });

        // do not include mouseover events on ds_tiles 

        tile
          .style('fill-opacity', function(d){
            var val_updn = Math.abs(d.value_up)+Math.abs(d.value_dn);
            var output_opacity = params.matrix.opacity_scale(val_updn*ds_factor);
            return output_opacity
          });

        tile
          .attr('transform', function(d,i){
            var x_pos = params.matrix.x_scale(i) + 0.5*params.viz.border_width;
            var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
            return 'translate('+x_pos+','+y_pos+')';
          });
    }
  }

  return {
    calc_ds_matrix: calc_ds_matrix,
    draw_ds_matrix: draw_ds_matrix 
  };

}

/* Handles searching rows or columns.
 !! need to generalize to column and row 
 * ----------------------------------------------------------------------- */
function Search(params, nodes, prop) {

  /* Collect entities from row or columns.
   */
  var entities = [],
    i;

  for (i = 0; i < nodes.length; i++) {
    entities.push(nodes[i][prop]);
  }

  /* Find a gene (row) in the clustergram.
   */
  function find_entities(search_term) {
    if (entities.indexOf(search_term) !== -1) {
      un_highlight_entities();
      zoom_and_highlight_found_entity(search_term);
      highlight_entity(search_term);
    }
  }

  /* Zoom into and highlight the found the gene
   */
  function zoom_and_highlight_found_entity(search_term) {
    var idx = _.indexOf(entities, search_term),
      inst_y_pos = params.matrix.y_scale(idx),
      pan_dy = params.viz.clust.dim.height / 2 - inst_y_pos;

    // viz exposes two_translate_zoom from zoom object 
    viz.two_translate_zoom(params, 0, pan_dy, params.viz.zoom_switch);
  }

  function un_highlight_entities() {
    d3.selectAll('.row_label_text').select('rect').style('opacity', 0);
  }

  function highlight_entity(search_term) {
    
    d3.selectAll('.row_label_text')
      .filter(function(d) {
        return d[prop] === search_term;
      })
      .select('rect')
      .style('opacity', 1);
  }

  /* Returns all the genes in the clustergram.
   */
  function get_entities() {
    return entities;
  }

  return {
    find_entities: find_entities,
    get_entities: get_entities
  }
}
function trim_text(inst_selection, inst_rc){

  var max_width,
      inst_zoom;

  var safe_row_trim_text = 0.9;

  if (inst_rc === 'row'){
    max_width = params.norm_label.width.row*safe_row_trim_text;
    inst_zoom = params.zoom.scale();
  } else {
    // the column label has extra length since its rotated
    max_width = params.norm_label.width.col;
    inst_zoom = params.zoom.scale()/params.viz.zoom_switch;
  }

  var tmp_width = d3.select(inst_selection).select('text').node().getBBox().width;
  var inst_text = d3.select(inst_selection).select('text').text();
  var actual_width = tmp_width*inst_zoom;

  if (actual_width>max_width){

    var trim_fraction = max_width/actual_width;
    var keep_num_char = Math.floor(inst_text.length*trim_fraction)-3;
    var trimmed_text = inst_text.substring(0,keep_num_char)+'..';
    d3.select(inst_selection).select('text')
      .text(trimmed_text);

  }

}
/* VizParams Module
*/
function VizParams(config){

  var params = initialize_visualization(config)

  // Define Visualization Dimensions
  function initialize_visualization(config) {

    // initialize params object from config
    var params = config;

    // // deep copy 
    // params = jQuery.extend(true, {}, config)

    // // shallow copy 
    // var params = jQuery.extend({}, config)

    // run initial filtering if necessary 
    if (_.isNull(params.ini_view) === false){
      params.network_data = filter_network_data(params.network_data, params.ini_view);
      // remove ini_view 
      params.ini_view = null;
    }

    // Label Paramsters
    params.labels = {};
    params.labels.super_label_scale = config.super_label_scale;
    params.labels.super_labels = config.super_labels;
    // Super Labels Detais
    if (params.labels.super_labels) {
      params.labels.super_label_width = 20*params.labels.super_label_scale;
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
    params.labels.show_label_tooltips = config.show_label_tooltips;

    // Matrix Options
    params.matrix = {};
    params.matrix.tile_colors = config.tile_colors;
    params.matrix.bar_colors = config.bar_colors;
    params.matrix.outline_colors = config.outline_colors;
    params.matrix.hlight_color = config.highlight_color
    params.matrix.tile_title = config.tile_title;
    params.matrix.show_tile_tooltips  = config.show_tile_tooltips;

    // transfer tile tooltip function 
    params.matrix.make_tile_tooltip = config.make_tile_tooltip;

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
    if (params.viz.expand === true){
      d3.select('#clust_instruct_container')
        .style('display','none');
    }
    params.viz.expand_button = config.expand_button;

    // // pass network_data to params
    // params.network_data = config.network_data;

    var col_nodes = params.network_data.col_nodes;
    var row_nodes = params.network_data.row_nodes;

    // var network_data = params.network_data;

    // resize based on parent div
    parent_div_size_pos(params);

    // get height and width from parent div
    params.viz.svg_dim = {};
    params.viz.svg_dim.width  = Number(d3.select('#' + params.viz.svg_div_id).style('width').replace('px', ''));
    params.viz.svg_dim.height = Number(d3.select('#' + params.viz.svg_div_id).style('height').replace('px', ''));

    params.viz.parent_div_size_pos = parent_div_size_pos;

    // Variable Label Widths
    // based on the length of the row/col labels - longer labels mean more space given
    // get row col data

    params.network_data.row_nodes_names = _.pluck(row_nodes, 'name');
    params.network_data.col_nodes_names = _.pluck(col_nodes, 'name');

    // find the label with the most characters and use it to adjust the row and col margins
    var row_max_char = _.max(row_nodes, function(inst) { return inst.name.length; }).name.length;
    var col_max_char = _.max(col_nodes, function(inst) { return inst.name.length; }).name.length;

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
      .range([1, params.labels.show_char/max_num_char]).clamp('true');

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
      params.class_room.row = 2*params.class_room.symbol_width;
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
    params.viz.clust= {};
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
    var triangle_height = tmp_x_scale.rangeBand()/2 ;

    if (triangle_height > params.norm_label.width.col){
      ini_clust_width = ini_clust_width * ( params.norm_label.width.col/triangle_height );
    }
    params.viz.clust.dim.width = ini_clust_width ;

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

    // set up bar_scale_row and bar_scale_col if there are values for rows/cols
    // get max value

    // the enrichment bar should be 3/4ths of the height of the column labels
    var enr_max = Math.abs(_.max( col_nodes, function(d) { return Math.abs(d.value) } ).value) ;
    params.labels.bar_scale_col = d3.scale
      .linear()
      .domain([0, enr_max])
      .range([0, 0.75*params.norm_label.width.col]);    

    // set bar scale
    var enr_max = Math.abs(_.max( row_nodes, function(d) { return Math.abs(d.value) } ).value) ;
    params.labels.bar_scale_row = d3.scale
      .linear()
      .domain([0, enr_max])
      .range([0, params.norm_label.width.row ]);


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
      params.matrix.x_scale.domain(params.matrix.orders.class_row);
    }

    if (params.viz.inst_order.col === 'ini') {
      params.matrix.y_scale.domain(params.matrix.orders.ini_col);
    } else if (params.viz.inst_order.col === 'clust') {
      params.matrix.y_scale.domain(params.matrix.orders.clust_col);
    } else if (params.viz.inst_order.col === 'rank') {
      params.matrix.y_scale.domain(params.matrix.orders.rank_col);
    } else if (params.viz.inst_order.col === 'class') {
      params.matrix.y_scale.domain(params.matrix.orders.class_col);
    }

    // add names and instantaneous positions to links 
    _.each(params.network_data.links, function(d){
      // d.name = row_nodes[d.source].name + '_' + col_nodes[d.target].name;
      // d.row_name = row_nodes[d.source].name;
      // d.col_name = col_nodes[d.target].name;
      d.x = params.matrix.x_scale(d.target);
      d.y = params.matrix.y_scale(d.source);
    });

    // make lnks crossfilter 
    params.cf = {};
    params.cf.links = crossfilter(params.network_data.links);
    params.cf.dim_x = params.cf.links.dimension(function(d){return d.x;});
    params.cf.dim_y = params.cf.links.dimension(function(d){return d.y;});

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
    params.matrix.rect_width = params.matrix.x_scale.rangeBand() - 1*params.viz.border_width;
    params.matrix.rect_height = params.matrix.y_scale.rangeBand() - 1*params.viz.border_width/params.viz.zoom_switch;

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
    params.labels.default_fs_col = params.matrix.x_scale.rangeBand() * 0.87;

    // initialize font size zooming parameters
    params.viz.zoom_scale_font = {};
    params.viz.zoom_scale_font.row = 1;
    params.viz.zoom_scale_font.col = 1;

    // allow user to do 'real' 2D zoom until visual aid column triangle
    // is as tall as the normal label width
    params.viz.real_zoom = params.norm_label.width.col / (params.matrix.x_scale.rangeBand()/2);

    // if this is a filtered view, then use the maximum link value determined from all links 
    if (_.has(params.network_data,'all_links')){

      // get max link value from 'all_links'
      params.matrix.max_link = _.max(params.network_data.all_links, function(d) {
        return Math.abs(d.value);
      }).value;

      console.log('using all links ')

    } else {

      // get max link value current 'links'
      params.matrix.max_link = _.max(params.network_data.links, function(d) {
        return Math.abs(d.value);
      }).value;

      console.log('using normal links ')
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

  function initialize_resizing(params){

    d3.select(window).on('resize', null);

    // resize window
    if (params.viz.resize){
      d3.select(window).on('resize', function(){
        d3.select('#main_svg').style('opacity',0.5);
        var wait_time = 500;
        if (params.viz.run_trans == true){
          wait_time = 2500;
        }
        setTimeout(reset_visualization_size, wait_time, params);
      });
    }

    if (params.viz.expand_button){

      d3.select('#expand_button').on('click',null);
      var expand_opacity = 0.4;

      if (d3.select('#expand_button').empty()){
        var exp_button = d3.select('#main_svg')
          .append('text')
          .attr('id','expand_button');
      } else {
        var exp_button = d3.select('#expand_button')
      }

      exp_button
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-family', 'FontAwesome')
        .attr('font-size', '30px')
        .text(function(d) {
          if (params.viz.expand === false){
            // expand button
            return '\uf0b2';
          } else {
            // menu button
            return '\uf0c9';
          }
        })
        .attr('y','25px')
        .attr('x','25px')
        .style('cursor', 'pointer')
        .style('opacity',expand_opacity)
        .on('mouseover',function(){
          d3.select(this).style('opacity',0.75);
        })
        .on('mouseout',function(){
          d3.select(this).style('opacity',expand_opacity);
        })
        .on('click',function(){

          // expand view
          if (params.viz.expand === false){

            d3.select('#clust_instruct_container')
              .style('display','none');
            d3.select(this)
              .text(function(d){
                // menu button
                return '\uf0c9';
              });
            params.viz.expand = true;

            d3.selectAll('.borders').style('fill','white');
            d3.select('.footer_section').style('display','none');

          // contract view
          } else {

            d3.select('#clust_instruct_container')
              .style('display','block');
            d3.select(this)
              .text(function(d){
                // expand button
                return '\uf0b2';
              });
            params.viz.expand = false;

            d3.selectAll('.borders').style('fill','#eee');
            d3.select('.footer_section').style('display','block');
          }

          // get updated size for visualization
          params.viz.parent_div_size_pos(params);

          d3.select('#main_svg').style('opacity',0.5);
          var wait_time = 500;
          if (params.viz.run_trans == true){
            wait_time = 2500;
          }
          setTimeout(reset_visualization_size, wait_time, params);
        });
    }
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

  function initialize_matrix(network_data) {

    var matrix = []; 

    _.each(network_data.row_nodes, function(tmp, row_index) {

      matrix[row_index] = {};
      matrix[row_index].name = network_data.row_nodes[row_index].name;
      matrix[row_index].row_data = d3.range(network_data.col_nodes.length).map(

        function(col_index) {

          if ( _.has(network_data.links[0], 'value_up') || _.has(network_data.links[0],'value_dn') ){
            var ini_object = {
              pos_x: col_index,
              pos_y: row_index,
              value: 0,
              value_up: 0,
              value_dn: 0,
              highlight:0
            };

          } else {

            var ini_object = {
              pos_x: col_index,
              pos_y: row_index,
              value: 0,
              highlight:0
            };

          }
          return ini_object;
        });

    });

    _.each(network_data.links, function(link) {

      // transfer additional link information is necessary
      matrix[link.source].row_data[link.target].value = link.value;
      matrix[link.source].row_data[link.target].row_name = link.row_name;
      matrix[link.source].row_data[link.target].col_name = link.col_name;

      if ( _.has(link, 'value_up') || _.has(link, 'value_dn') ) {
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

function Labels(params){

  function normal_name(d){
    var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
    if (inst_name.length > params.labels.max_label_char){
      inst_name = inst_name.substring(0,params.labels.max_label_char)+'..';
    }
    return inst_name;
  }

  // make row labels
  function make_rows(params, row_nodes, reorder, text_delay){

    var row_nodes_names = params.network_data.row_nodes_names;

    // row container holds all row text and row visualizations (triangles rects)
    if ( d3.select('#row_container').empty() ){
      var row_container = d3.select('#main_svg')
        .append('g')
        .attr('id','row_container')
        .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
        params.viz.clust.margin.top + ')');
    } else {
      var row_container = d3.select('id','row_container')
        .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
        params.viz.clust.margin.top + ')');
    }

    // white background - behind text and row visualizaitons 
    if (row_container.select('.white_bars').empty()){
      row_container
        .append('rect')
        .attr('id','row_white_background')
        .attr('fill', params.viz.background_color)
        .attr('width', params.norm_label.background.row)
        .attr('height', 30*params.viz.clust.dim.height + 'px')
        .attr('class', 'white_bars');
    }

    // container to hold text row labels 
    row_container
      .append('g')
      .attr('id','row_label_outer_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)')
      .append('g')
      .attr('id', 'row_label_zoom_container');

    var row_labels = d3.select('#row_label_zoom_container')
      .selectAll('g')
      .data(row_nodes, function(d){return d.name;})
      .enter()
      .append('g')
      .attr('class', 'row_label_text')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      });

    d3.select('#row_label_zoom_container')
      .selectAll('.row_label_text')
      .on('dblclick', function(d) {
        console.log('double clicking row')
        reorder.row_reorder.call(this);
        if (params.tile_click_hlight){
          add_row_click_hlight(this,d.ini);
        }
      });

    if (params.labels.show_label_tooltips){

      // d3-tooltip
      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .direction('e')
        .offset([0, 10])
        .html(function(d) {
          var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
          return "<span>" + inst_name + "</span>";
        });

      d3.select('#'+params.viz.svg_div_id)
        .select('svg')
        .select('#row_container')
        .call(tip);
        
      row_labels
        .on('mouseover', function(d) {
          d3.select(this)
            .select('text')
            .classed('active',true);
          tip.show(d);
        })
        .on('mouseout', function mouseout(d) {
          d3.select(this)
            .select('text')
            .classed('active',false);
          tip.hide(d);
        });
    } else{
      row_labels
        .on('mouseover', function(d) {
          d3.select(this)
            .select('text')
            .classed('active',true);
        })
        .on('mouseout', function mouseout(d) {
          d3.select(this)
            .select('text')
            .classed('active',false);
        });
    }

    // append rectangle behind text
    row_labels
      .insert('rect')
      .style('opacity', 0);

    // append row label text
    row_labels
      .append('text')
      .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 )
      .attr('text-anchor', 'end')
      .style('font-size', params.labels.default_fs_row + 'px')
      .text(function(d){ return normal_name(d);})
      .attr('pointer-events','none')
      .style('opacity',0)
      .transition().delay(text_delay).duration(text_delay)
      .style('opacity',1);

    // change the size of the highlighting rects
    row_labels
      .each(function() {
        var bbox = d3.select(this)
            .select('text')[0][0]
          .getBBox();
        d3.select(this)
          .select('rect')
          .attr('x', bbox.x )
          .attr('y', 0)
          .attr('width', bbox.width )
          .attr('height', params.matrix.y_scale.rangeBand())
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

    // label the widest row and col labels
    params.bounding_width_max = {};
    params.bounding_width_max.row = 0;

    d3.selectAll('.row_label_text').each(function() {
      var tmp_width = d3.select(this).select('text').node().getBBox().width;
      if (tmp_width > params.bounding_width_max.row) {
        params.bounding_width_max.row = tmp_width;
      }
    });

    // row visualizations - classification triangles and colorbar rects 
    var row_viz_outer_container = row_container
      .append('g')
      .attr('id','row_viz_outer_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)')
      .append('g')
      .attr('id', 'row_viz_zoom_container');

    // white background for triangle
    if (row_viz_outer_container.select('white_bars').empty()){
      row_viz_outer_container
        .append('rect')
        .attr('class','white_bars')
        .attr('fill', params.viz.background_color)
        .attr('width', params.class_room.row + 'px')
        .attr('height', function() {
          var inst_height = params.viz.clust.dim.height;
          return inst_height;
        });
    } else {
      row_viz_outer_container
        .select('class','white_bars')
        .attr('fill', params.viz.background_color)
        .attr('width', params.class_room.row + 'px')
        .attr('height', function() {
          var inst_height = params.viz.clust.dim.height;
          return inst_height;
        });
    }

    // groups that hold classification triangle and colorbar rect  
    var row_viz_group = d3.select('#row_viz_zoom_container')
      .selectAll('g')
      .data(row_nodes, function(d){return d.name;})
      .enter()
      .append('g')
      .attr('class', 'row_viz_group')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
      });

    // add triangles
    row_viz_group
      .append('path')
      .attr('d', function(d) {
        var origin_x = params.class_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.matrix.y_scale.rangeBand() / 2;
        var final_x = params.class_room.symbol_width - 1;
        var final_y = params.matrix.y_scale.rangeBand();
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      })
      .attr('fill', function(d) {
        // initailize color
        var inst_color = '#eee';
        if (params.labels.show_categories) {
          inst_color = params.labels.class_colors.row[d.cl];
        }
        return inst_color;
      })
      .style('opacity',0)
      .transition().delay(text_delay).duration(text_delay)
      .style('opacity',1);


      if (Utils.has( params.network_data.row_nodes[0], 'value')) {

        row_labels
          .append('rect')
          .attr('class', 'row_bars')
          .attr('width', function(d) {
            var inst_value = 0;
            inst_value = params.labels.bar_scale_row( Math.abs(d.value) );
            return inst_value;
          })
          .attr('x', function(d) {
            var inst_value = 0;
            inst_value = -params.labels.bar_scale_row( Math.abs(d.value) );
            return inst_value;
          })
          .attr('height', params.matrix.y_scale.rangeBand() )
          .attr('fill', function(d) {
            return d.value > 0 ? params.matrix.bar_colors[0] : params.matrix.bar_colors[1];
          })
          .attr('opacity', 0.4);

        }

      // add row callback function
      d3.selectAll('.row_label_text')
        .on('click',function(d){
          if (typeof params.click_label == 'function'){
            params.click_label(d.name, 'row');
            add_row_click_hlight(this, d.ini);
          } else {
            if (params.tile_click_hlight){
              add_row_click_hlight(this,d.ini);
            }
          }

        })


      function add_row_click_hlight(clicked_row, id_clicked_row){

        if (id_clicked_row != params.click_hlight_row){

          var rel_width_hlight = 6;
          var opacity_hlight = 0.85;
          var hlight_width  = rel_width_hlight*params.viz.border_width;
          var hlight_height = rel_width_hlight*params.viz.border_width/params.viz.zoom_switch;

          d3.selectAll('.click_hlight')
            .remove();

          // // highlight selected row
          // d3.selectAll('.row_label_text')
          //   .select('rect')
          // d3.select(this)
          //   .select('rect')
          //   .style('opacity', 1);

          d3.select(clicked_row)
            .append('rect')
            .attr('class','click_hlight')
            .attr('id','row_top_hlight')
            .attr('width',params.viz.svg_dim.width)
            .attr('height',hlight_height)
            .attr('fill',params.matrix.hlight_color)
            .attr('opacity',opacity_hlight);

          d3.select(clicked_row)
            .append('rect')
            .attr('class','click_hlight')
            .attr('id','row_bottom_hlight')
            .attr('width',params.viz.svg_dim.width)
            .attr('height',hlight_height)
            .attr('fill',params.matrix.hlight_color)
            .attr('opacity',opacity_hlight)
            .attr('transform', function(){
              var tmp_translate_y = params.matrix.y_scale.rangeBand() - hlight_height;
              return 'translate(0,'+tmp_translate_y+')';
            });
        } else{
          d3.selectAll('.click_hlight')
          .remove();
          params.click_hlight_row = -666;
        }

      }

      // row label text will not spillover initially since
      // the font-size is set up to not allow spillover
      // it can spillover during zooming and must be constrained 

      // return row_viz_group so that the dendrogram can be made
      return row_viz_group;
  }

  // make col labels
  function make_cols(params, col_nodes, reorder, text_delay){

    var col_nodes_names = params.network_data.col_nodes_names;

    // offset click group column label
    var x_offset_click = params.matrix.x_scale.rangeBand() / 2 + params.viz.border_width;
    // reduce width of rotated rects
    var reduce_rect_width = params.matrix.x_scale.rangeBand() * 0.36;


    // make container to pre-position zoomable elements
    if (d3.select('#col_container').empty()){

      var container_all_col = d3.select('#main_svg')
        .append('g')
        .attr('id','col_container')
        .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
        params.norm_label.margin.top + ')');

      // white background rect for col labels
      container_all_col
        .append('rect')
        .attr('fill', params.viz.background_color) //!! prog_colors
        .attr('width', 30 * params.viz.clust.dim.width + 'px')
        .attr('height', params.norm_label.background.col)
        .attr('class', 'white_bars');

      // col labels
      container_all_col
        .append('g')
        .attr('id','col_label_outer_container')
        // position the outer col label group
        .attr('transform', 'translate(0,' + params.norm_label.width.col + ')')
        .append('g')
        .attr('id', 'col_label_zoom_container');

    } else {
      
      var container_all_col = d3.select('#col_container')
        .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
        params.norm_label.margin.top + ')');
          
      // white background rect for col labels
      container_all_col
        .select('.white_bars')
        .attr('fill', params.viz.background_color) //!! prog_colors
        .attr('width', 30 * params.viz.clust.dim.width + 'px')
        .attr('height', params.norm_label.background.col);

      // col labels
      container_all_col.select('#col_label_outer_container')

    }


    // add main column label group
    var col_label_obj = d3.select('#col_label_zoom_container')
      .selectAll('.col_label_text')
      .data(col_nodes, function(d){return d.name;})
      .enter()
      .append('g')
      .attr('class', 'col_label_text')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
      })

    // append group for individual column label
    var col_label_click = col_label_obj
      // append new group for rect and label (not white lines)
      .append('g')
      .attr('class', 'col_label_click')
      // rotate column labels
      .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)')
      .on('mouseover', function(d) {
        d3.select(this).select('text')
          .classed('active',true);
      })
      .on('mouseout', function(d) {
        d3.select(this).select('text')
          .classed('active',false);
      });



    // append column value bars
    if (Utils.has( params.network_data.col_nodes[0], 'value')) {
      col_label_click
      .append('rect')
      .attr('class', 'col_bars')
      .attr('width', function(d) {
        var inst_value = 0;
        if (d.value > 0){
          inst_value = params.labels.bar_scale_col(d.value);
        }
        return inst_value;
      })
      // rotate labels - reduce width if rotating
      .attr('height', params.matrix.x_scale.rangeBand() * 0.66)
      .attr('fill', function(d) {
        return d.value > 0 ? params.matrix.bar_colors[0] : params.matrix.bar_colors[1];
      })
      .attr('opacity', 0.4);
    }

    // add column label
    col_label_click
      .append('text')
      .attr('x', 0)
      // manually tuned
      .attr('y', params.matrix.x_scale.rangeBand() * 0.64)
      .attr('dx', params.viz.border_width)
      .attr('text-anchor', 'start')
      .attr('full_name', function(d) {
        return d.name;
      })
      // original font size
      .style('font-size', params.labels.default_fs_col + 'px')
      .text(function(d){ return normal_name(d);})
      // .attr('pointer-events','none')
      .style('opacity',0)
      .transition().delay(text_delay).duration(text_delay)
      .style('opacity',1);

    if (params.labels.show_label_tooltips){

      // d3-tooltip
      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .direction('s')
        .offset([20, 0])
        .html(function(d) {
          var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
          return "<span>" + inst_name + "</span>";
        });

      d3.select('#'+params.viz.svg_div_id)
        .select('svg')
        .select('#col_container')
        .call(tip);
        
      col_label_obj
        .select('text')
        .on('mouseover',tip.show)
        .on('mouseout',tip.hide);

    }

    // bounding font size 
    /////////////////////////////

    params.bounding_width_max.col = 0;
    d3.selectAll('.col_label_click').each(function() {
      var tmp_width = d3.select(this).select('text').node().getBBox().width;
      if (tmp_width > params.bounding_width_max.col) {
        // increase the apparent width of the column label since its rotated
        // this will give more room for text
        params.bounding_width_max.col = tmp_width;
      }
    });

    // check if widest row or col are wider than the allowed label width
    ////////////////////////////////////////////////////////////////////////
    params.ini_scale_font = {};
    params.ini_scale_font.row = 1;
    params.ini_scale_font.col = 1;

    if (params.bounding_width_max.row > params.norm_label.width.row) {

      // calc reduction in font size
      params.ini_scale_font.row = params.norm_label.width.row / params.bounding_width_max.row;
      // redefine bounding_width_max.row
      params.bounding_width_max.row = params.ini_scale_font.row * params.bounding_width_max.row;

      // redefine default fs !! increase to make more readable 
      params.labels.default_fs_row = params.labels.default_fs_row * params.ini_scale_font.row;

      // reduce font size
      d3.selectAll('.row_label_text').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.default_fs_row + 'px');
      });
    }

    // debugger;

    if (params.bounding_width_max.col > params.norm_label.width.col) {

      // calc reduction in font size 
      params.ini_scale_font.col = params.norm_label.width.col / params.bounding_width_max.col;
      // redefine bounding_width_max.col
      params.bounding_width_max.col = params.ini_scale_font.col * params.bounding_width_max.col;
      // redefine default fs, !! increase to make more readable 
      params.labels.default_fs_col = params.labels.default_fs_col * params.ini_scale_font.col;

      // reduce font size
      d3.selectAll('.col_label_click').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.default_fs_col + 'px');
      });
    }

    // constrain text after zooming
    if (params.labels.row_keep < 1){
      d3.selectAll('.row_label_text' ).each(function() { trim_text(this, 'row'); });
    }
    if (params.labels.col_keep < 1){
      d3.selectAll('.col_label_click').each(function() { trim_text(this, 'col'); });
    }


    // append rectangle behind text
    col_label_click
      .insert('rect', 'text')
      .attr('class','.highlight_rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 0.5*params.matrix.rect_width)
      .style('opacity', 0);

    // change the size of the highlighting rects
    col_label_click
      .each(function() {
        var bbox = d3.select(this)
          .select('text')[0][0]
          .getBBox();
        d3.select(this)
          .select('.highlight_rect')
          .attr('x', bbox.x * 1.25)
          .attr('y', 0)
          .attr('width', bbox.width * 1.25)
          .attr('height', params.matrix.x_scale.rangeBand() * 0.6)
          .style('fill', 'yellow')
          .style('opacity', 0);
      });

    // add triangle under rotated labels
    col_label_click
      .append('path')
      .style('stroke-width', 0)
      .attr('d', function() {
        // x and y are flipped since its rotated
        var origin_y = -params.viz.border_width;
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand() - reduce_rect_width;
        var start_y = -(params.matrix.x_scale.rangeBand() - reduce_rect_width +
        params.viz.border_width);
        var final_y = -params.viz.border_width;
        var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' +
          start_x + ', L ' + final_y + ',' + final_x + ' Z';
        return output_string;
      })
      .attr('fill', function(d) {
        var inst_color = '#eee';
        if (params.labels.show_categories) {
          inst_color = params.labels.class_colors.col[d.cl];
        }
      return inst_color;
      })
      .style('opacity',0)
      .transition().delay(text_delay).duration(text_delay)
      .style('opacity',1);





    // add col callback function
    d3.selectAll('.col_label_text')
      .on('click',function(d){

        if (typeof params.click_label == 'function'){
          params.click_label(d.name, 'col');
          add_col_click_hlight(this, d.ini);
        } else {

          if (params.tile_click_hlight){
            add_col_click_hlight(this, d.ini);
          }

        }

      })
      .on('dblclick', function(d) {
        console.log('double clicking col')
        reorder.col_reorder.call(this);
        if (params.tile_click_hlight){
          add_col_click_hlight(this,d.ini);
        }
      });


    function add_col_click_hlight(clicked_col, id_clicked_col){

      if (id_clicked_col != params.click_hlight_col){

        params.click_hlight_col = id_clicked_col;

        var rel_width_hlight = 6;
        var opacity_hlight = 0.85;
        var hlight_width  = rel_width_hlight*params.viz.border_width;
        var hlight_height = rel_width_hlight*params.viz.border_width/params.viz.zoom_switch;

        d3.selectAll('.click_hlight')
          .remove();

        // // highlight selected column
        // ///////////////////////////////
        // // unhilight and unbold all columns (already unbolded earlier)
        // d3.selectAll('.col_label_text')
        //   .select('rect')
        //   .style('opacity', 0);
        // // highlight column name
        // d3.select(clicked_col)
        //   .select('rect')
        //   .style('opacity', 1);

        d3.select(clicked_col)
          .append('rect')
          .attr('class','click_hlight')
          .attr('id','col_top_hlight')
          .attr('width',params.viz.clust.dim.height)
          .attr('height',hlight_width)
          .attr('fill',params.matrix.hlight_color)
          .attr('opacity',opacity_hlight)
          .attr('transform',function(){
            var tmp_translate_y = 0;
            var tmp_translate_x = -(params.viz.clust.dim.height+
              params.class_room.col+params.viz.uni_margin);
            return 'translate('+tmp_translate_x+','+tmp_translate_y+')';
          });

        d3.select(clicked_col)
          .append('rect')
          .attr('class','click_hlight')
          .attr('id','col_bottom_hlight')
          .attr('width',params.viz.clust.dim.height)
          .attr('height',hlight_width)
          .attr('fill',params.matrix.hlight_color)
          .attr('opacity',opacity_hlight)
          .attr('transform', function(){
            // reverse x and y since rotated
            var tmp_translate_y = params.matrix.x_scale.rangeBand() - hlight_width;
            var tmp_translate_x = -(params.viz.clust.dim.height + 
              params.class_room.col+params.viz.uni_margin);
            return 'translate('+tmp_translate_x+','+tmp_translate_y+')';
          });
      } else {
        d3.selectAll('.click_hlight')
        .remove();
        params.click_hlight_col = -666;
      }

    }

    return container_all_col;

  }

  return {
    make_rows: make_rows,
    make_cols: make_cols
  };

}


function SuperLabels(){

  function make( params ){

  // super col title
  /////////////////////////////////////
  // add super column title background
  d3.select('#main_svg')
    .append('rect')
    .attr('fill', params.viz.background_color) 
    .attr('height', params.labels.super_label_width + 'px')
    .attr('width', '3000px')
    .attr('id','super_col_bkg')
    .attr('class', 'white_bars')
    .attr('transform', 'translate(0,' + params.viz.grey_border_width + ')');

  // super col title
  d3.select('#main_svg')
    .append('text')
    .attr('id','super_col')
    .text(params.labels.super.col)
    .attr('text-anchor', 'center')
    .attr('transform', function() {

      var inst_text_width = d3.select(this)[0][0]
        .getBBox().width;

      var inst_x = params.viz.clust.dim.width / 2 + params.norm_label.width
      .row - inst_text_width/2;
      var inst_y = params.labels.super_label_width - params.viz.uni_margin;
      return 'translate(' + inst_x + ',' + inst_y + ')';
    })
    .style('font-size', function(d){
      var inst_font_size = 14 * params.labels.super_label_scale;
      return inst_font_size+'px';
    })
    .style('font-weight', 300);

  // super row title
  /////////////////////////////////////
  d3.select('#main_svg')
    .append('rect')
    .attr('fill', params.viz.background_color) 
    .attr('width', params.labels.super_label_width + 'px')
    .attr('height', '3000px')
    .attr('id','super_row_bkg')
    .attr('class', 'white_bars')
    .attr('transform', 'translate(' + params.viz.grey_border_width + ',0)');

  // append super title row group
  // this is used to separate translation from rotation
  d3.select('#main_svg')
    .append('g')
    .attr('id','super_row')
    .attr('transform', function() {
      // position in the middle of the clustergram
      var inst_x = params.labels.super_label_width - params.viz.uni_margin;
      var inst_y = params.viz.clust.dim.height / 2 + params.norm_label.width
      .col;
      return 'translate(' + inst_x + ',' + inst_y + ')';
    });

  // super row label (rotate the already translated title )
  d3.select('#super_row')
    .append('text')
    .text(params.labels.super.row)
    .attr('text-anchor', 'center')
    .attr('transform', function(d){
      var inst_text_width = d3.select(this)[0][0].getBBox().width;
      var inst_x_offset = inst_text_width/2 + params.norm_label.width.col;
       var inst_offset = 'translate(0,'+inst_x_offset  +'), rotate(-90)'
       return inst_offset;
     })
    .style('font-size', function(d){
      var inst_font_size = 14 * params.labels.super_label_scale;
      return inst_font_size+'px';
    })
    .style('font-weight', 300)

  }

  return {
  make : make
  };
 }


/* Spillover Module 
*/
function Spillover( params, container_all_col ){

  // make spillover protection divs 
  make( params, container_all_col );

  function make( params, container_all_col ){

    // Spillover Protection 
    //////////////////////////

    // hide spillover from slanted column labels on right side
    container_all_col
      .append('path')
      .style('stroke-width', '0')
      // mini-language for drawing path in d3, used to draw triangle
      .attr('d', 'M 0,0 L 500,-500, L 500,0 Z')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('id', 'right_slant_triangle')
      .attr('transform', 'translate(' + params.viz.clust.dim.width + ',' +
      params.norm_label.width.col + ')');

    // hide spillover from slanted column labels on left side
    container_all_col
      .append('path')
      .style('stroke-width', '0')
      // mini-language for drawing path in d3, used to draw triangle
      .attr('d', 'M 0,0 L 500,-500, L 0,-500 Z')
      .attr('fill', params.viz.background_color)
      .attr('id', 'left_slant_triangle')
      // shift left by 1 px to prevent cutting off labels
      .attr('transform', 'translate(-1,' + params.norm_label.width.col +
      ')');

    // top corner rect
    ///////////////////////////////
    // white rect to cover excess labels
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', params.viz.clust.margin.left)
      .attr('height', params.viz.clust.margin.top)
      .attr('id', 'top_left_white');

    // hide spillover from right
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', '300px')
      .attr('height', '3000px')
      .attr('transform', function() {
        var tmp_left = params.viz.clust.margin.left + params.viz.clust.dim.width;
        var tmp_top = params.norm_label.margin.top + params.norm_label.width
          .col;
        return 'translate(' + tmp_left + ',' + tmp_top + ')';
      })
      .attr('class', 'white_bars')
      .attr('id','right_spillover');

    // white border bottom - prevent clustergram from hitting border
    ///////////////////////////////////////////////////////////////////
    d3.select('#main_svg')
      .append('rect')
      .attr('id','bottom_spillover')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', params.viz.svg_dim.width)
      // make this border twice the width of the grey border
      .attr('height', 2 * params.viz.grey_border_width)
      .attr('transform', function() {
        // shift up enough to show the entire border width
        var inst_offset = params.viz.svg_dim.height - 3 * params.viz.grey_border_width;
        return 'translate(0,' + inst_offset + ')';
      });

   
  }


}

function draw_grid_lines(row_nodes, col_nodes) {

  var row_nodes_names = params.network_data.row_nodes_names;
  var col_nodes_names = params.network_data.col_nodes_names;

  d3.selectAll('.horz_lines')
    .remove();

  d3.selectAll('.vert_lines')
    .remove();

  // append horizontal lines
  d3.select('#clust_group')
    .selectAll('.horz_lines')
    .data(row_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class','horz_lines')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(inst_index) + ') rotate(0)';
    })
    .append('line')
    .attr('x1',0)
    .attr('x2',params.viz.clust.dim.width)
    .style('stroke-width', params.viz.border_width/params.viz.zoom_switch+'px')
    .style('stroke','white');

  // append vertical line groups
  d3.select('#clust_group')
    .selectAll('.vert_lines')
    .data(col_nodes)
    .enter()
    .append('g')
    .attr('class', 'vert_lines')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
    })
    .append('line')
    .attr('x1', 0)
    .attr('x2', -params.viz.clust.dim.height)
    .style('stroke-width', params.viz.border_width + 'px')
    .style('stroke', 'white');
  }
  function reset_visualization_size(params) {

    // get outer_margins
    if ( params.viz.expand == false ){
      var outer_margins = params.viz.outer_margins;
    } else {
      var outer_margins = params.viz.outer_margins_expand;
    }

    // get the size of the window
    var screen_width  = window.innerWidth;
    var screen_height = window.innerHeight;

    // define width and height of clustergram container
    var cont_dim = {};
    cont_dim.width  = screen_width  - outer_margins.left - outer_margins.right;
    cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

    run_reset_visualization_size(cont_dim.width, cont_dim.height, outer_margins.left, outer_margins.top, params);

    // get dimensions of the main_svg
    var dim = {};
    dim.main_svg = {};
    dim.main_svg.w = d3.select('#main_svg').style('width').replace('px','');
    dim.main_svg.h = d3.select('#main_svg').style('height').replace('px','');
    
    // reposition the play button 
    d3.select('#play_button')
      .attr('transform', function(){
        var pos_x = dim.main_svg.w/2;
        var pos_y = dim.main_svg.h/2;
        return 'translate('+pos_x+','+pos_y+')';
      });

  }

  function run_reset_visualization_size(set_clust_width, set_clust_height, set_margin_left, set_margin_top, parameters) {

    var params = parameters || this.params;

    var row_nodes = params.network_data.row_nodes;
    var col_nodes = params.network_data.col_nodes;
    var row_nodes_names = _.pluck(row_nodes, 'name');
    var col_nodes_names = _.pluck(col_nodes, 'name');

    // reset zoom
    //////////////////////////////
    var zoom_y = 1;
    var zoom_x = 1;
    var pan_dx = 0;
    var pan_dy = 0;

    var half_height = params.viz.clust.dim.height / 2;
    var center_y = -(zoom_y - 1) * half_height;

    viz.get_clust_group()
      .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
      ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [pan_dx,pan_dy] + ')');

    d3.select('#row_label_zoom_container')
      .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
      zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

    d3.select('#row_viz_zoom_container')
      .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
      1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

    d3.select('#col_label_zoom_container')
      .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

    d3.select('#col_viz_zoom_container')
      .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

    // set y translate: center_y is positive, positive moves the visualization down
    // the translate vector has the initial margin, the first y centering, and pan_dy
    // times the scaling zoom_y
    var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;

    // reset the zoom translate and zoom
    params.zoom.translate([pan_dx, net_y_offset]);

    // size the svg container div - svg_div
    d3.select('#' + params.viz.svg_div_id)
        .style('margin-left', set_margin_left + 'px')
        .style('margin-top',  set_margin_top  + 'px')
        .style('width',  set_clust_width  + 'px')
        .style('height', set_clust_height + 'px');


    // Resetting some visualization parameters
    ///////////////////////////////////////////////

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

    // reduce clustergram width if triangles are taller than the normal width
    // of the columns
    var tmp_x_scale = d3.scale.ordinal().rangeBands([0, ini_clust_width]);
    tmp_x_scale.domain(params.matrix.orders.ini_row);
    var triangle_height = tmp_x_scale.rangeBand()/2 ;
    if (triangle_height > params.norm_label.width.col){
      ini_clust_width = ini_clust_width * ( params.norm_label.width.col/triangle_height );
    }
    params.viz.clust.dim.width = ini_clust_width ;

    // clustergram height
    ////////////////////////
    // ensure that rects are never taller than they are wide
    // force square tiles
    if (ini_clust_width / params.viz.num_col_nodes < ini_clust_height / params.viz.num_row_nodes) {

      // scale the height
      params.viz.clust.dim.height = ini_clust_width * (params.viz.num_row_nodes / params.viz.num_col_nodes);

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

    // zoom_switch from 1 to 2d zoom
    params.viz.zoom_switch = (params.viz.clust.dim.width / params.viz.num_col_nodes) / (params.viz.clust.dim.height / params.viz.num_row_nodes);

    // zoom_switch can not be less than 1
    if (params.viz.zoom_switch < 1) {
      params.viz.zoom_switch = 1;
    }




    // Begin resizing the visualization 


    // resize the svg
    ///////////////////////
    var svg_group = d3.select('#' + params.viz.svg_div_id)
      .select('svg')
      .attr('id', 'main_svg')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.svg_dim.height);

    // redefine x_scale and y_scale rangeBands
    params.matrix.x_scale.rangeBands([0, params.viz.clust.dim.width]);
    params.matrix.y_scale.rangeBands([0, params.viz.clust.dim.height]);

    // redefine x and y positions 
    _.each(params.network_data.links, function(d){
      d.x = params.matrix.x_scale(d.target);
      d.y = params.matrix.y_scale(d.source);
    });

    // precalc rect_width and height 
    // params.matrix.rect_width = params.matrix.x_scale.rangeBand() - params.viz.border_width;
    // params.matrix.rect_height = params.matrix.y_scale.rangeBand() - params.viz.border_width/params.viz.zoom_switch;
    params.matrix.rect_width = params.matrix.x_scale.rangeBand();
    params.matrix.rect_height = params.matrix.y_scale.rangeBand();

    // reset crossfilter 
    params.cf = {};
    params.cf.links = crossfilter(params.network_data.links);
    params.cf.dim_x = params.cf.links.dimension(function(d){return d.x;});
    params.cf.dim_y = params.cf.links.dimension(function(d){return d.y;}); 

    // reset all crossfilter filters 
    params.cf.dim_x.filterAll();
    params.cf.dim_y.filterAll();

    // redefine links - grab all links since filter is reset 
    var inst_links = params.cf.dim_x.top(Infinity);

    // redefine zoom extent
    params.viz.real_zoom = params.norm_label.width.col / (params.matrix.rect_width/2);

    // disable zoom while transitioning 
    svg_group.on('.zoom', null);

    // redefine zoom 
    params.zoom_obj = Zoom(params);  
    params.zoom
      .scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch])
      .on('zoom', params.zoom_obj.zoomed);


    // reenable zoom after transition 
    if (params.viz.do_zoom) {
      svg_group.call(params.zoom);
    }

    // prevent normal double click zoom etc 
    params.zoom_obj.ini_doubleclick();

    // redefine border width
    params.viz.border_width = params.matrix.rect_width / 55;

    // the default font sizes are set here
    params.labels.default_fs_row = params.matrix.rect_height * 1.07;
    params.labels.default_fs_col = params.matrix.rect_width * 0.87  ;

    svg_group.select('#super_background')
      .style('width', params.viz.svg_dim.width)
      .style('height', params.viz.svg_dim.height);

    svg_group.select('#grey_background')
      .attr('width', params.viz.clust.dim.width)
      .attr('height', params.viz.clust.dim.height);

    // resize rows and tiles within rows 

    svg_group.selectAll('.row')
      .attr('transform', function(d){
        var tmp_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,'+params.matrix.y_scale(tmp_index)+')';
      });
      
    // reset tiles 
    svg_group.selectAll('.row')
      .selectAll('.tile')
      .attr('transform', function(d){
        var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate('+x_pos+','+y_pos+')';
      })
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height);

    // reset tile_up 
    svg_group.selectAll('.row')
      .selectAll('.tile_up')
      .attr('d', function(d) {
          // up triangle 
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand();
          var start_y = 0;
          var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;

          var output_string = 'M' + start_x + ',' + start_y + ', L' +
          start_x + ', ' + final_y + ', L' + final_x + ',0 Z';

          return output_string;
        })  
        .attr('transform', function(d) {
          var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
          var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
          return 'translate(' + x_pos + ','+y_pos+')';
        });

    svg_group.selectAll('.row')
      .selectAll('.tile_dn')
      .attr('d', function(d) {
          // dn triangle 
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand();
          var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
          var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;

          var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
          final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';

          return output_string;
        })  
        .attr('transform', function(d) {
          var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
          var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
          return 'translate(' + x_pos + ','+y_pos+')';
        });            

    svg_group.selectAll('.highlighting_rect')
      .attr('width', params.matrix.x_scale.rangeBand() * 0.80)
      .attr('height', params.matrix.y_scale.rangeBand() * 0.80);

    svg_group.selectAll('.tile_split_up')
      .attr('d', function() {
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand();
        var start_y = 0;
        var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
        var output_string = 'M' + start_x + ',' + start_y + ', L' +
          start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
        return output_string;
      })

    svg_group.selectAll('.tile_split_dn')
      .attr('d', function() {
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand();
        var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
        var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
        var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
          final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
        return output_string;
      })

    // reposition tile highlight
    ////////////////////////////////

    var rel_width_hlight = 6;
    var opacity_hlight = 0.85;
    var hlight_width = rel_width_hlight*params.viz.border_width;
    var hlight_height = rel_width_hlight*params.viz.border_width/params.viz.zoom_switch;

    // top highlight
    d3.select('#top_hlight')
      .attr('width', params.matrix.rect_width)
      .attr('height', hlight_height)
      .attr('transform', function() {
        return 'translate(' + params.matrix.x_scale(params.matrix.click_hlight_x) + ',0)';
      });

    // left highlight
    d3.select('#left_hlight')
      .attr('width', hlight_width)
      .attr('height', params.matrix.rect_width - hlight_height*0.99 )
      .attr('transform', function() {
        return 'translate(' + params.matrix.x_scale(params.matrix.click_hlight_x) + ','+
          hlight_height*0.99+')';
      });

    // right highlight
    d3.select('#right_hlight')
      .attr('width', hlight_width)
      .attr('height', params.matrix.rect_height - hlight_height*0.99 )
      .attr('transform', function() {
        var tmp_translate = params.matrix.x_scale(params.matrix.click_hlight_x) + params.matrix.rect_width - hlight_width;
        return 'translate(' + tmp_translate + ','+
          hlight_height*0.99+')';
      });

    // bottom highlight
    d3.select('#bottom_hlight')
      .attr('width', function(){
        return params.matrix.rect_width - 1.98*hlight_width})
      .attr('height', hlight_height)
      .attr('transform', function() {
        var tmp_translate_x = params.matrix.x_scale(params.matrix.click_hlight_x) + hlight_width*0.99;
        var tmp_translate_y = params.matrix.rect_height - hlight_height;
        return 'translate(' + tmp_translate_x + ','+
          tmp_translate_y+')';
      });

    // resize row highlight
    /////////////////////////
    d3.select('#row_top_hlight')
      .attr('width',params.viz.svg_dim.width)
      .attr('height',hlight_height);

    d3.select('#row_bottom_hlight')
      .attr('width',params.viz.svg_dim.width)
      .attr('height',hlight_height)
      .attr('transform', function(){
        var tmp_translate_y = params.matrix.rect_height - hlight_height;
        return 'translate(0,'+tmp_translate_y+')';
      });

    // resize col highlight 
    /////////////////////////
    d3.select('#col_top_hlight')
      .attr('width',params.viz.clust.dim.height)
      .attr('height',hlight_width)
      .attr('transform',function(){
            var tmp_translate_y = 0;
            var tmp_translate_x = -(params.viz.clust.dim.height+
              params.class_room.col+params.viz.uni_margin);
            return 'translate('+tmp_translate_x+','+tmp_translate_y+')';
          });

    d3.select('#col_bottom_hlight')
      .attr('width',params.viz.clust.dim.height)
      .attr('height',hlight_width)
      .attr('transform', function(){
            var tmp_translate_y = params.matrix.rect_width - hlight_width;
            var tmp_translate_x = -(params.viz.clust.dim.height + 
              params.class_room.col+params.viz.uni_margin);
            return 'translate('+tmp_translate_x+','+tmp_translate_y+')';
          });

    // add text to row/col during resize
    function normal_name(d){
      var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
      if (inst_name.length > params.labels.max_label_char){
        inst_name = inst_name.substring(0,params.labels.max_label_char)+'..';
      }
      return inst_name;
    }

    // resize row labels
    ///////////////////////////

    svg_group.select('#row_container')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.viz.clust.margin.top + ')');

    svg_group.select('#row_container')
      .select('.white_bars')
      .attr('width', params.norm_label.background.row)
      .attr('height', 30*params.viz.clust.dim.height + 'px');

    svg_group.select('#row_container')
      .select('#row_label_outer_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.selectAll('.row_label_text')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      });


    svg_group.selectAll('.row_label_text')
      .select('text')
      .style('font-size', params.labels.default_fs_row + 'px')
      .text(function(d){ return normal_name(d);});

    // change the size of the highlighting rects
    svg_group.selectAll('.row_label_text')
      .each(function() {
        var bbox = d3.select(this).select('text')[0][0].getBBox();
        d3.select(this)
          .select('rect')
          .attr('x', bbox.x )
          .attr('y', 0)
          .attr('width', bbox.width )
          .attr('height', params.matrix.rect_height)
          .style('fill', 'yellow')
          .style('opacity', function(d) {
            var inst_opacity = 0;
            // highlight target genes
            if (d.target === 1) {
              inst_opacity = 1;
            }
            return inst_opacity;
          });
      });

    // label the widest row and col labels
    params.bounding_width_max = {};
    params.bounding_width_max.row = 0;
    d3.selectAll('.row_label_text').each(function() {
      var tmp_width = d3.select(this).select('text').node().getBBox().width;
      if (tmp_width > params.bounding_width_max.row) {
        params.bounding_width_max.row = tmp_width;
      }
    });

    svg_group.select('#row_viz_outer_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.select('#row_viz_outer_container')
      .select('white_bars')
      .attr('width', params.class_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });

    svg_group.selectAll('.row_viz_group')
      .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
        });

    svg_group.selectAll('.row_viz_group')
      .select('path')
      .attr('d', function() {
        var origin_x = params.class_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.matrix.rect_height / 2;
        var final_x = params.class_room.symbol_width - 1;
        var final_y = params.matrix.rect_height;
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      });


      if (Utils.has( params.network_data.row_nodes[0], 'value')) {

        // set bar scale
        var enr_max = Math.abs(_.max( params.network_data.row_nodes, function(d) { return Math.abs(d.value) } ).value) ;
        params.labels.bar_scale_row = d3.scale
          .linear()
          .domain([0, enr_max])
          .range([0, params.norm_label.width.row ]);

        svg_group.selectAll('.row_bars')
          .attr('width', function(d) {
            var inst_value = 0;
            inst_value = params.labels.bar_scale_row( Math.abs(d.value) );
            return inst_value;
          })
          .attr('x', function(d) {
            var inst_value = 0;
            inst_value = -params.labels.bar_scale_row( Math.abs(d.value) );
            return inst_value;
          })
          .attr('height', params.matrix.rect_height );

      }

      // resize col labels
      ///////////////////////
      svg_group.select('#col_container')
        .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
        params.norm_label.margin.top + ')');

      svg_group.select('#col_container')
        .select('.white_bars')
        .attr('width', 30 * params.viz.clust.dim.width + 'px')
        .attr('height', params.norm_label.background.col);

      svg_group.select('#col_container')
        .select('.col_label_outer_container')
        .attr('transform', 'translate(0,' + params.norm_label.width.col + ')');

      // offset click group column label
      var x_offset_click = params.matrix.rect_width / 2 + params.viz.border_width;
      // reduce width of rotated rects
      var reduce_rect_width = params.matrix.rect_width * 0.36;

      svg_group.selectAll('.col_label_text')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
        });

      svg_group.selectAll('.col_label_click')
        .attr('transform', 'translate(' + params.matrix.rect_width / 2 + ',' + x_offset_click + ') rotate(45)');

      svg_group.selectAll('.col_label_click')
        .select('text')
        .attr('y', params.matrix.rect_width * 0.60)
        .attr('dx', 2 * params.viz.border_width)
        .style('font-size', params.labels.default_fs_col + 'px')
        .text(function(d){ return normal_name(d);});

      params.bounding_width_max.col = 0;
      svg_group.selectAll('.col_label_click').each(function() {
        var tmp_width = d3.select(this).select('text').node().getBBox().width;
        if (tmp_width > params.bounding_width_max.col) {
        params.bounding_width_max.col = tmp_width * 1.2;
        }
      });


      // check if widest row or col are wider than the allowed label width
      ////////////////////////////////////////////////////////////////////////
      params.ini_scale_font = {};
      params.ini_scale_font.row = 1;
      params.ini_scale_font.col = 1;

      if (params.bounding_width_max.row > params.norm_label.width.row) {

        // calc reduction in font size
        params.ini_scale_font.row = params.norm_label.width.row / params.bounding_width_max.row;
        // redefine bounding_width_max.row
        params.bounding_width_max.row = params.ini_scale_font.row * params.bounding_width_max.row;

        // redefine default fs
        params.labels.default_fs_row = params.labels.default_fs_row * params.ini_scale_font.row;
        // reduce font size
        d3.selectAll('.row_label_text').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_row + 'px');
        });
      }

      if (params.bounding_width_max.col > params.norm_label.width.col) {

        // calc reduction in font size
        params.ini_scale_font.col = params.norm_label.width.col / params.bounding_width_max.col;
        // redefine bounding_width_max.col
        params.bounding_width_max.col = params.ini_scale_font.col * params.bounding_width_max.col;
        // redefine default fs
        params.labels.default_fs_col = params.labels.default_fs_col * params.ini_scale_font.col;
        // reduce font size
        d3.selectAll('.col_label_click').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_col + 'px');
        });
      }

    svg_group.selectAll('.row_label_text')
      .select('text')
      .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

      svg_group.selectAll('.col_label_click')
        .each(function() {
          var bbox = d3.select(this)
            .select('text')[0][0]
            .getBBox();

          // d3.select(this)
          //   .select('rect')
          //   .attr('x', bbox.x * 1.25)
          //   .attr('y', 0)
          //   .attr('width', bbox.width * 1.25)
          //   .attr('height', params.matrix.rect_width * 0.6)
          //   .style('fill', 'yellow')
          //   .style('opacity', 0);
        });

      // resize column triangle 
      svg_group.selectAll('.col_label_click')
        .select('path')
        .attr('d', function() {
          // x and y are flipped since its rotated
          var origin_y = -params.viz.border_width;
          var start_x = 0;
          var final_x = params.matrix.rect_width - reduce_rect_width;
          var start_y = -(params.matrix.rect_width - reduce_rect_width +
          params.viz.border_width);
          var final_y = -params.viz.border_width;
          var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' +
            start_x + ', L ' + final_y + ',' + final_x + ' Z';
          return output_string;
        })
        .attr('fill', function(d) {
          var inst_color = '#eee';
          if (params.labels.show_categories) {
            inst_color = params.labels.class_colors.col[d.cl];
          }
          return inst_color;
        });

      // append column value bars
      if (Utils.has( params.network_data.col_nodes[0], 'value')) {

        svg_group.selectAll('.col_bars')
          .attr('width', function(d) {
            var inst_value = 0;
            if (d.value > 0){
              inst_value = params.labels.bar_scale_col(d.value);
            }
            return inst_value;
          })
          // rotate labels - reduce width if rotating
          .attr('height', params.matrix.rect_width * 0.66);
      }

      // resize dendrogram
      ///////////////////
      svg_group.selectAll('.row_class_rect')
        .attr('width', function() {
          var inst_width = params.class_room.symbol_width - 1;
          return inst_width + 'px';
        })
        .attr('height', params.matrix.y_scale.rangeBand())
        .attr('x', function() {
          var inst_offset = params.class_room.symbol_width + 1;
          return inst_offset + 'px';
        });

      svg_group.selectAll('.col_class_rect')
        .attr('width', params.matrix.x_scale.rangeBand())
        .attr('height', function() {
          var inst_height = params.class_room.col - 1;
          return inst_height;
        });

      svg_group.selectAll('.col_viz_group')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
        });

      // reposition grid lines
      ////////////////////////////
      svg_group.selectAll('.horz_lines')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0,' + params.matrix.y_scale(inst_index) + ') rotate(0)';
        })

      svg_group.selectAll('.horz_lines')
        .select('line')
        .attr('x2',params.viz.clust.dim.width)
        .style('stroke-width', params.viz.border_width/params.viz.zoom_switch+'px')

      svg_group.selectAll('.vert_lines')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
        });

      svg_group.selectAll('.vert_lines')
        .select('line')
        .attr('x2', -params.viz.clust.dim.height)
        .style('stroke-width', params.viz.border_width + 'px');

      // var row_nodes = params.network_data.row_nodes;
      // var col_nodes = params.network_data.col_nodes;

      // draw_grid_lines(row_nodes, col_nodes);

    // resize superlabels
    /////////////////////////////////////
    svg_group.select('#super_col_bkg')
      .attr('height', params.labels.super_label_width + 'px')
      .attr('transform', 'translate(0,' + params.viz.grey_border_width + ')');

    // super col title
    svg_group.select('#super_col')
      .attr('transform', function() {
        var inst_x = params.viz.clust.dim.width / 2 + params.norm_label.width
          .row;
        var inst_y = params.labels.super_label_width - params.viz.uni_margin;
        return 'translate(' + inst_x + ',' + inst_y + ')';
      });

    // super row title
    svg_group.select('#super_row_bkg')
      .attr('width', params.labels.super_label_width + 'px')
      .attr('transform', 'translate(' + params.viz.grey_border_width + ',0)');

    // append super title row group
    svg_group.select('#super_row')
      .attr('transform', function() {
        var inst_x = params.labels.super_label_width - params.viz.uni_margin;
        var inst_y = params.viz.clust.dim.height / 2 + params.norm_label.width
          .col;
        return 'translate(' + inst_x + ',' + inst_y + ')';
      });

    // resize spillover
    //////////////////////////
    // hide spillover from slanted column labels on right side
    svg_group.select('#right_slant_triangle')
      .attr('transform', 'translate(' + params.viz.clust.dim.width + ',' +
      params.norm_label.width.col + ')');

    svg_group.select('#left_slant_triangle')
      .attr('transform', 'translate(-1,' + params.norm_label.width.col +')');

    svg_group.select('#top_left_white')
      .attr('width', params.viz.clust.margin.left)
      .attr('height', params.viz.clust.margin.top);

    svg_group.select('#right_spillover')
      .attr('transform', function() {
        var tmp_left = params.viz.clust.margin.left + params.viz.clust.dim.width;
        var tmp_top = params.norm_label.margin.top + params.norm_label.width
          .col;
        return 'translate(' + tmp_left + ',' + tmp_top + ')';
      });

    // white border bottom - prevent clustergram from hitting border
    svg_group.select('#bottom_spillover')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', 2 * params.viz.grey_border_width)
      .attr('transform', function() {
        // shift up enough to show the entire border width
        var inst_offset = params.viz.svg_dim.height - 3 * params.viz.grey_border_width;
        return 'translate(0,' + inst_offset + ')';
      });


    // add border to svg in four separate lines - to not interfere with clicking anything
    ///////////////////////////////////////////////////////////////////////////////////////
    // left border
    svg_group.select('#left_border')
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', 'translate(0,0)');

    // right border
    svg_group.select('#right_border')
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', function() {
        var inst_offset = params.viz.svg_dim.width - params.viz.grey_border_width;
        return 'translate(' + inst_offset + ',0)';
      });

    // top border
    svg_group.select('#top_border')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
        var inst_offset = 0;
        return 'translate(' + inst_offset + ',0)';
      });

    // bottom border
    svg_group.select('#bottom_border')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
        var inst_offset = params.viz.svg_dim.height - params.viz.grey_border_width;
        return 'translate(0,' + inst_offset + ')';
      });

    // reset zoom and translate
    //////////////////////////////
    params.zoom.scale(1).translate(
        [ params.viz.clust.margin.left, params.viz.clust.margin.top]
    );

    d3.select('#main_svg').style('opacity',1);
  }

function resize_after_update(params, row_nodes, col_nodes, links, duration, delays){

  var row_nodes_names = params.network_data.row_nodes_names;
  var col_nodes_names = params.network_data.col_nodes_names;

  // reset zoom
  //////////////////////////////
  var zoom_y = 1;
  var zoom_x = 1;
  var pan_dx = 0;
  var pan_dy = 0;

  var half_height = params.viz.clust.dim.height / 2;
  var center_y = -(zoom_y - 1) * half_height;

  viz.get_clust_group()
    .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
    ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [pan_dx,pan_dy] + ')');

  d3.select('#row_label_zoom_container')
    .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
    zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

  d3.select('#row_viz_zoom_container')
    .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
    1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

  d3.select('#col_label_zoom_container')
    .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

  d3.select('#col_viz_zoom_container')
    .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

  // set y translate: center_y is positive, positive moves the visualization down
  // the translate vector has the initial margin, the first y centering, and pan_dy
  // times the scaling zoom_y
  var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;

  // reset the zoom translate and zoom
  params.zoom.translate([pan_dx, net_y_offset]);


  // Resetting some visualization parameters
  ///////////////////////////////////////////////

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

  // reduce clustergram width if triangles are taller than the normal width
  // of the columns
  var tmp_x_scale = d3.scale.ordinal().rangeBands([0, ini_clust_width]);
  tmp_x_scale.domain(params.matrix.orders.ini_row);
  var triangle_height = tmp_x_scale.rangeBand()/2 ;
  if (triangle_height > params.norm_label.width.col){
    ini_clust_width = ini_clust_width * ( params.norm_label.width.col/triangle_height );
  }
  params.viz.clust.dim.width = ini_clust_width ;

  // clustergram height
  ////////////////////////
  // ensure that rects are never taller than they are wide
  // force square tiles
  if (ini_clust_width / params.viz.num_col_nodes < ini_clust_height / params.viz.num_row_nodes) {

    // scale the height
    params.viz.clust.dim.height = ini_clust_width * (params.viz.num_row_nodes / params.viz.num_col_nodes);

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

  // zoom_switch from 1 to 2d zoom
  params.viz.zoom_switch = (params.viz.clust.dim.width / params.viz.num_col_nodes) / (params.viz.clust.dim.height / params.viz.num_row_nodes);

  // zoom_switch can not be less than 1
  if (params.viz.zoom_switch < 1) {
    params.viz.zoom_switch = 1;
  }


  // redefine x_scale and y_scale rangeBands
  params.matrix.x_scale.rangeBands([0, params.viz.clust.dim.width]);
  params.matrix.y_scale.rangeBands([0, params.viz.clust.dim.height]);

  // redefine zoom extent
  params.viz.real_zoom = params.norm_label.width.col / (params.matrix.x_scale.rangeBand()/2);
  params.zoom
    .scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch]);

  // redefine border width
  params.viz.border_width = params.matrix.x_scale.rangeBand() / 40;

  // the default font sizes are set here
  params.labels.default_fs_row = params.matrix.y_scale.rangeBand() * 1.01;
  params.labels.default_fs_col = params.matrix.x_scale.rangeBand() * 0.85;



  // Begin resizing the visualization 
  /////////////////////////////////////////
  /////////////////////////////////////////

  // resize the svg
  ///////////////////////
  var svg_group = d3.select('#' + params.viz.svg_div_id)
    .select('svg'); 

  svg_group.select('#grey_background')
    .transition().delay(delays.update).duration(duration)
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);


  //////////////////////
  // set up later 
  //////////////////////
  // svg_group.selectAll('.highlighting_rect')
  //   // .transition().delay(delays.update).duration(duration)
  //   .attr('width', params.matrix.x_scale.rangeBand() * 0.80)
  //   .attr('height', params.matrix.y_scale.rangeBand() * 0.80);
  // svg_group.selectAll('.tile_split_up')
  //   // .transition().delay(delays.update).duration(duration)
  //   .attr('d', function() {
  //     var start_x = 0;
  //     var final_x = params.matrix.x_scale.rangeBand();
  //     var start_y = 0;
  //     var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
  //     var output_string = 'M' + start_x + ',' + start_y + ', L' +
  //       start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
  //     return output_string;
  //   })
  // svg_group.selectAll('.tile_split_dn')
  //   // .transition().delay(delays.update).duration(duration)
  //   .attr('d', function() {
  //     var start_x = 0;
  //     var final_x = params.matrix.x_scale.rangeBand();
  //     var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
  //     var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
  //     var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
  //       final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
  //     return output_string;
  //   })
  
  // add text to row/col during resize
  function normal_name(d){
    var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
    if (inst_name.length > params.labels.max_label_char){
      inst_name = inst_name.substring(0,params.labels.max_label_char)+'..';
    }
    return inst_name;
  }

  // resize row labels
  ///////////////////////////

  if (delays.run_transition){

    svg_group.select('#row_container')
      .transition().delay(delays.update).duration(duration)
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.viz.clust.margin.top + ')');

    svg_group.select('#row_container')
      .select('.white_bars')
      .transition().delay(delays.update).duration(duration)
      .attr('width', params.norm_label.background.row)
      .attr('height', 30*params.viz.clust.dim.height + 'px');

    svg_group.select('#row_container')
      .select('#row_label_outer_container')
      .transition().delay(delays.update).duration(duration)
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.selectAll('.row_label_text')
      .data(row_nodes, function(d){return d.name;})
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      })
      .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

  } else {
      svg_group.select('#row_container')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.viz.clust.margin.top + ')');

    svg_group.select('#row_container')
      .select('.white_bars')
      .attr('width', params.norm_label.background.row)
      .attr('height', 30*params.viz.clust.dim.height + 'px');

    svg_group.select('#row_container')
      .select('#row_label_outer_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.selectAll('.row_label_text')
      .data(row_nodes, function(d){return d.name;})
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      })
      .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 );
  }

   // do not delay the font size change since this will break the bounding box calc
  svg_group.selectAll('.row_label_text')
    .select('text')
    .style('font-size', params.labels.default_fs_row + 'px')
    .text(function(d){ return normal_name(d);});

  // change the size of the highlighting rects
  svg_group.selectAll('.row_label_text')
    .each(function() {
      var bbox = d3.select(this).select('text')[0][0].getBBox();
      d3.select(this)
        .select('rect')
        .attr('x', bbox.x )
        .attr('y', 0)
        .attr('width', bbox.width )
        .attr('height', params.matrix.y_scale.rangeBand())
        .style('fill', 'yellow')
        .style('opacity', function(d) {
          var inst_opacity = 0;
          // highlight target genes
          if (d.target === 1) {
            inst_opacity = 1;
          }
          return inst_opacity;
        });
    });

  // label the widest row and col labels
  params.bounding_width_max = {};
  params.bounding_width_max.row = 0;
  d3.selectAll('.row_label_text').each(function() {
    var tmp_width = d3.select(this).select('text').node().getBBox().width;
    if (tmp_width > params.bounding_width_max.row) {
      params.bounding_width_max.row = tmp_width;
    }
  });

  // check if widest row or col are wider than the allowed label width
  ////////////////////////////////////////////////////////////////////////
  params.ini_scale_font = {};
  params.ini_scale_font.row = 1;
  params.ini_scale_font.col = 1;

  if (params.bounding_width_max.row > params.norm_label.width.row) {

    // calc reduction in font size
    params.ini_scale_font.row = params.norm_label.width.row / params.bounding_width_max.row;
    // redefine bounding_width_max.row
    params.bounding_width_max.row = params.ini_scale_font.row * params.bounding_width_max.row;

    // redefine default fs
    params.labels.default_fs_row = params.labels.default_fs_row * params.ini_scale_font.row;
    // reduce font size
    d3.selectAll('.row_label_text').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.default_fs_row + 'px');
    })
  }

  if (delays.run_transition){

    // positioning row text after row text size may have been reduced 
    svg_group.selectAll('.row_label_text')
      .select('text')
      .transition().delay(delays.update).duration(duration)
      .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

    svg_group.select('#row_viz_outer_container')
      .transition().delay(delays.update).duration(duration)
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.select('#row_viz_outer_container')
      .transition().delay(delays.update).duration(duration)
      .select('white_bars')
      .attr('width', params.class_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });

    svg_group.selectAll('.row_viz_group')
      .data(row_nodes, function(d){return d.name;})
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
        });

    svg_group.selectAll('.row_viz_group')
      .select('path')
      .transition().delay(delays.update).duration(duration)
      .attr('d', function() {
        var origin_x = params.class_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.matrix.y_scale.rangeBand() / 2;
        var final_x = params.class_room.symbol_width - 1;
        var final_y = params.matrix.y_scale.rangeBand();
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      });

  } else {

    // positioning row text after row text size may have been reduced 
    svg_group.selectAll('.row_label_text')
      .select('text')
      .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

    svg_group.select('#row_viz_outer_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.select('#row_viz_outer_container')
      .select('white_bars')
      .attr('width', params.class_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });

    svg_group.selectAll('.row_viz_group')
      .data(row_nodes, function(d){return d.name;})
      .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
        });

    svg_group.selectAll('.row_viz_group')
      .select('path')
      .attr('d', function() {
        var origin_x = params.class_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.matrix.y_scale.rangeBand() / 2;
        var final_x = params.class_room.symbol_width - 1;
        var final_y = params.matrix.y_scale.rangeBand();
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      });

  }

    if (Utils.has( params.network_data.row_nodes[0], 'value')) {

      // set bar scale
      var enr_max = Math.abs(_.max( params.network_data.row_nodes, function(d) { return Math.abs(d.value) } ).value) ;
      params.labels.bar_scale_row = d3.scale
        .linear()
        .domain([0, enr_max])
        .range([0, params.norm_label.width.row ]);

      svg_group.selectAll('.row_bars')
        // .transition().delay(delays.update).duration(duration)
        .attr('width', function(d) {
          var inst_value = 0;
          inst_value = params.labels.bar_scale_row( Math.abs(d.value) );
          return inst_value;
        })
        .attr('x', function(d) {
          var inst_value = 0;
          inst_value = -params.labels.bar_scale_row( Math.abs(d.value) );
          return inst_value;
        })
        .attr('height', params.matrix.y_scale.rangeBand() );

    }



    // resize col labels
    ///////////////////////

    if (delays.run_transition){

      svg_group.select('#col_container')
        .transition().delay(delays.update).duration(duration)
        .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
        params.norm_label.margin.top + ')');

      svg_group.select('#col_container')
        .transition().delay(delays.update).duration(duration)
        .select('.white_bars')
        .attr('width', 30 * params.viz.clust.dim.width + 'px')
        .attr('height', params.norm_label.background.col);

      svg_group.select('#col_container')
        .transition().delay(delays.update).duration(duration)
        .select('.col_label_outer_container')
        .attr('transform', 'translate(0,' + params.norm_label.width.col + ')');

      // offset click group column label
      var x_offset_click = params.matrix.x_scale.rangeBand() / 2 + params.viz.border_width;
      // reduce width of rotated rects
      var reduce_rect_width = params.matrix.x_scale.rangeBand() * 0.36;

      svg_group.selectAll('.col_label_text')
        .data(col_nodes, function(d){return d.name;})
        .transition().delay(delays.update).duration(duration)
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
        });

      svg_group.selectAll('.col_label_click')
        .transition().delay(delays.update).duration(duration)
        .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)');

      svg_group.selectAll('.col_label_click')
        .select('text')
        .style('font-size', params.labels.default_fs_col + 'px')
        .text(function(d){ return normal_name(d);});

      svg_group.selectAll('.col_label_click')
        .select('text')
        .transition().delay(delays.update).duration(duration)
        .attr('y', params.matrix.x_scale.rangeBand() * 0.60)
        .attr('dx', 2 * params.viz.border_width);

    } else {

      svg_group.select('#col_container')
        .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
        params.norm_label.margin.top + ')');

      svg_group.select('#col_container')
        .select('.white_bars')
        .attr('width', 30 * params.viz.clust.dim.width + 'px')
        .attr('height', params.norm_label.background.col);

      svg_group.select('#col_container')
        .select('.col_label_outer_container')
        .attr('transform', 'translate(0,' + params.norm_label.width.col + ')');

      // offset click group column label
      var x_offset_click = params.matrix.x_scale.rangeBand() / 2 + params.viz.border_width;
      // reduce width of rotated rects
      var reduce_rect_width = params.matrix.x_scale.rangeBand() * 0.36;

      svg_group.selectAll('.col_label_text')
        .data(col_nodes, function(d){return d.name;})
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
        });

      svg_group.selectAll('.col_label_click')
        .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)');

      svg_group.selectAll('.col_label_click')
        .select('text')
        .style('font-size', params.labels.default_fs_col + 'px')
        .text(function(d){ return normal_name(d);});

      svg_group.selectAll('.col_label_click')
        .select('text')
        .attr('y', params.matrix.x_scale.rangeBand() * 0.60)
        .attr('dx', 2 * params.viz.border_width);

    }



    params.bounding_width_max.col = 0;
    svg_group.selectAll('.col_label_click').each(function() {
      var tmp_width = d3.select(this).select('text').node().getBBox().width;
      if (tmp_width > params.bounding_width_max.col) {
        params.bounding_width_max.col = tmp_width;
      }
    });


    if (params.bounding_width_max.col > params.norm_label.width.col) {

      // calc reduction in font size
      params.ini_scale_font.col = params.norm_label.width.col / params.bounding_width_max.col;
      // redefine bounding_width_max.col
      params.bounding_width_max.col = params.ini_scale_font.col * params.bounding_width_max.col;
      // redefine default fs
      params.labels.default_fs_col = params.labels.default_fs_col * params.ini_scale_font.col;
      // reduce font size
      d3.selectAll('.col_label_click').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.default_fs_col + 'px');
      })
      // .attr('y', params.matrix.rect_width * 0.5 + params.labels.default_fs_col*0.25 )
    }

    svg_group.selectAll('.col_label_click')
      .each(function() {
        var bbox = d3.select(this)
          .select('text')[0][0]
          .getBBox();
        // d3.select(this)
        //   .select('rect')
        //   .attr('x', bbox.x * 1.25)
        //   .attr('y', 0)
        //   .attr('width', bbox.width * 1.25)
        //   .attr('height', params.matrix.x_scale.rangeBand() * 0.6)
        //   .style('fill', 'yellow')
        //   .style('opacity', 0);
      });



    if (delays.run_transition){

      // resize column triangle 
      svg_group.selectAll('.col_label_click')
        .select('path')
        .transition().delay(delays.update).duration(duration)
        .attr('d', function() {
          // x and y are flipped since its rotated
          var origin_y = -params.viz.border_width;
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand() - reduce_rect_width;
          var start_y = -(params.matrix.x_scale.rangeBand() - reduce_rect_width +
          params.viz.border_width);
          var final_y = -params.viz.border_width;
          var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' +
            start_x + ', L ' + final_y + ',' + final_x + ' Z';
          return output_string;
        })
        .attr('fill', function(d) {
          var inst_color = '#eee';
          if (params.labels.show_categories) {
            inst_color = params.labels.class_colors.col[d.cl];
          }
          return inst_color;
        });

    } else {
      // resize column triangle 
      svg_group.selectAll('.col_label_click')
        .select('path')
        .attr('d', function() {
          // x and y are flipped since its rotated
          var origin_y = -params.viz.border_width;
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand() - reduce_rect_width;
          var start_y = -(params.matrix.x_scale.rangeBand() - reduce_rect_width +
          params.viz.border_width);
          var final_y = -params.viz.border_width;
          var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' +
            start_x + ', L ' + final_y + ',' + final_x + ' Z';
          return output_string;
        })
        .attr('fill', function(d) {
          var inst_color = '#eee';
          if (params.labels.show_categories) {
            inst_color = params.labels.class_colors.col[d.cl];
          }
          return inst_color;
        });      
    }


    // append column value bars
    if (Utils.has( params.network_data.col_nodes[0], 'value')) {

      svg_group.selectAll('.col_bars')
        .transition().delay(delays.update).duration(duration)
        .attr('width', function(d) {
          var inst_value = 0;
          if (d.value > 0){
            inst_value = params.labels.bar_scale_col(d.value);
          }
          return inst_value;
        })
        // rotate labels - reduce width if rotating
        .attr('height', params.matrix.x_scale.rangeBand() * 0.66);
    }

  // resize dendrogram
  ///////////////////

  if (delays.run_transition){

    svg_group.selectAll('.row_class_rect')
      .transition().delay(delays.update).duration(duration)
      .attr('width', function() {
        var inst_width = params.class_room.symbol_width - 1;
        return inst_width + 'px';
      })
      .attr('height', params.matrix.y_scale.rangeBand())
      .attr('x', function() {
        var inst_offset = params.class_room.symbol_width + 1;
        return inst_offset + 'px';
      });

    svg_group.selectAll('.col_class_rect')
      .transition().delay(delays.update).duration(duration)
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', function() {
        var inst_height = params.class_room.col - 1;
        return inst_height;
      });

    svg_group.selectAll('.col_viz_group')
      .data(col_nodes, function(d){return d.name;})
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
      });

    } else {

      svg_group.selectAll('.row_class_rect')
      .attr('width', function() {
        var inst_width = params.class_room.symbol_width - 1;
        return inst_width + 'px';
      })
      .attr('height', params.matrix.y_scale.rangeBand())
      .attr('x', function() {
        var inst_offset = params.class_room.symbol_width + 1;
        return inst_offset + 'px';
      });

    svg_group.selectAll('.col_class_rect')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', function() {
        var inst_height = params.class_room.col - 1;
        return inst_height;
      });

    svg_group.selectAll('.col_viz_group')
      .data(col_nodes, function(d){return d.name;})
      .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
      });

    }

  // reposition grid lines
  ////////////////////////////
  svg_group.selectAll('.horz_lines')
    .data(row_nodes, function(d){return d.name;})
    // .transition().delay(delays.update).duration(duration)
    .attr('transform', function(d) {
      var inst_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(inst_index) + ') rotate(0)';
    })

  svg_group.selectAll('.horz_lines')
    .select('line')
    // .transition().delay(delays.update).duration(duration)
    .attr('x2',params.viz.clust.dim.width)
    .style('stroke-width', params.viz.border_width/params.viz.zoom_switch+'px')

  svg_group.selectAll('.vert_lines')
    .data(col_nodes, function(d){return d.name;})
    // .transition().delay(delays.update).duration(duration)
    .attr('transform', function(d) {
        var inst_index = _.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
    });

  svg_group.selectAll('.vert_lines')
    .select('line')
    // .transition().delay(delays.update).duration(duration)
    .attr('x2', -params.viz.clust.dim.height)
    .style('stroke-width', params.viz.border_width + 'px');

  // resize superlabels
  /////////////////////////////////////
  svg_group.select('#super_col_bkg')
    // .transition().delay(delays.update).duration(duration)
    .attr('height', params.labels.super_label_width + 'px')
    .attr('transform', 'translate(0,' + params.viz.grey_border_width + ')');

  // super col title
  svg_group.select('#super_col')
    // .transition().delay(delays.update).duration(duration)
    .attr('transform', function() {
      var inst_x = params.viz.clust.dim.width / 2 + params.norm_label.width
        .row;
      var inst_y = params.labels.super_label_width - params.viz.uni_margin;
      return 'translate(' + inst_x + ',' + inst_y + ')';
    });

  // super row title
  svg_group.select('#super_row_bkg')
    // .transition().delay(delays.update).duration(duration)
    .attr('width', params.labels.super_label_width + 'px')
    .attr('transform', 'translate(' + params.viz.grey_border_width + ',0)');

  // append super title row group
  svg_group.select('#super_row')
    // .transition().delay(delays.update).duration(duration)
    .attr('transform', function() {
      var inst_x = params.labels.super_label_width - params.viz.uni_margin;
      var inst_y = params.viz.clust.dim.height / 2 + params.norm_label.width
        .col;
      return 'translate(' + inst_x + ',' + inst_y + ')';
    });

  // resize spillover
  //////////////////////////
  // hide spillover from slanted column labels on right side
  svg_group.select('#right_slant_triangle')
    .transition().delay(delays.update).duration(duration)
    .attr('transform', 'translate(' + params.viz.clust.dim.width + ',' +
    params.norm_label.width.col + ')');

  svg_group.select('#left_slant_triangle')
    .transition().delay(delays.update).duration(duration)
    .attr('transform', 'translate(-1,' + params.norm_label.width.col +')');

  svg_group.select('#top_left_white')
    .transition().delay(delays.update).duration(duration)
    .attr('width', params.viz.clust.margin.left)
    .attr('height', params.viz.clust.margin.top);

  svg_group.select('#right_spillover')
    .transition().delay(delays.update).duration(duration)
    .attr('transform', function() {
      var tmp_left = params.viz.clust.margin.left + params.viz.clust.dim.width;
      var tmp_top = params.norm_label.margin.top + params.norm_label.width
        .col;
      return 'translate(' + tmp_left + ',' + tmp_top + ')';
    });

  // white border bottom - prevent clustergram from hitting border
  svg_group.select('#bottom_spillover')
    .transition().delay(delays.update).duration(duration)
    .attr('width', params.viz.svg_dim.width)
    .attr('height', 2 * params.viz.grey_border_width)
    .attr('transform', function() {
      // shift up enough to show the entire border width
      var inst_offset = params.viz.svg_dim.height - 3 * params.viz.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
    });


  // reset zoom and translate
  //////////////////////////////
  params.zoom.scale(1).translate(
      [ params.viz.clust.margin.left, params.viz.clust.margin.top]
  );


}

function update_network(change_view){

  // create a new args object 
  //////////////////////////////////////////

  /*
  The original network_data is stored in this.config and will never be 
  overwritten. In order to update the network I need to 
  
  1. Create new network_data object using the filter value and 
  this.config.network_data. I'll use crossfilter to only select links from the 
  original network_data that are connecting the updated nodes. 

  2. Make new_config object by copying the original config and swapping in the 
  updated network_data object. 

  3. Use new_config to make new_params. With new_params and the updated 
  network_data, I can 
  */

  /////////////////////////////
  // new way 
  /////////////////////////////

  // get copy of old params 
  var old_params = this.params;

  // make new_network_data using immutable copy of network_data
  var new_network_data = filter_network_data(this.config.network_data, change_view); 

  // make Deep copy of this.config object 
  var new_config = jQuery.extend(true, {}, this.config);

  // swap in new_network_data
  new_config.network_data = new_network_data;
  // swap in instantaneous order 
  new_config.inst_order = old_params.viz.inst_order;
  // never switch to expand when updating the matrix 
  new_config.ini_expand = false;
  // ensure that ini_view is not set 
  new_config.ini_view = null;

  // make new params 
  var params = VizParams(new_config);
  var delays = define_enter_exit_delays(old_params, params);

  // ordering - necessary for reordering the function called on button click 
  var reorder = Reorder(params);
  this.reorder = reorder.all_reorder;

  enter_exit_update(params, new_network_data, reorder, delays);

  // update network data in params 
  this.params = params;

  // search functions 
  var gene_search = Search(params, params.network_data.row_nodes, 'name');
  this.get_genes = gene_search.get_entities;
  this.find_gene = gene_search.find_entities;

  // redefine change_group function 
  if (params.viz.show_dendrogram){
    var row_dendrogram = Dendrogram('row', params);
    var col_dendrogram = Dendrogram('col', params);
  }

  function new_change_groups(inst_rc, inst_index) {
      if (inst_rc === 'row') {
        row_dendrogram.change_groups(inst_rc,inst_index);
      } else {
        col_dendrogram.change_groups(inst_rc,inst_index);
      }
  }

  this.change_groups = new_change_groups;

  // initialize screen resizing - necessary for resizing with new params 
  params.initialize_resizing(params);

  // necessary to have zoom behavior updated on updating clustergram 
  d3.select('#main_svg').call(params.zoom);

  // initialize the double click behavior 
  var zoom = Zoom(params);
  zoom.ini_doubleclick();

}

function define_enter_exit_delays(old_params, params){

  // exit, update, enter 

  // check if exit or enter or both are required 
  var old_row_nodes = old_params.network_data.row_nodes;
  var old_col_nodes = old_params.network_data.col_nodes;
  var old_row = _.map(old_row_nodes, function(d){return d.name;});
  var old_col = _.map(old_col_nodes, function(d){return d.name;});
  var all_old_nodes = old_row.concat(old_col);

  var row_nodes = params.network_data.row_nodes;
  var col_nodes = params.network_data.col_nodes;
  var row = _.map(row_nodes, function(d){return d.name;});
  var col = _.map(col_nodes, function(d){return d.name;});
  var all_nodes = row.concat(col);

  var exit_nodes  = _.difference( all_old_nodes, all_nodes ).length;
  var enter_nodes = _.difference( all_nodes, all_old_nodes ).length;

  var delays = {};

  if (exit_nodes > 0){
    delays.update = 1000;
  } else {
    delays.update = 0;
  }

  if (enter_nodes > 0){
    delays.enter = 1000;
  } else {
    delays.enter = 0;
  }

  delays.enter  = delays.enter + delays.update ;

  delays.run_transition = true;

  var old_num_links = old_params.network_data.links.length;
  var new_num_links = params.network_data.links.length;
  var cutoff_num_links = 0.35*params.matrix.def_large_matrix;

  if ( old_num_links > cutoff_num_links || new_num_links > cutoff_num_links ){
    delays.run_transition = false;
    delays.update = 0;
    delays.enter = 0;
  }

  // reduce opacity during update
  d3.select('#main_svg')
    .style('opacity',0.70);

  function finish_update(){
    d3.select('#main_svg')
      .transition().duration(250)
      .style('opacity',1.0);
  }
  setTimeout(finish_update, delays.enter);

  return delays;
}

function enter_exit_update(params, network_data, reorder, delays){

  if (params.matrix.show_tile_tooltips){
    // d3-tooltip - for tiles 
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .direction('n')
      .offset([0, 0])
      .html(params.matrix.make_tile_tooltip);

    d3.select('#clust_group')
      .call(tip);
    }

  // reposition matrix 
  d3.select('#clust_group_container')
    .attr('transform', 'translate(' +
      params.viz.clust.margin.left + ',' +
      params.viz.clust.margin.top + ')');

  // reposition row container 
  d3.select('#row_viz_outer_container')
    .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

  // reposition col container 
  d3.select('#col_label_outer_container')
    .attr('transform', 'translate(0,' + params.norm_label.width.col + ')');

  // reposition col_viz container 
  d3.select('#col_viz_outer_container')
    .attr('transform', function() {
        var inst_offset = params.norm_label.width.col + 2;
        return 'translate(0,' + inst_offset + ')';
      })

  // get row and col names 
  var row_nodes_names = params.network_data.row_nodes_names;
  var col_nodes_names = params.network_data.col_nodes_names;

  var duration = 1000;

  // make global so that names can be accessed
  var row_nodes = network_data.row_nodes;
  var col_nodes = network_data.col_nodes;
  var links = network_data.links;

  //
  var tile_data = links;

  // add name to links for object constancy
  for (var i = 0; i < tile_data.length; i++) {
    var d = tile_data[i];
    tile_data[i].name = row_nodes[d.source].name + '_' + col_nodes[d.target].name;
  }

  function get_key(d){
    return d.name ;
  }

  // exit
  ////////////

  // remove entire rows 
  var exiting_rows = d3.select('#clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .exit();

  if (delays.run_transition){
    exiting_rows
      .transition().duration(duration)
      .style('opacity',0)
      .remove();
  } else {
    exiting_rows
      .style('opacity',0)
      .remove();
  }

  // move rows 
  var move_rows = d3.select('#clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;});

  if (delays.run_transition){
    move_rows
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d){
        var tmp_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,'+params.matrix.y_scale(tmp_index)+')';
      });
  } else {
    move_rows
      .attr('transform', function(d){
        var tmp_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,'+params.matrix.y_scale(tmp_index)+')';
      });
  }

  // update existing rows - enter, exit, update tiles in existing row
  d3.select('#clust_group')
    .selectAll('.row')
    .each(eeu_existing_row);

  // enter exit update tiles  
  function eeu_existing_row(ini_inp_row_data){


    var inp_row_data = ini_inp_row_data.row_data;

    // remove zero values from 
    var row_values = _.filter(inp_row_data, function(num){
      return num.value !=0;
    });

    // bind data to tiles 
    var cur_row_tiles = d3.select(this)
      .selectAll('.tile')
      .data(row_values, function(d){
        // console.log(d.col_name);
        return d.col_name;
      });

    ///////////////////////////
    // Exit 
    ///////////////////////////
    if (delays.run_transition){
      cur_row_tiles
        .exit()
        .transition().duration(300)
        .attr('fill-opacity',0)
        .remove();
    } else {
      cur_row_tiles
        .exit()
        .attr('fill-opacity',0)
        .remove();
    }

    if (params.matrix.tile_type == 'updn'){

      // value split 
      var row_split_data = _.filter(inp_row_data, function(num){
        return num.value_up != 0 || num.value_dn !=0 ;
      });

      // tile_up 
      var cur_tiles_up = d3.select(this)
        .selectAll('.tile_up')
        .data(row_split_data, function(d){return d.col_name;});

      if (delays.run_transition){
        cur_tiles_up
          .exit()
          .transition().duration(300)
          .attr('fill','0')
          .remove();
      } else {
        cur_tiles_up
          .exit()
          .attr('fill',0)
          .remove();
      }

      // tile_dn 
      var cur_tiles_dn = d3.select(this)
        .selectAll('.tile_dn')
        .data(row_split_data, function(d){return d.col_name;});

      if (delays.run_transition){
        cur_tiles_dn
          .exit()
          .transition().duration(300)
          .attr('fill',0)
          .remove();
      } else {
        cur_tiles_dn
          .exit()
          .attr('fill',0)
          .remove();
      }

    }

    ///////////////////////////
    // Update
    ///////////////////////////

    // update tiles in x direction 
    var update_row_tiles = cur_row_tiles
      .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return p.row_name === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });
        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
      });

    if (delays.run_transition){
      update_row_tiles
        .transition().delay(delays.update).duration(duration)
        .attr('width', params.matrix.rect_width)
        .attr('height', params.matrix.rect_height)
        .attr('transform', function(d) {
          if (_.contains(col_nodes_names, d.col_name)){
            var inst_col_index = _.indexOf(col_nodes_names, d.col_name);
            var x_pos = params.matrix.x_scale(inst_col_index) + 0.5*params.viz.border_width; 
            return 'translate(' + x_pos + ',0)';
          }
        });
    } else {
      update_row_tiles
        .attr('width', params.matrix.rect_width)
        .attr('height', params.matrix.rect_height)
        .attr('transform', function(d) {
          if (_.contains(col_nodes_names, d.col_name)){
            var inst_col_index = _.indexOf(col_nodes_names, d.col_name);
            var x_pos = params.matrix.x_scale(inst_col_index) + 0.5*params.viz.border_width; 
            return 'translate(' + x_pos + ',0)';
          }
        });      
    }

    if (params.matrix.tile_type == 'updn'){

      // update split tiles_up
      var update_tiles_up = cur_tiles_up
        .on('mouseover', function(p) {
          // highlight row - set text to active if
          d3.selectAll('.row_label_text text')
            .classed('active', function(d) {
              return p.row_name === d.name;
            });

          d3.selectAll('.col_label_text text')
            .classed('active', function(d) {
              return p.col_name === d.name;
            });
          if (params.matrix.show_tile_tooltips){
            tip.show(p);
          }
        })
        .on('mouseout', function mouseout() {
          d3.selectAll('text').classed('active', false);
          if (params.matrix.show_tile_tooltips){
            tip.hide();
          }
        });

      if (delays.run_transition){
        update_tiles_up
          .transition().delay(delays.update).duration(duration)
          .attr('d', function(d) {
            // up triangle 
            var start_x = 0;
            var final_x = params.matrix.x_scale.rangeBand();
            var start_y = 0;
            var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
            var output_string = 'M' + start_x + ',' + start_y + ', L' +
            start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
            return output_string;
          })  
          .attr('transform', function(d) {
            var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
            var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
            return 'translate(' + x_pos + ','+y_pos+')';
          });
      } else {
        update_tiles_up
          .attr('d', function(d) {
            // up triangle 
            var start_x = 0;
            var final_x = params.matrix.x_scale.rangeBand();
            var start_y = 0;
            var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
            var output_string = 'M' + start_x + ',' + start_y + ', L' +
            start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
            return output_string;
          })  
          .attr('transform', function(d) {
            var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
            var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
            return 'translate(' + x_pos + ','+y_pos+')';
          });
      }

      // update split tiles_dn 
      var update_tiles_dn = cur_tiles_dn 
        .on('mouseover', function(p) {
          // highlight row - set text to active if
          d3.selectAll('.row_label_text text')
            .classed('active', function(d) {
              return p.row_name === d.name;
            });

          d3.selectAll('.col_label_text text')
            .classed('active', function(d) {
              return p.col_name === d.name;
            });
          if (params.matrix.show_tile_tooltips){
            tip.show(p);
          }
        })
        .on('mouseout', function mouseout() {
          d3.selectAll('text').classed('active', false);
          if (params.matrix.show_tile_tooltips){
            tip.hide();
          }
        });

      if (delays.run_transition){
        update_tiles_dn
          .transition().delay(delays.update).duration(duration)
          .attr('d', function(d) {
              // dn triangle 
              var start_x = 0;
              var final_x = params.matrix.x_scale.rangeBand();
              var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
              var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
              var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
              final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
              return output_string;
            })  
            .attr('transform', function(d) {
              var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
              var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
              return 'translate(' + x_pos + ','+y_pos+')';
            });
      } else {
        update_tiles_dn
          .attr('d', function(d) {
            // dn triangle 
            var start_x = 0;
            var final_x = params.matrix.x_scale.rangeBand();
            var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
            var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
            var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
            final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
            return output_string;
          })  
          .attr('transform', function(d) {
            var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
            var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
            return 'translate(' + x_pos + ','+y_pos+')';
          });
      }

      // remove tiles when splitting is done 
      cur_row_tiles
        .selectAll('.tile')
        .each(function(d){
          if ( Math.abs(d.value_up)>0 && Math.abs(d.value_dn)>0 ){
            d3.select(this).remove();
          }
        });
    }


    ///////////////////////////
    // Enter
    ///////////////////////////
    // enter new tiles 
    var new_tiles = cur_row_tiles
      .enter()
      .append('rect')
      .attr('class', 'tile row_tile')
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
      .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return p.row_name === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });
        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
      })
      .attr('fill-opacity',0)
      .attr('transform', function(d){
        var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;

        // if (isNaN(x_pos)){
        //   console.log('\n')
        //   console.log(d.col_name)
        //   console.log(d.pos_x)
        //   console.log(x_pos)
        //   console.log('\n')
        // }

        return 'translate('+x_pos+','+y_pos+')';
      });


    if (delays.run_transition){
      new_tiles
        .transition().delay(delays.enter).duration(duration)
        .style('fill', function(d) {
          return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
        })
        .attr('fill-opacity',function(d){
          var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
          return output_opacity;
        });
    } else {
      new_tiles
        .style('fill', function(d) {
          return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
        })
        .attr('fill-opacity',function(d){
          var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
          return output_opacity;
        });
    }

    // remove new tiles if necessary 
    new_tiles
      .each(function(d){
        if ( Math.abs(d.value_up)>0 && Math.abs(d.value_dn)>0 ){
          d3.select(this).remove();
        }
      });
  
    ////////////////////////////////////////////////////
    // need to add split tiles to existing rows 
    ////////////////////////////////////////////////////




  }


  d3.selectAll('.horz_lines').remove();
  d3.selectAll('.vert_lines').remove();

  // remove row labels 
  d3.selectAll('.row_label_text')
    .data(row_nodes, function(d){ return d.name;})
    .exit()
    .transition().duration(duration)
    .style('opacity',0)
    .remove();

  // remove column labels 
  d3.selectAll('.col_label_click')
    .data(col_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(duration)
    .style('opacity',0)
    .remove();      

  // remove row triangles and colorbars 
  d3.selectAll('.row_viz_group')
    .data(row_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(duration)
    .style('opacity',0)
    .remove();      

  // remove row triangles 
  d3.selectAll('.col_label_text')
    .data(col_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(duration)
    .style('opacity',0)
    .remove();      

  d3.selectAll('.horz_lines')
    .data(row_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(duration)
    .style('opacity',0)
    .remove();

  d3.selectAll('.vert_lines')
    .data(col_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(duration)
    .style('opacity',0)
    .remove();

  // remove dendrogram 
  d3.selectAll('.col_viz_group')
    .data(col_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(duration)
    .style('opacity',0)
    .remove();  

  // resize clust components using appropriate delays 
  resize_after_update(params, row_nodes, col_nodes, links, duration, delays);


  // enter new elements 
  //////////////////////////

  // enter new rows 
  var new_row_groups = d3.select('#clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class','row')
    .attr('transform', function(d) {
      var tmp_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(tmp_index) + ')';
    })  ;

  new_row_groups.each(enter_new_rows);

  // make each row in the clustergrao
  function enter_new_rows(ini_inp_row_data) {

    var inp_row_data = ini_inp_row_data.row_data;

    // remove zero values to make visualization faster
    var row_data = _.filter(inp_row_data, function(num) {
      return num.value !== 0;
    });

    // update tiles 
    ////////////////////////////////////////////
    var tile = d3.select(this)
      .selectAll('rect')
      .data(row_data, function(d){return d.col_name;})
      .enter()
      .append('rect')
      .attr('class', 'tile row_tile')
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
      // switch the color based on up/dn value
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return p.row_name === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
      });
      
    tile
      .style('fill-opacity',0)
      .transition().delay(delays.enter).duration(duration)
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      });

    tile
      .attr('transform', function(d) {
        var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate(' + x_pos + ','+y_pos+')';
      });

    if (params.matrix.tile_type == 'updn'){

      // value split 
      var row_split_data = _.filter(inp_row_data, function(num){
        return num.value_up != 0 || num.value_dn !=0 ;
      });

      // tile_up 
      var new_tiles_up = d3.select(this)
        .selectAll('.tile_up')
        .data(row_split_data, function(d){return d.col_name;})
        .enter()
        .append('path')
        .attr('class','tile_up')
        .attr('d', function(d) {

          // up triangle 
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand();
          var start_y = 0;
          var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;

          var output_string = 'M' + start_x + ',' + start_y + ', L' +
          start_x + ', ' + final_y + ', L' + final_x + ',0 Z';

          return output_string;
        })  
        .attr('transform', function(d) {
          var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
          var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
          return 'translate(' + x_pos + ','+y_pos+')';
        })
        .style('fill', function() {
          return params.matrix.tile_colors[0];
        })
        .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return p.row_name === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });
        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }
      })
      .on('mouseout', function(d) {
        d3.selectAll('text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
      });

      new_tiles_up
        .style('fill-opacity',0)
        .transition().delay(delays.enter).duration(duration)
        .style('fill-opacity',function(d){
          var inst_opacity = 0;
          if (Math.abs(d.value_dn)>0){
            inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_up));
          }
          return inst_opacity;
        });


      // tile_dn 
      var new_tiles_dn = d3.select(this)
        .selectAll('.tile_dn')
        .data(row_split_data, function(d){return d.col_name;})
        .enter()
        .append('path')
        .attr('class','tile_dn')
        .attr('d', function(d) {

          // dn triangle 
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand();
          var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
          var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;

          var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
          final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';

          return output_string;
        })  
        .attr('transform', function(d) {
          var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
          var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
          return 'translate(' + x_pos + ','+y_pos+')';
        })
        .style('fill', function() {
          return params.matrix.tile_colors[1];
        })
        .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return p.row_name === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });
        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }
      })
      .on('mouseout', function(d) {
        d3.selectAll('text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
      });

      new_tiles_dn
        .style('fill-opacity',0)
        .transition().delay(delays.enter).duration(duration)
        .style('fill-opacity',function(d){
          var inst_opacity = 0;
          if (Math.abs(d.value_up)>0){
            inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_dn));
          }
          return inst_opacity;
        })

      // remove tiles when splitting is done 
      tile
        .each(function(d){
          if ( Math.abs(d.value_up)>0 && Math.abs(d.value_dn)>0 ){
            d3.select(this).remove();
          }
        });

    }

  }

  var labels = Labels(params);

  var row_triangle_ini_group = labels.make_rows( params, row_nodes, reorder, duration );
  var container_all_col      = labels.make_cols( params, col_nodes, reorder, duration );

  // Fade in new gridlines 
  ///////////////////////////
  var row_nodes_names = params.network_data.row_nodes_names;
  var col_nodes_names = params.network_data.col_nodes_names;


  // append horizontal lines
  d3.select('#clust_group')
    .selectAll('.horz_lines')
    .data(row_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class','horz_lines')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(inst_index) + ') rotate(0)';
    })
    .append('line')
    .attr('x1',0)
    .attr('x2',params.viz.clust.dim.width)
    .style('stroke-width', params.viz.border_width/params.viz.zoom_switch+'px')
    .style('stroke','white')
    .attr('opacity',0)
    .transition().delay(delays.enter).duration(2*duration)
    .attr('opacity',1);

  // append vertical line groups
  d3.select('#clust_group')
    .selectAll('.vert_lines')
    .data(col_nodes)
    .enter()
    .append('g')
    .attr('class', 'vert_lines')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
    })
    .append('line')
    .attr('x1', 0)
    .attr('x2', -params.viz.clust.dim.height)
    .style('stroke-width', params.viz.border_width + 'px')
    .style('stroke', 'white')
    .attr('opacity',0)
    .transition().delay(delays.enter).duration(2*duration)
    .attr('opacity',1);

}


function filter_network_data(orig_network_data, change_view){
 
  var views = orig_network_data.views;

  console.log(change_view)

  // Get Row Filtering View 
  ///////////////////////////////////////////////////////////////
  if (_.has(change_view,'filter_row')){
    // failsafe if there is only row+col filtering from front-end

    var inst_view = _.find(views, function(d){

      // failsafe from json 
      if (_.has(d, 'filter_row')){
        // filter_row_value is the same as filter_row 
        return d.filter_row == change_view.filter_row;
      } else {
        return d.filt == change_view.filter_row;
      }

    });  

  } else if (_.has(change_view, 'filter_row_value')) {

    // filter row value 
    var inst_view = _.find(views, function(d){

      // failsafe from json 
      return d.filter_row_value == change_view.filter_row_value;

    });  

  } else if (_.has(change_view,'filter_row_sum')) {

    var inst_view = _.find(views, function(d){
      return d.filter_row_sum == change_view.filter_row_sum;
    });

  } else if (_.has(change_view,'filter_row_num')) {

    var inst_view = _.find(views, function(d){
      return d.filter_row_num == change_view.filter_row_num;
    });

  } else if (_.has(change_view, 'N_row_sum')){

    var inst_view = _.find(views, function(d){
      return d.N_row_sum == change_view.N_row_sum;
    });

    if(typeof inst_view === 'undefined'){
        inst_view = views[0];
    };

  }

  console.log('new view')
  console.log(inst_view)

  var new_nodes = inst_view.nodes;

  // get new names of rows and cols 
  var row_names = _.pluck(new_nodes.row_nodes, 'name');
  var col_names = _.pluck(new_nodes.col_nodes, 'name');

  var links = orig_network_data.links;

  var new_links = _.filter(links, function(d){
    var inst_row = d.name.split('_')[0];
    var inst_col = d.name.split('_')[1]; 

    var row_index = _.indexOf(row_names, inst_row);
    var col_index = _.indexOf(col_names, inst_col);

    if ( row_index >-1 & col_index >-1 ){
      // redefine source and target 
      d.source = row_index;
      d.target = col_index;
      return d;
    }
  });

  // set up new_network_data
  var new_network_data = {};
  // rows
  new_network_data.row_nodes = new_nodes.row_nodes;
  new_network_data.row_nodes_names = row_names;
  // cols
  new_network_data.col_nodes = new_nodes.col_nodes;
  new_network_data.col_nodes_names = col_names;
  // links 
  new_network_data.links = new_links;

  // save all links 
  new_network_data.all_links = links;

  // pass on all views 
  new_network_data.views = views;
  
  return new_network_data;

}

/* Represents the entire visualization: labels, dendrogram (optional) and matrix.
 */
function Viz(params) {

  // scope these variables to viz
  var matrix,
  row_dendrogram,
  col_dendrogram,
  zoom_obj,
  params,
  reorder;

  // make viz
  params = make(params);

  /* The main function; makes clustergram based on user arguments.
   */
  function make() {

    var network_data = params.network_data;

    // set local variables from network_data
    var col_nodes = network_data.col_nodes;
    var row_nodes = network_data.row_nodes;

    // Begin Making Visualization
    /////////////////////////////////

    // remove any previous visualizations
    d3.select('#main_svg').remove();

    zoom_obj = params.zoom_obj;

    // initialize svg 
    if ( d3.select('#'+params.viz.svg_div_id).select('svg').empty() ){
      var svg_group = d3.select('#' + params.viz.svg_div_id)
        .append('svg')
        .attr('id', 'main_svg')
        .attr('width',  params.viz.svg_dim.width)
        .attr('height', params.viz.svg_dim.height);
    } else {
      var svg_group = d3.select('#' + params.viz.svg_div_id)
        .select('svg')
        .attr('width',  params.viz.svg_dim.width)
        .attr('height', params.viz.svg_dim.height);
    }

    // add white background 
    svg_group
      .append('rect')
      .attr('id','super_background')
      .style('width', params.viz.svg_dim.width)
      .style('height', params.viz.svg_dim.height)
      .style('fill','white')

    // make the matrix
    /////////////////////////
    matrix = Matrix(network_data, svg_group, params);

    // define reordering object - scoped to viz
    reorder = Reorder(params);

    // define labels object
    var labels = Labels(params);

    var row_triangle_ini_group = labels.make_rows( params, row_nodes, reorder, 0 );
    var container_all_col = labels.make_cols( params, col_nodes, reorder, 0 );


    // add group labels if necessary
    //////////////////////////////////
    if (params.viz.show_dendrogram) {

      // make row dendrogram
      row_dendrogram = Dendrogram('row', params);

      // add class label under column label
      var col_class = container_all_col
      .append('g')
      .attr('id','col_viz_outer_container')
      .attr('transform', function() {
        var inst_offset = params.norm_label.width.col + 2;
        return 'translate(0,' + inst_offset + ')';
      })
      .append('g')
      .attr('id', 'col_viz_zoom_container');

      // make col dendrogram
      col_dendrogram = Dendrogram('col', params);

    }


    // Spillover Divs
    var spillover = Spillover(params, container_all_col);

    // Super Labels
    if (params.labels.super_labels) {
      var super_labels = SuperLabels();
      super_labels.make(params);
    }

    // tmp add final svg border here
    // add border to svg in four separate lines - to not interfere with clicking anything
    ///////////////////////////////////////////////////////////////////////////////////////
    function border_colors() {
      var inst_color = params.viz.super_border_color;
      if (params.viz.expand){
        inst_color = 'white';
      }
      return inst_color;
    }

    // left border
    d3.select('#main_svg')
      .append('rect')
      .attr('id','left_border')
      .attr('class','borders')
      .attr('fill', border_colors) 
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', 'translate(0,0)');

    // right border
    d3.select('#main_svg')
      .append('rect')
      .attr('id','right_border')
      .attr('class','borders')
      .attr('fill', border_colors)
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', function() {
        var inst_offset = params.viz.svg_dim.width - params.viz.grey_border_width;
        return 'translate(' + inst_offset + ',0)';
      });

    // top border
    d3.select('#main_svg')
      .append('rect')
      .attr('id','top_border')
      .attr('class','borders')
      .attr('fill', border_colors)
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
        var inst_offset = 0;
        return 'translate(' + inst_offset + ',0)';
      });

    // bottom border
    d3.select('#main_svg')
      .append('rect')
      .attr('id','bottom_border')
      .attr('class','borders')
      .attr('fill', border_colors)
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
        var inst_offset = params.viz.svg_dim.height - params.viz.grey_border_width;
        return 'translate(0,' + inst_offset + ')';
      });

    ///////////////////////////////////
    // initialize translate vector to compensate for label margins
    params.zoom.translate([params.viz.clust.margin.left, params.viz.clust.margin.top]);

    // initialize screen resizing 
    params.initialize_resizing(params);

    // initialize double click zoom for matrix
    ////////////////////////////////////////////
    zoom_obj.ini_doubleclick();

    if (params.viz.do_zoom) {
      svg_group.call(params.zoom);
    }

    d3.select('#main_svg').on('dblclick.zoom',null);
    
    return params;
  }


  // highlight resource types - set up type/color association
  var gene_search = Search(params, params.network_data.row_nodes, 'name');

  // change opacity
  var opacity_slider = function (inst_slider){

    var max_link = params.matrix.max_link;
    var slider_scale = d3.scale
      .linear()
      .domain([0,1])
      .range([1,0.1]);

    var slider_factor = slider_scale(inst_slider);

    if (params.matrix.opacity_function === 'linear'){
      params.matrix.opacity_scale = d3.scale.linear()
        .domain([0, slider_factor*Math.abs(params.matrix.max_link)])
        .clamp(true)
        .range([0.0, 1.0]);
    } else if (params.matrix.opacity_function === 'log'){
      params.matrix.opacity_scale = d3.scale.log()
        .domain([0.0001, slider_factor*Math.abs(params.matrix.max_link)])
        .clamp(true)
        .range([0.0, 1.0]);
      }

    d3.selectAll('.tile')
      .style('fill-opacity', function(d){
        return params.matrix.opacity_scale(Math.abs(d.value));
      });

  }

  function reset_zoom(inst_scale){
    zoom_obj.two_translate_zoom(params, 0,0,inst_scale);
  }

  return {
    change_groups: function(inst_rc, inst_index) {
      if (inst_rc === 'row') {
        row_dendrogram.change_groups(inst_rc,inst_index);
      } else {
        col_dendrogram.change_groups(inst_rc,inst_index);
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
    two_translate_zoom: zoom_obj.two_translate_zoom,
    // expose all_reorder function
    reorder: reorder.all_reorder,
    search: gene_search,
    opacity_slider: opacity_slider,
    run_reset_visualization_size: run_reset_visualization_size,
    update_network: update_network, 
    params: params,
    draw_gridlines: matrix.draw_gridlines,
    reset_zoom: reset_zoom
  }


}

/* Reordering Module
*/

function Reorder(params){

  /* Reorder the clustergram using the toggle switch
   */
  function all_reorder(inst_order, row_col) {

    params.viz.run_trans = true;
    
    // save order state 
    if (row_col === 'row'){
      params.viz.inst_order.row = inst_order;
    } else if (row_col === 'col'){
      params.viz.inst_order.col = inst_order;
    }

    var row_nodes_obj = params.network_data.row_nodes;
    var row_nodes_names = _.pluck(row_nodes_obj, 'name');

    var col_nodes_obj = params.network_data.col_nodes;
    var col_nodes_names = _.pluck(col_nodes_obj, 'name');

    if (row_col === 'row'){
      // load orders
      if (inst_order === 'ini') {
        params.matrix.x_scale.domain(params.matrix.orders.ini_row);
      } else if (inst_order === 'clust') {
        params.matrix.x_scale.domain(params.matrix.orders.clust_row);
      } else if (inst_order === 'rank') {
        params.matrix.x_scale.domain(params.matrix.orders.rank_row);
      } else if (inst_order === 'class') {
        params.matrix.x_scale.domain(params.matrix.orders.class_row);
      }

    } else if (row_col == 'col') {
      // load orders
      if (inst_order === 'ini') {
        params.matrix.y_scale.domain(params.matrix.orders.ini_col);
      } else if (inst_order === 'clust') {
        params.matrix.y_scale.domain(params.matrix.orders.clust_col);
      } else if (inst_order === 'rank') {
        params.matrix.y_scale.domain(params.matrix.orders.rank_col);
      } else if (inst_order === 'class') {
        params.matrix.x_scale.domain(params.matrix.orders.class_row);
        params.matrix.y_scale.domain(params.matrix.orders.class_col);
      }
    }    

    // only animate transition if there are a small number of tiles
    if (d3.selectAll('.tile')[0].length < params.matrix.def_large_matrix){

      // define the t variable as the transition function
      var t = viz.get_clust_group()
        .transition().duration(2500);

      t.selectAll('.row')
        .attr('transform', function(d) {
          var tmp_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0,' + params.matrix.y_scale(tmp_index) + ')';
          })
        .selectAll('.tile')
        .attr('transform', function(d) {
          return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
        });

      t.selectAll('.tile_up')
        .attr('transform', function(d) {
          return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
        });

      t.selectAll('.tile_dn')
        .attr('transform', function(d) {
          return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
        });

      // Move Row Labels
      d3.select('#row_label_zoom_container').selectAll('.row_label_text')
        .transition().duration(2500)
        .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
        });

      // t.selectAll('.column')
      d3.select('#col_label_zoom_container').selectAll('.col_label_text')
        .transition().duration(2500)
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
        });

      // reorder row_label_triangle groups
      d3.selectAll('.row_viz_group')
        .transition().duration(2500)
        .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
        });

      // reorder col_class groups
      d3.selectAll('.col_viz_group')
        .transition().duration(2500)
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
        });

    } else {

      // define the t variable as the transition function
      var t = viz.get_clust_group();

      // reorder matrix
      t.selectAll('.row')
        .attr('transform', function(d) {
          var tmp_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0,' + params.matrix.y_scale(tmp_index) + ')';
        })
        .selectAll('.tile')
        .attr('transform', function(d) {
          return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
        });

      t.selectAll('.tile_up')
        .attr('transform', function(d) {
          return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
        });

      t.selectAll('.tile_dn')
        .attr('transform', function(d) {
          return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
        });

      // Move Row Labels
      d3.select('#row_label_zoom_container').selectAll('.row_label_text')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
        });

      // t.selectAll('.column')
      d3.select('#col_label_zoom_container').selectAll('.col_label_text')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names,d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
        });

      // reorder row_label_triangle groups
      d3.selectAll('.row_viz_group')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names,d.name);
          return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
        });

      // reorder col_class groups
      d3.selectAll('.col_viz_group')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names,d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
        });

    }

    // redefine x and y positions 
    _.each(params.network_data.links, function(d){
      d.x = params.matrix.x_scale(d.target);
      d.y = params.matrix.y_scale(d.source);
    });

    // rename crossfilter 
    params.cf = {};
    params.cf.links = crossfilter(params.network_data.links);
    params.cf.dim_x = params.cf.links.dimension(function(d){return d.x;});
    params.cf.dim_y = params.cf.links.dimension(function(d){return d.y;}); 

    // backup allow programmatic zoom
    setTimeout(end_reorder, 2500);

  }

  function row_reorder() {

    // get inst row (gene)
    var inst_row = d3.select(this).select('text').text();

    // get row and col nodes
    params.viz.run_trans = true;

    var mat       = params.matrix.matrix;
    var row_nodes = params.network_data.row_nodes;
    var col_nodes = params.network_data.col_nodes;

    var col_nodes_names = _.pluck(col_nodes, 'name');

    // find the index of the row
    var tmp_arr = [];
    _.each(row_nodes, function(node) {
      tmp_arr.push(node.name);
    });

    // find index
    var inst_row = _.indexOf(tmp_arr, inst_row);

    // gather the values of the input genes
    tmp_arr = [];
    _.each(col_nodes, function(node, index) {
      tmp_arr.push( mat[inst_row].row_data[index].value);
    });

    // sort the rows
    var tmp_sort = d3.range(tmp_arr.length).sort(function(a, b) {
      return tmp_arr[b] - tmp_arr[a];
    });

    // resort cols 
    params.matrix.x_scale.domain(tmp_sort);
    
    // reorder matrix
    ////////////////////
    if (params.network_data.links.length > params.matrix.def_large_matrix){

      // define the t variable as the transition function
      var t = viz.get_clust_group();

      // Move Col Labels
      d3.select('#col_label_zoom_container').selectAll('.col_label_text')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ')rotate(-90)';
        });

      // reorder col_class groups
      d3.selectAll('.col_viz_group')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
        });

      setTimeout(end_reorder, 250);
    
    } else {

      // define the t variable as the transition function
      var t = viz.get_clust_group().transition().duration(2500);

      // Move Col Labels
      d3.select('#col_label_zoom_container').selectAll('.col_label_text')
        .transition().duration(2500)
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ')rotate(-90)';
        });

      // reorder col_class groups
      d3.selectAll('.col_viz_group')
        .transition().duration(2500)
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
        })
        .each('end', function() {
          // set running transition to 0
          params.viz.run_trans = false;
        });      
    }

    // reorder matrix
    t.selectAll('.tile')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ',0)';
      });

    t.selectAll('.tile_up')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ',0)';
      }); 

    t.selectAll('.tile_dn')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ',0)';
      });  


    // highlight selected column
    ///////////////////////////////
    // unhilight and unbold all columns (already unbolded earlier)
    d3.selectAll('.row_label_text')
      .select('rect')
      .style('opacity', 0);
    // highlight column name
    d3.select(this)
      .select('rect')
      .style('opacity', 1);

    reposition_tile_highlight();

    // redefine x and y positions 
    _.each(params.network_data.links, function(d){
      d.x = params.matrix.x_scale(d.target);
      d.y = params.matrix.y_scale(d.source);
    });

    // rename crossfilter 
    params.cf = {};
    params.cf.links = crossfilter(params.network_data.links);
    params.cf.dim_x = params.cf.links.dimension(function(d){return d.x;});
    params.cf.dim_y = params.cf.links.dimension(function(d){return d.y;}); 


    // backup allow programmatic zoom
    setTimeout(end_reorder, 2500);
  }

  function col_reorder(){
    // set running transition value
    params.viz.run_trans = true;

    var mat       = params.matrix.matrix;
    var row_nodes = params.network_data.row_nodes;
    var col_nodes = params.network_data.col_nodes;

    var row_nodes_names = _.pluck(row_nodes, 'name');

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
      tmp_arr.push( mat[index].row_data[inst_col].value);
    });

    // sort the cols
    var tmp_sort = d3.range(tmp_arr.length).sort(function(a, b) {
      return tmp_arr[b] - tmp_arr[a];
    });


    // resort cols
    ////////////////////////////
    params.matrix.y_scale.domain(tmp_sort);

    // reorder
    if (params.network_data.links.length > params.matrix.def_large_matrix){
      var t = viz.get_clust_group();

      // reorder row_label_triangle groups
      d3.selectAll('.row_viz_group')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
        });

      // Move Row Labels
      d3.select('#row_label_zoom_container').selectAll('.row_label_text')
        .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
        });

    } else {

      var t = viz.get_clust_group().transition().duration(2500);

      // reorder row_label_triangle groups
      d3.selectAll('.row_viz_group')
        .transition().duration(2500)
        .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
        });

      // Move Row Labels
      d3.select('#row_label_zoom_container').selectAll('.row_label_text')
        .transition().duration(2500)
        .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
        });        
    }

    // reorder matrix rows 
    t.selectAll('.row')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      });


    // highlight selected column
    ///////////////////////////////
    // unhilight and unbold all columns (already unbolded earlier)
    d3.selectAll('.col_label_text')
      .select('.highlight_rect')
      .style('opacity', 0);
    // highlight column name
    d3.select(this)
      .select('.highlight_rect')
      .style('opacity', 1);

    // redefine x and y positions 
    _.each(params.network_data.links, function(d){
      d.x = params.matrix.x_scale(d.target);
      d.y = params.matrix.y_scale(d.source);
    });

    // rename crossfilter 
    params.cf = {};
    params.cf.links = crossfilter(params.network_data.links);
    params.cf.dim_x = params.cf.links.dimension(function(d){return d.x;});
    params.cf.dim_y = params.cf.links.dimension(function(d){return d.y;}); 

    reposition_tile_highlight();

    // backup allow programmatic zoom
    setTimeout(end_reorder, 2500);
  }

  // allow programmatic zoom after reordering
  function end_reorder() {
    params.viz.run_trans = false;
  }

  // reposition tile highlight
  function reposition_tile_highlight(){
    // resize click hlight
    var rel_width_hlight = 6;
    var opacity_hlight = 0.85;

    var hlight_width = rel_width_hlight*params.viz.border_width;
    var hlight_height = rel_width_hlight*params.viz.border_width/params.viz.zoom_switch;
    // reposition tile highlight
    ////////////////////////////////

    // top highlight
    d3.select('#top_hlight')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', hlight_height)
      .transition().duration(2500)
      .attr('transform', function() {
        return 'translate(' + params.matrix.x_scale(params.matrix.click_hlight_x) + ',0)';
      });

    // left highlight
    d3.select('#left_hlight')
      .attr('width', hlight_width)
      .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
      .transition().duration(2500)
      .attr('transform', function() {
        return 'translate(' + params.matrix.x_scale(params.matrix.click_hlight_x) + ','+
          hlight_height*0.99+')';
      });

    // right highlight
    d3.select('#right_hlight')
      .attr('width', hlight_width)
      .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
      .transition().duration(2500)
      .attr('transform', function() {
        var tmp_translate = params.matrix.x_scale(params.matrix.click_hlight_x) + params.matrix.x_scale.rangeBand() - hlight_width;
        return 'translate(' + tmp_translate + ','+
          hlight_height*0.99+')';
      });

    // bottom highlight
    d3.select('#bottom_hlight')
      .attr('width', function(){
        return params.matrix.x_scale.rangeBand() - 1.98*hlight_width})
      .attr('height', hlight_height)
      .transition().duration(2500)
      .attr('transform', function() {
        var tmp_translate_x = params.matrix.x_scale(params.matrix.click_hlight_x) + hlight_width*0.99;
        var tmp_translate_y = params.matrix.y_scale.rangeBand() - hlight_height;
        return 'translate(' + tmp_translate_x + ','+
          tmp_translate_y+')';
      });

  }

  return {
    row_reorder: row_reorder,
    col_reorder: col_reorder,
    all_reorder: all_reorder
  };

}



function Zoom(params){

  /* Functions for zooming. Should be turned into a module.
   * ----------------------------------------------------------------------- */
  function zoomed() {

    // // reset the zoom translate and zoom
    // params.zoom.scale(zoom_y);
    // params.zoom.translate([pan_dx, net_y_offset]);

    var zoom_x = d3.event.scale,
      zoom_y = d3.event.scale,
      trans_x = d3.event.translate[0] - params.viz.clust.margin.left,
      trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

    // apply transformation
    apply_transformation(params, trans_x, trans_y, zoom_x, zoom_y);
  }

  function apply_transformation(params, trans_x, trans_y, zoom_x, zoom_y) {

    var d3_scale = zoom_x;

    // y - rules
    ///////////////////////////////////////////////////
    // available panning room in the y direction
    // multiple extra room (zoom - 1) by the width
    // always defined in the same way
    var pan_room_y = (d3_scale - 1) * params.viz.clust.dim.height;

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
    if (d3_scale < params.viz.zoom_switch) {
      // no x translate or zoom
      trans_x = 0;
      zoom_x = 1;
    }
    // zoom in both directions
    // scale is greater than params.viz.zoom_switch
    else {
      // available panning room in the x direction
      // multiple extra room (zoom - 1) by the width
      var pan_room_x = (d3_scale / params.viz.zoom_switch - 1) * params.viz.clust.dim.width;

      // no panning in the positive direction
      if (trans_x > 0) {
        // restrict transformation parameters
        // no panning in the x direction
        trans_x = 0;
        // set zoom_x
        zoom_x = d3_scale / params.viz.zoom_switch;
      }
      // restrict panning to pan_room_x
      else if (trans_x <= -pan_room_x) {
        // restrict transformation parameters
        // no panning in the x direction
        trans_x = -pan_room_x;
        // set zoom_x
        zoom_x = d3_scale / params.viz.zoom_switch;
      }
      // allow two dimensional panning
      else {
        // restrict transformation parameters
        // set zoom_x
        zoom_x = d3_scale / params.viz.zoom_switch;
      }
    }

    // update visible links 
    var min_rect_height = 3;

    // apply transformation and reset translate vector
    // the zoom vector (zoom.scale) never gets reset
    ///////////////////////////////////////////////////
    // translate clustergram
    // viz.get_clust_group()
    d3.select('#clust_group')
      .attr('transform', 'translate(' + [trans_x, trans_y] + ') scale(' +
      zoom_x + ',' + zoom_y + ')');

    // transform row labels
    d3.select('#row_label_zoom_container')
      .attr('transform', 'translate(' + [0, trans_y] + ') scale(' + zoom_y +
      ')');

    // transform row_viz_zoom_container
    // use the offset saved in params, only zoom in the y direction
    d3.select('#row_viz_zoom_container')
      .attr('transform', 'translate(' + [0, trans_y] + ') scale( 1,' +
      zoom_y + ')');

    // transform col labels
    // move down col labels as zooming occurs, subtract trans_x - 20 almost works
    d3.select('#col_label_zoom_container')
      .attr('transform', 'translate(' + [trans_x, 0] + ') scale(' + zoom_x +
      ')');

    // transform col_class
    d3.select('#col_viz_zoom_container')
      .attr('transform', 'translate(' + [trans_x, 0] + ') scale(' + zoom_x +
      ',1)');

    // reset translate vector - add back margins to trans_x and trans_y
    params.zoom
      .translate([trans_x + params.viz.clust.margin.left, trans_y + params.viz.clust.margin.top
      ]);

    var trans = false;
    constrain_font_size(params, trans);


    // resize label bars if necessary
    ////////////////////////////////////

    if (Utils.has( params.network_data.row_nodes[0], 'value')) {
      d3.selectAll('.row_bars')
      .attr('width', function(d) {
        var inst_value = 0;
        inst_value = params.labels.bar_scale_row(Math.abs(d.value))/zoom_y;
        return inst_value;
      })
      .attr('x', function(d) {
        var inst_value = 0;
        inst_value = -params.labels.bar_scale_row(Math.abs(d.value))/zoom_y;
        return inst_value;
      });
    }

    if (Utils.has( params.network_data.col_nodes[0], 'value')) {
      d3.selectAll('.col_bars')
        .attr('width', function(d) {
          var inst_value = 0;
          if (d.value > 0){
            inst_value = params.labels.bar_scale_col(d.value)/zoom_x;
          }
          return inst_value;
        })
      }

  }

  function two_translate_zoom(params, pan_dx, pan_dy, fin_zoom) {

    // get parameters
    if (!params.viz.run_trans) {

      // define the commonly used variable half_height
      var half_height = params.viz.clust.dim.height / 2;

      // y pan room, the pan room has to be less than half_height since
      // zooming in on a gene that is near the top of the clustergram also causes
      // panning out of the visible region
      var y_pan_room = half_height / params.viz.zoom_switch;

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
        // pan_dy = half_height - (half_height)/params.viz.zoom_switch

        // if pan_dy is greater than the pan room, then panning has to be restricted
        // start by shifting back up (negative) by half_height/params.viz.zoom_switch then shift back down
        // by the difference between half_height and pan_dy (so that the top of the clustergram is
        // visible)
        var shift_top_viz = half_height - pan_dy;
        var shift_up_viz = -half_height / params.viz.zoom_switch +
          shift_top_viz;

        // reduce pan_dy so that the visualization does not get panned to far down
        pan_dy = pan_dy + shift_up_viz;
      }

      // prevent visualization from panning up too much
      // when zooming into genes at the bottom of the clustergram
      if (pan_dy < -(half_height - y_pan_room)) {

        shift_top_viz = half_height + pan_dy;

        shift_up_viz = half_height / params.viz.zoom_switch - shift_top_viz; //- move_up_one_row;

        // reduce pan_dy so that the visualization does not get panned to far down
        pan_dy = pan_dy + shift_up_viz;

      }

      // will improve this !!
      var zoom_y = fin_zoom;
      var zoom_x;
      if (fin_zoom <= params.viz.zoom_switch){
        var zoom_x = 1;
      } else {
        var zoom_x = fin_zoom/params.viz.zoom_switch;
      }

      // search duration - the duration of zooming and panning
      var search_duration = 700;

      // center_y
      var center_y = -(zoom_y - 1) * half_height;

      // transform clust group
      ////////////////////////////
      // d3.select('#clust_group')
      viz.get_clust_group()
        .transition().duration(search_duration)
        // first apply the margin transformation
        // then zoom, then apply the final transformation
        .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
        ' scale(' + zoom_x + ',' + zoom_y + ')' + 'translate(' + [pan_dx,
          pan_dy
        ] + ')');

      // transform row labels
      d3.select('#row_label_zoom_container')
        .transition()
        .duration(search_duration)
        .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
        zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

      // transform row_viz_zoom_container
      // use the offset saved in params, only zoom in the y direction
      d3.select('#row_viz_zoom_container')
        .transition()
        .duration(search_duration)
        .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
        1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

      // transform col labels
      d3.select('#col_label_zoom_container')
        .transition()
        .duration(search_duration)
        .attr('transform', ' scale(' + zoom_x + ',' + zoom_x + ')' + 'translate(' + [
          pan_dx, 0
        ] + ')');

      // transform col_class
      d3.select('#col_viz_zoom_container')
        .transition()
        .duration(search_duration)
        .attr('transform', ' scale(' + zoom_x + ',' + 1 + ')' + 'translate(' + [
          pan_dx, 0
        ] + ')');

      // set y translate: center_y is positive, positive moves the visualization down
      // the translate vector has the initial margin, the first y centering, and pan_dy
      // times the scaling zoom_y
      var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;

      // reset the zoom translate and zoom
      params.zoom.scale(zoom_y);
      params.zoom.translate([pan_dx, net_y_offset]);

      var trans = true;
      constrain_font_size(params, trans);

      // re-size of the highlighting rects
      /////////////////////////////////////////
      d3.select('#row_label_zoom_container')
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
            .attr('height', params.matrix.y_scale.rangeBand())
            .style('fill', 'yellow');
        });


      // column value bars
      ///////////////////////
      // reduce the height of the column value bars based on the zoom applied
      // recalculate the height and divide by the zooming scale
      // col_label_obj.select('rect')
      if (Utils.has( params.network_data.col_nodes[0], 'value')) {

        d3.selectAll('.col_bars')
          .transition()
          .duration(search_duration)
          .attr('width', function(d) {
          var inst_value = 0;
          if (d.value > 0){
            inst_value = params.labels.bar_scale_col(d.value)/zoom_x;
          }
          return inst_value;
        })
        }

      if (Utils.has( params.network_data.row_nodes[0], 'value')) {

        d3.selectAll('.row_bars')
          .transition()
          .duration(search_duration)
          .attr('width', function(d) {
          var inst_value = 0;
          inst_value = params.labels.bar_scale_row(Math.abs(d.value))/zoom_y;
          return inst_value;
        })
        .attr('x', function(d) {
          var inst_value = 0;
          inst_value = -params.labels.bar_scale_row(Math.abs(d.value))/zoom_y;
          return inst_value;
        });

      }
    }
  }

  function update_viz_links(params, trans_x, trans_y, zoom_x, zoom_y, trans){

    // get translation vector absolute values 
    var buffer = 1;
    var min_x = Math.abs(trans_x)/zoom_x - buffer*params.matrix.x_scale.rangeBand() ;
    var min_y = Math.abs(trans_y)/zoom_y - buffer*params.matrix.y_scale.rangeBand() ;

    var max_x = Math.abs(trans_x)/zoom_x + params.viz.clust.dim.width/zoom_x ;
    // var max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height ; 
    var max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height/zoom_y ; 

    // show the full height of the clustergram if force_square 
    if (params.viz.force_square || trans) {
      max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height;       
    }

    if (min_x < 0){
      min_x = 0;
    }
    if (min_y < 0){
      min_y = 0;  
    }

    // test-filter 
    params.cf.dim_x.filter([min_x,max_x]);
    params.cf.dim_y.filter([min_y,max_y]);

    // redefine links 
    var inst_links = params.cf.dim_x.top(Infinity);

    return inst_links;
  }

  function constrain_font_size(params, trans){

    if (trans){
      var trans_time = 700;
    } else {
      var trans_time = 0;
    }

    var fraction_keep = {};

    var keep_width = {};
    keep_width.row = params.bounding_width_max.row*params.labels.row_keep
      *params.zoom.scale();
    keep_width.col = params.bounding_width_max.col*params.labels.col_keep
      *params.zoom.scale()/params.viz.zoom_switch;

    function normal_name(d){
      var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
      if (inst_name.length > params.labels.max_label_char){
        inst_name = inst_name.substring(0,params.labels.max_label_char)+'..';
      }
      return inst_name;
    }

    if (keep_width.row > params.norm_label.width.row) {

      params.viz.zoom_scale_font.row = params.norm_label.width.row / keep_width.row;
      // params.viz.zoom_scale_font.row = params.norm_label.width.row / keep_width.row;

      d3.selectAll('.row_label_text').each(function() {
        if (trans){

          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_row * params.viz.zoom_scale_font.row + 'px')
            .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35*params.viz.zoom_scale_font.row )
            .style('opacity',0.20).transition().duration(700)
            .style('opacity',1);

        } else {

          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_row * params.viz.zoom_scale_font.row + 'px')
            .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35*params.viz.zoom_scale_font.row );
        }
      });
    } else {

      d3.selectAll('.row_label_text').each(function() {
        if (trans){

          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_row + 'px')
            // do not scale by params.viz.zoom_scale_font.row, since this is 1
            .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

          d3.select(this).select('text')
            .text(function(d){ return normal_name(d);})
            .style('opacity',0.20).transition().duration(700)
            .style('opacity',1);

        } else {

          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_row + 'px')
            .text(function(d){ return normal_name(d);});

        }
      });
    }


    if (keep_width.col > params.norm_label.width.col) {

      params.viz.zoom_scale_font.col = params.norm_label.width.col / keep_width.col;

      d3.selectAll('.col_label_click').each(function() {
        if (trans){
          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_col *
              params.viz.zoom_scale_font.col + 'px')
            .style('opacity',0.20).transition().duration(700)
            .style('opacity',1);
        } else {
          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_col *
              params.viz.zoom_scale_font.col + 'px')
        }
      });
    } else {
      d3.selectAll('.col_label_click').each(function() {
        if (trans){
          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_col + 'px');
          d3.select(this).select('text')
            .text(function(d){ return normal_name(d);})
            .style('opacity',0.20).transition().duration(700)
            .style('opacity',1);
        } else {
          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_col + 'px')
            .text(function(d){ return normal_name(d);});
        }
      });
    }


    var max_row_width = params.norm_label.width.row;
    var max_col_width = params.norm_label.width.col;

    // constrain text after zooming
    if (params.labels.row_keep < 1){
      d3.selectAll('.row_label_text' ).each(function() { trim_text(this, 'row'); });
    }
    if (params.labels.col_keep < 1){
      d3.selectAll('.col_label_click').each(function() { trim_text(this, 'col'); });
    }



  }

  function ini_doubleclick(){

    // disable double-click zoom: double click should reset zoom level
    d3.selectAll('svg').on('dblclick.zoom', null);

    // double click to reset zoom - add transition
    d3.select('#main_svg')
      .on('dblclick', function() {
        // programmatic zoom reset
        two_translate_zoom(params, 0, 0, 1);
      });
  }

function downsample(params, min_rect_height){
  // console.log('downsampling')

  var ini_num_rows = params.network_data.row_nodes.length;

  // calc the increase in rect size required 
  // first get the current size of the rectangle 
  var ini_rect_height = d3.select('.tile').attr('height');
  var reduce_by = 2*min_rect_height/ini_rect_height;

  var col_nodes = params.network_data.col_nodes;

  var new_num_rows = ini_num_rows/reduce_by;

  // console.log('\n\nini num rows '+String(ini_num_rows));
  // console.log('new_num_rows '+String(new_num_rows))

  // get cluster height
  var clust_height = params.viz.clust.dim.height;
  // initialize scale
  var y_scale = d3.scale.ordinal().rangeBands([0,clust_height]);
  // define domain 
  y_scale.domain(_.range(new_num_rows));

  // get new rangeBand to calculate new y position 
  var tile_height = y_scale.rangeBand();

  var ini_tile_height = params.matrix.y_scale.rangeBand();

  var increase_ds = 1; // 0.25*reduce_by;

  var ds_factor = ini_tile_height/tile_height * increase_ds;

  // get data from global_network_data
  var links_in_view = params.network_data.links;

  // use crossfilter to calculate new links 

  // load data into crossfilter  
  var cfl = crossfilter(links_in_view);

  // downsample dimension - define the key that will be used to do the reduction
  var dim_ds = cfl.dimension(function(d){
    // merge together rows into a smaller number of rows 
    var row_num = Math.floor(d.y/tile_height);
    var col_name = col_nodes[d.target].name;
    var inst_key = 'row_'+row_num + '_' + col_name;
    return inst_key;
  })

  // define reduce functions 
  function reduceAddAvg(p,v) {
    ++p.count
    if (v.value > 0){
      p.sum_up += v.value;
    } else {
      p.sum_dn += v.value;
    }
    p.value_up = p.sum_up/p.count;
    p.value_dn = p.sum_dn/p.count;

    // make new row name 
    p.name = 'row_'+ String(Math.floor(v.y/tile_height)) + '_' + col_nodes[v.target].name;

    p.source = Math.floor(v.y/tile_height);
    p.target = v.target;
    return p;
  }
  function reduceRemoveAvg(p,v) {
    --p.count
    if (v.value > 0){
      p.sum_up -= v.value;
    } else {
      p.sum_dn -= v.value;
    }
    p.value_up = p.sum_up/p.count;
    p.value_dn = p.sum_dn/p.count;

    p.name = 'no name';
    p.target = 0;
    p.source = 0;
    return p;
  }
  function reduceInitAvg() {
    return {count:0, sum_up:0, sum_dn:0, avg:0, name:'',source:0,target:0};
  }

  // gather tmp version of new links 
  var tmp_red = dim_ds
                .group()
                .reduce(reduceAddAvg, reduceRemoveAvg, reduceInitAvg)
                .top(Infinity);

  // initialize array of new_links
  var new_links = [];

  // gather data from reduced sum 
  new_links = _.pluck(tmp_red, 'value');

  // add new tiles 
  /////////////////////////

  // exit old elements 
  d3.selectAll('.tile')
    .data(new_links, function(d){
      return d.name;
    })
    .exit()
    .remove();

  // d3.selectAll('.horz_lines').remove();

  // define compound color scale 
  var color_scale = d3.scale.linear().domain([-1,1])
    .range([params.matrix.tile_colors[1], params.matrix.tile_colors[0]]);

  // enter new elements 
  //////////////////////////
  d3.select('#clust_group')
    .selectAll('.tile')
    .data(new_links, function(d){return d.name;})
    .enter()
    .append('rect')
    .style('fill-opacity',0)
    .attr('class','tile ds_tile')
    .attr('width', params.matrix.rect_width)
    .attr('height', tile_height)
    .attr('transform', function(d) {
      return 'translate(' + params.matrix.x_scale(d.target) + ','+y_scale(d.source)+')';
    })
    .style('fill', function(d) {
      // return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      var abs_val_up = Math.abs(d.value_up);
      var abs_val_dn = Math.abs(d.value_dn);
      var inst_value = (abs_val_up - abs_val_dn) / (abs_val_up + abs_val_dn);

      return color_scale(inst_value);
    })
    .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var val_updn = Math.abs(d.sum_up)+Math.abs(d.sum_dn);
        var output_opacity = params.matrix.opacity_scale(val_updn*ds_factor);
        return output_opacity;
    });

}


  return {
    zoomed : zoomed,
    two_translate_zoom : two_translate_zoom,
    ini_doubleclick : ini_doubleclick
  }
}

/* Main program
 * ----------------------------------------------------------------------- */

// consume and validate user input
// build giant config object
// visualize based on config object
// handle user events

// consume and validate user arguments, produce configuration object 
var config = Config(args);

// deepcopy
var config_copy = jQuery.extend(true, {}, config);

// make visualization parameters using configuration object 
var params = VizParams(config_copy);

// make visualization using parameters  
var viz = Viz(params);


/* API
 * ----------------------------------------------------------------------- */

return {
    find_gene: viz.search.find_entities,
    get_genes: viz.search.get_entities,
    change_groups: viz.change_groups,
    reorder: viz.reorder,
    opacity_slider: viz.opacity_slider,
    opacity_function: viz.opacity_function,
    resize: viz.run_reset_visualization_size,
    update_network: viz.update_network,
    params: viz.params,
    reset_zoom: viz.reset_zoom,
    config: config
};
	
}
