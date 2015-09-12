/* d3_clustergram 1.0
 * Nick Fernandez, Ma'ayan Lab, Icahn School of Medicine at Mount Sinai
 * (c) 2015
 */
function d3_clustergram(args) {
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
    col_overflow: 1,
    row_overflow: 1,
    row_label_scale: 1,
    col_label_scale: 1,
    super_labels: false,

    // matrix options 
    transpose: false,
    tile_colors: ['#FF0000', '#1C86EE'],
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
    // Gray border around the visualization
    grey_border_width: 3,
    // the distance between labels and clustergram
    // a universal margin for the clustergram
    uni_margin: 4,
    // force the visualization to be square 
    force_square:0
  };

  // Mixin defaults with user-defined arguments.
  config = Utils.extend(defaults, args);

  // save network_data to config 
  // extend does not properly pass network_data 
  config.network_data = args.network_data;

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

  // initialize cluster ordering 
  if (!Utils.is_undefined(args.order) && is_supported_order(args.order)) {
    config.inst_order = args.order;
  } else {
    config.inst_order = 'clust';
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
    return order === 'clust' || order === 'rank' || order === 'class';
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
function Dendrogram(type, params, elem) {

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
    for (i = 0; i < Colors.get_num_colors(); i++) {
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
  function change_groups(inst_index) {
    d3.selectAll('.' + dom_class)
      .style('fill', function(d) {
        return group_colors[d.group[inst_index]];
      });
  }

  function color_group(j) {
    return group_colors[j];
  }

  function get_group_color(j) {
    return group_colors[j];
  }

  function build_row_dendro() {
    elem
      .append('rect')
      .attr('class', dom_class)
      .attr('width', function() {
        var inst_width = params.class_room.symbol_width - 1;
        return inst_width + 'px';
      })
      .attr('height', params.matrix.y_scale.rangeBand())
      .style('fill', function(d) {
        var inst_level = params.group_level.row;
        return get_group_color(d.group[inst_level]);
      })
      .attr('x', function() {
        var inst_offset = params.class_room.symbol_width + 1;
        return inst_offset + 'px';
      });
  }

  function build_col_dendro() {
    elem
      .append('rect')
      .attr('class', dom_class)
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', function() {
        var inst_height = params.class_room.col - 1;
        return inst_height;
      })
      .style('fill', function(d) {
        var inst_level = params.group_level.col;
        return get_group_color(d.group[inst_level]);
      });
  }

  // add callback functions 
  /////////////////////////////
  
  // !! optional row callback on click
  if (typeof params.click_group === 'function') {
    // only add click functionality to row rect
    row_class_rect
      .on('click', function(d) {
        var inst_level = params.group_level.row;
       var inst_group = d.group[inst_level];
        // find all row names that are in the same group at the same group_level
        // get row_nodes
        row_nodes = params.network_data.row_nodes;
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

  // make the matrix 
  initialize_matrix();

  // append a group that will hold clust_group and position it once
  clust_group = svg_elem
    .append('g')
    .attr('transform', 'translate(' +
      params.viz.clust.margin.left + ',' +
      params.viz.clust.margin.top + ')')
    .append('g')
    .attr('id', 'clust_group');

  // clustergram background rect 
  clust_group
    .append('rect')
    .attr('class', 'background')
    .attr('id', 'grey_background')
    .style('fill', '#eee')
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);

  // do the databind 
  var row_groups = clust_group.selectAll('.row')
    .data(matrix)
    .enter()
    .append('g')
    .attr('class', 'row')
    .attr('transform', function(d, index) {
      return 'translate(0,' + params.matrix.y_scale(index) + ')';
    });

  // draw rows of clustergram 
  if (params.matrix.tile_type === 'simple') {
    row_groups = row_groups.each(draw_simple_rows);
  } else {
    row_groups = row_groups.each(draw_group_rows);
  }

  // draw grid lines after drawing tiles 
  draw_grid_lines();

  function initialize_matrix() {
    _.each(row_nodes, function(tmp, row_index) {
    matrix[row_index] = d3.range(col_nodes.length).map(function(col_index) {
      return {
      pos_x: col_index,
      pos_y: row_index,
      value: 0
      };
    });
    });

    _.each(network_data.links, function(link) {
      matrix[link.source][link.target].value = link.value;
      // transfer additional link information is necessary
      if (link.value_up && link.value_dn) {
        matrix[link.source][link.target].value_up = link.value_up;
        matrix[link.source][link.target].value_dn = link.value_dn;
      }
      if (link.highlight) {
        matrix[link.source][link.target].highlight = link.highlight;
      }
      if (link.info) {
        matrix[link.source][link.target].info = link.info;
      }
    });

    return matrix;
  }

  function draw_grid_lines() {

    // append horizontal lines 
    clust_group
      .selectAll('.horz_lines')
      .data(row_nodes)
      .enter()
      .append('g')
      .attr('class','horz_lines')
      .attr('transform', function(d, index) {
          return 'translate(0,' + params.matrix.y_scale(index) + ') rotate(0)';
      })
      .append('line')
      .attr('x1',0)
      .attr('x2',params.viz.clust.dim.width)
      .style('stroke-width', params.viz.border_width/params.viz.zoom_switch+'px')
      .style('stroke','white')

    // append vertical line groups
    clust_group
      .selectAll('.vert_lines')
      .data(col_nodes)
      .enter()
      .append('g')
      .attr('class', 'vert_lines')
      .attr('transform', function(d, index) {
          return 'translate(' + params.matrix.x_scale(index) + ') rotate(-90)';
      })
      .append('line')
      .attr('x1', 0)
      .attr('x2', -params.viz.clust.dim.height)
      .style('stroke-width', params.viz.border_width + 'px')
      .style('stroke', 'white');
  }

  // make each row in the clustergram
  function draw_simple_rows(inp_row_data) {

    // remove zero values to make visualization faster
    var row_data = _.filter(inp_row_data, function(num) {
      return num.value !== 0;
    });

    // generate tiles in the current row
    var tile = d3.select(this)
      // data join
      .selectAll('rect')
      .data(row_data)
      .enter()
      .append('rect')
      .attr('class', 'tile')
      .attr('transform', function(d) {
      return 'translate(' + params.matrix.x_scale(d.pos_x) + ',0)';
      })
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', params.matrix.y_scale.rangeBand() * 0.98)
      .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
      return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function(d) {
      return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
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
      });
    }

    // append title to group
    if (params.matrix.tile_title) {
      tile
      .append('title')
      .text(function(d) {
        var inst_string = 'value: ' + d.value;
        return inst_string;
      });
    }
  }

  // make each row in the clustergram
  function draw_group_rows(inp_row_data) {

    // remove zero values to make visualization faster
    var row_data = _.filter(inp_row_data, function(num) {
      return num.value !== 0;
    });

    // generate groups
    var tile = d3.select(this)
      // data join
      .selectAll('g')
      .data(row_data)
      .enter()
      .append('g')
      .attr('class', 'tile')
      .attr('transform', function(d) {
      return 'translate(' + params.matrix.x_scale(d.pos_x) + ',0)';
      });

    // append rect
    tile
      .append('rect')
      // .attr('class','tile')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', params.matrix.y_scale.rangeBand() * 0.98)
      .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
      if (Math.abs(d.value_up) > 0 && Math.abs(d.value_dn) > 0) {
        output_opacity = 0;
      }
      return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function(d) {
      // normal rule
      return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
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
    if (params.matrix.highlight === 1) {
      // console.log(row_data[0])
      tile
      .append('rect')
      .attr('width', params.matrix.x_scale.rangeBand() * 0.80)
      .attr('height', params.matrix.y_scale.rangeBand() * 0.80)
      .attr('class', 'highlighting_rect')
      .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 10 +
      ' , ' + params.matrix.y_scale.rangeBand() / 10 + ')')
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
      });
    }


    // split-up
    tile
      .append('path')
      .style('stroke', 'black')
      .style('stroke-width', 0)
      .attr('d', function() {
      var start_x = 0;
      var final_x = params.matrix.x_scale.rangeBand();
      var start_y = 0;
      var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /
        60;
      var output_string = 'M' + start_x + ',' + start_y + ', L' +
        start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
      return output_string;
      })
      .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = 0;
      if (Math.abs(d.value_dn) > 0) {
        output_opacity = params.matrix.opacity_scale(Math.abs(d.value_up));
      }
      return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function() {
        // rl_t (released) blue
        return params.matrix.tile_colors[0];
      });


    // split-dn
    tile
      .append('path')
      .style('stroke', 'black')
      .style('stroke-width', 0)
      .attr('d', function() {
      var start_x = 0;
      var final_x = params.matrix.x_scale.rangeBand();
      var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /
        60;
      var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /
        60;
      var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
        final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
      return output_string;
      })
      .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = 0;
      if (Math.abs(d.value_up) > 0) {
        output_opacity = params.matrix.opacity_scale(Math.abs(d.value_dn));
      }
      return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function() {
      // rl_f (not released) orange
      return params.matrix.tile_colors[1];
      });

    // append title to group
    if (params.matrix.tile_title) {
      tile
      .append('title')
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
    viz.two_translate_zoom(0, pan_dy, params.viz.zoom_switch);
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
/* VizParams Module 
*/
function VizParams(config){

  var params = initialize_visualization(config)

  // console.log(params)

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
    params.viz.show_dendrogram = config.show_dendrogram;

    // initial order of clustergram 
    params.viz.inst_order = config.inst_order;

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
    var spillover_x_offset = label_scale(col_max_char) * 0.8 * params.col_label_scale;

    // get height and width from parent div
    params.viz.svg_dim = {};
    params.viz.svg_dim.width  = Number(d3.select('#' + params.viz.svg_div_id).style('width').replace('px', ''));
    params.viz.svg_dim.height = Number(d3.select('#' + params.viz.svg_div_id).style('height').replace('px', ''));



    // reduce width by row/col labels and by grey_border width (reduce width by less since this is less aparent with slanted col labels)
    var ini_clust_width = params.viz.svg_dim.width - (params.labels.super_label_width +
      label_scale(row_max_char)*config.row_label_scale + params.class_room.row) - params.viz.grey_border_width - spillover_x_offset;

    // there is space between the clustergram and the border
    var ini_clust_height = params.viz.svg_dim.height - (params.labels.super_label_width +
      0.8 * label_scale(col_max_char)*params.col_label_scale + params.class_room.col) - 5 * params.viz.grey_border_width;

    // the visualization dimensions can be smaller than the svg
    // if there are not many rows the clustergram width will be reduced, but not the svg width
    //!! needs to be improved
    var prevent_col_stretch = d3.scale.linear()
      .domain([1, 20]).range([0.05,1]).clamp('true');

    // clust_dim - clustergram dimensions (the clustergram is smaller than the svg)
    params.viz.clust.dim = {};
    params.viz.clust.dim.width = ini_clust_width * prevent_col_stretch(col_nodes.length);

    // clustergram height
    ////////////////////////
    // ensure that rects are never taller than they are wide
    // force square tiles
    if (ini_clust_width / col_nodes.length < ini_clust_height / row_nodes.length) {

      // scale the height
      params.viz.clust.dim.height = ini_clust_width * (row_nodes.length / col_nodes.length);

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
    // scaling functions to position rows and tiles, define rangeBands
    params.matrix.x_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.width]);
    params.matrix.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);

    // Define Orderings
    params.matrix.orders = {
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
    if (params.viz.inst_order === 'clust') {
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
    params.viz.zoom_switch = (params.viz.clust.dim.width / col_nodes.length) / (params.viz.clust.dim.height / row_nodes.length);

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
    params.labels.defalut_fs_row = params.matrix.y_scale.rangeBand() * 0.95;
    params.labels.defalut_fs_col = params.matrix.x_scale.rangeBand() * 0.75;

    // initialize font size zooming parameters
    params.viz.zoom_scale_font = {};
    params.viz.zoom_scale_font.row = 1;
    params.viz.zoom_scale_font.col = 1;

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
    params.viz.real_zoom = real_zoom_scale_col(col_nodes.length) * real_zoom_scale_screen(params.viz.clust.dim.width);

    // set opacity scale
    var max_link = _.max(network_data.links, function(d) {
      return Math.abs(d.value);
    });

    // set opacity_scale
    // input domain of 0 means set the domain automatically
    if (config.input_domain === 0) {
      // set the domain using the maximum absolute value
      if (config.opacity_scale === 'linear') {
        params.matrix.opacity_scale = d3.scale.linear()
          .domain([0, Math.abs(max_link.value)]).clamp(true)
          .range([0.0, 1.0]);
      } else if (config.opacity_scale === 'log') {
        params.matrix.opacity_scale = d3.scale.log()
          .domain([0.001, Math.abs(max_link.value)]).clamp(true)
          .range([0.0, 1.0]);
      }
    } else {
      // set the domain manually
      if (config.opacity_scale === 'linear') {
        params.matrix.opacity_scale = d3.scale.linear()
          .domain([0, config.input_domain]).clamp(true)
          .range([0.0, 1.0]);
      } else if (config.opacity_scale === 'log') {
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

function Labels(){

  // make row labels 
  function make_rows(params, row_nodes, reorder){

    // Row Labels 
    //////////////////////////////////
    // make container to pre-position zoomable elements
    var container_all_row = d3.select('#main_svg')
      .append('g')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.viz.clust.margin.top + ')');

    // white background rect for row labels
    container_all_row
      .append('rect')
      .attr('fill', params.viz.background_color)
      .attr('width', params.norm_label.background.row)
      .attr('height', 30 * params.viz.clust.dim.height + 'px')
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
      return 'translate(0,' + params.matrix.y_scale(index) + ')';
      })
      .on('dblclick', reorder.row_reorder )
      .on('mouseover', function() {

      // highlight text
      d3.select(this)
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
      .attr('y', params.matrix.y_scale.rangeBand() * 0.75)
      // .attr('dy', params.matrix.y_scale.rangeBand()/4)
      .attr('text-anchor', 'end')
      .style('font-size', params.labels.defalut_fs_row + 'px')
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
    ////////////////////////////////////////
    params.bounding_width_max = {};
    params.bounding_width_max.row = 0;
    d3.selectAll('.row_label_text').each(function() {
      var tmp_width = d3.select(this).select('text').node().getBBox().width;
      if (tmp_width > params.bounding_width_max.row) {
      params.bounding_width_max.row = tmp_width;
      }
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
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', params.class_room.row + 'px')
      .attr('height', function() {
      var inst_height = params.viz.clust.dim.height;
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
      return 'translate(0, ' + params.matrix.y_scale(index) + ')';
      });

    // add triangles
    row_triangle_ini_group
      .append('path')
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
      })
      .attr('fill', function(d) {

      // initailize color
      var inst_color = '#eee';
      if (params.labels.show_categories) {
        inst_color = params.labels.class_colors.row[d.cl];
      }
      return inst_color;
      });

      // get max value
      var enr_max = Math.abs(_.max( row_nodes, function(d) { return Math.abs(d.value) } ).value) ;

      // the enrichment bar should be 3/4ths of the height of the column labels
      params.labels.bar_scale_row = d3.scale
        .linear()
        .domain([0, enr_max])
        // .range([0, 10* params.bounding_width_max.row ]);
        .range([0, params.norm_label.width.row ]);

      // append column value bars
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
          return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
        })
        .attr('opacity', 0.4);
      }
      
      // return row_triangle_ini_group so that the dendrogram can be made 
      return row_triangle_ini_group;
  }   

  // make col labels 
  function make_cols(params, col_nodes, reorder){

    // make container to pre-position zoomable elements
    var container_all_col = d3.select('#main_svg')
      .append('g')
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
      // position the outer col label group
      .attr('transform', 'translate(0,' + params.norm_label.width.col + ')')
      .append('g')
      .attr('id', 'col_labels');

    // offset click group column label
    var x_offset_click = params.matrix.x_scale.rangeBand() / 2 + params.viz.border_width;
    // reduce width of rotated rects
    var reduce_rect_width = params.matrix.x_scale.rangeBand() * 0.36;

    // add main column label group
    var col_label_obj = d3.select('#col_labels')
      .selectAll('.col_label_text')
      .data(col_nodes)
      .enter()
      .append('g')
      .attr('class', 'col_label_text')
      .attr('transform', function(d, index) {
      return 'translate(' + params.matrix.x_scale(index) + ') rotate(-90)';
      });

    // append group for individual column label
    var col_label_click = col_label_obj
      // append new group for rect and label (not white lines)
      .append('g')
      .attr('class', 'col_label_click')
      // rotate column labels
      .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)')
      .on('dblclick', reorder.col_reorder )
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
      .attr('y', params.matrix.x_scale.rangeBand() * 0.60)
      // offset label to make room for triangle
      .attr('dx', 2 * params.viz.border_width)
      .attr('text-anchor', 'start')
      .attr('full_name', function(d) {
      return d.name;
      })
      // original font size
      .style('font-size', params.labels.defalut_fs_col + 'px')
      // // !! simple font size
      // .style('font-size', params.matrix.x_scale.rangeBand()*0.7+'px')
      .text(function(d) {
      return d.name.replace(/_/g, ' ');
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
    params.bounding_width_max.col = params.bounding_width_max.col * params.labels.col_overflow;
    params.bounding_width_max.row = params.bounding_width_max.row * params.labels.row_overflow;


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
      params.labels.defalut_fs_row = params.labels.defalut_fs_row * params.ini_scale_font
        .row;
      // reduce font size
      d3.selectAll('.row_label_text').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.defalut_fs_row + 'px');
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
      params.labels.defalut_fs_col = params.labels.defalut_fs_col * params.ini_scale_font
        .col;
      // reduce font size
      d3.selectAll('.col_label_click').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.defalut_fs_col + 'px');
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
      });


    //!! CHD specific 
    // get max value
    var enr_max = Math.abs(_.max( col_nodes, function(d) { return Math.abs(d.value) } ).value) ;

    // the enrichment bar should be 3/4ths of the height of the column labels
    params.labels.bar_scale_col = d3.scale
      .linear()
      .domain([1, enr_max])
      .range([0, params.norm_label.width.col]);

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
      .attr('fill', function() {
        // return d.color;
        return 'red';
      })
      .attr('opacity', 0.4);
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
    .attr('class', 'white_bars')
    .attr('transform', 'translate(0,' + params.viz.grey_border_width + ')');

    // super col title
    d3.select('#main_svg')
    .append('text')
    .text(params.labels.super.col)
    .attr('text-anchor', 'center')
    .attr('transform', function() {
      var inst_x = params.viz.clust.dim.width / 2 + params.norm_label.width
        .row;
      var inst_y = params.labels.super_label_width - params.viz.uni_margin;
      return 'translate(' + inst_x + ',' + inst_y + ')';
    })
    .style('font-size', '14px')
    .style('font-weight', 300);

    // super row title
    /////////////////////////////////////
    // add super row title background
    d3.select('#main_svg')
    .append('rect')
    .attr('fill', params.viz.background_color) 
    .attr('width', params.labels.super_label_width + 'px')
    .attr('height', '3000px')
    .attr('class', 'white_bars')
    .attr('transform', 'translate(' + params.viz.grey_border_width + ',0)');

    // append super title row group
    // this is used to separate translation from rotation
    d3.select('#main_svg')
    .append('g')
    .attr('id', 'super_row_label')
    .attr('transform', function() {
      // position in the middle of the clustergram
      var inst_x = params.labels.super_label_width - params.viz.uni_margin;
      var inst_y = params.viz.clust.dim.height / 2 + params.norm_label.width
        .col;
      return 'translate(' + inst_x + ',' + inst_y + ')';
    });

    // super row label (rotate the already translated title )
    d3.select('#super_row_label')
    .append('text')
    .text(params.labels.super.row)
    .attr('text-anchor', 'center')
    .attr('transform', 'rotate(-90)')
    .style('font-size', '14px')
    .style('font-weight', 300);

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
      .attr('class', 'white_bars');

    // white border bottom - prevent clustergram from hitting border
    ///////////////////////////////////////////////////////////////////
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', params.viz.svg_dim.width)
      // make this border twice the width of the grey border
      .attr('height', 2 * params.viz.grey_border_width)
      .attr('transform', function() {
      // shift up enough to show the entire border width
      var inst_offset = params.viz.svg_dim.height - 3 * params.viz.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
      });

    // add border to svg in four separate lines - to not interfere with clicking anything
    ///////////////////////////////////////////////////////////////////////////////////////
    // left border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.super_border_color) //!! prog_colors
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', 'translate(0,0)');

    // right border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.super_border_color) //!! prog_colors
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', function() {
      var inst_offset = params.viz.svg_dim.width - params.viz.grey_border_width;
      return 'translate(' + inst_offset + ',0)';
      });

    // top border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.super_border_color) //!! prog_colors
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
      var inst_offset = 0;
      return 'translate(' + inst_offset + ',0)';
      });

    // bottom border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.super_border_color) //!! prog_colors
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
      var inst_offset = params.viz.svg_dim.height - params.viz.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
      });
  }


}

/* Represents the entire visualization: labels, dendrogram (optional) and matrix.
 */
function Viz(config) {

  // scope these variables to viz 
  var matrix,
  row_dendrogram,
  col_dendrogram,
  zoom, 
  params, 
  reorder;

  // make viz 
  make(config);

  /* The main function; makes clustergram based on user arguments.
   */
  function make(config) {

    // initialize clustergram variables
    params = VizParams(config);

    var network_data = params.network_data;

    // set local variables from network_data
    var col_nodes = network_data.col_nodes;
    var row_nodes = network_data.row_nodes;

    // Begin Making Visualization
    /////////////////////////////////

    // !! needs to be improved 
    // remove any previous visualizations
    d3.select('#main_svg').remove();

    // size and position the outer div first
    
    // display col and row title
    d3.select('#row_title').style('display', 'block');
    d3.select('#col_title').style('display', 'block');

    // display clust_instruct_container
    d3.select('#clust_instruct_container').style('display', 'block');

    // shift the footer left
    d3.select('#footer_div')
      .style('margin-left', '0px');

    // instantiate zoom object 
    zoom = Zoom(params);

    // define the variable zoom, a d3 method
    params.zoom = d3.behavior
      .zoom()
      .scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch])
      .on('zoom', zoom.zoomed);

    // make outer group for clust_group - this will position clust_group once
    var svg_group = d3.select('#' + params.viz.svg_div_id)
      .append('svg')
      .attr('id', 'main_svg')
      // leave room for the light grey border
      .attr('width', params.viz.svg_dim.width)
      // the height is reduced by more than the width because the tiles go right up to the bottom border
      .attr('height', params.viz.svg_dim.height);

    // call zooming on the entire svg
    if (params.viz.do_zoom) {
      svg_group.call(params.zoom);
    }

    // make the matrix 
    /////////////////////////
    matrix = Matrix(network_data, svg_group, params);

    // append background rect if necessary to control background color
    if (params.viz.background_color !== '#FFFFFF') {
      svg_group
      .append('rect')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.svg_dim.height)
      .style('fill', params.viz.background_color);
    }


    // define reordering object - scoped to viz
    reorder = Reorder(params);

    // define labels object 
    var labels = Labels(params);

    // row labels 
    /////////////////////////
    var row_triangle_ini_group = labels.make_rows( params, row_nodes, reorder ); 
    
    // Column Labels 
    //////////////////////////////////
    var container_all_col = labels.make_cols( params, col_nodes, reorder );
    

    // add group labels if necessary
    //////////////////////////////////
    if (params.viz.show_dendrogram) {

      // make row dendrogram 
      row_dendrogram = Dendrogram('row', params, row_triangle_ini_group);

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
        return 'translate(' + params.matrix.x_scale(index) + ',0)';
      });

      // make col dendrogram 
      col_dendrogram = Dendrogram('col', params, col_class_ini_group);

      // optional column callback on click
      if (typeof params.click_group === 'function') {
      col_class_ini_group
        .on('click', function(d) {
        var inst_level = params.group_level.col;
        var inst_group = d.group[inst_level];
        // find all column names that are in the same group at the same group_level
        // get col_nodes
        col_nodes = params.network_data.col_nodes;
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
    if (params.labels.super_labels) {

      // make super labels 
      var super_labels = SuperLabels();
      super_labels.make(params);      

    }

    // Spillover Divs 
    var spillover = Spillover(params, container_all_col);

    // initialize zoom and translate

    ///////////////////////////////////
    // initialize translate vector to compensate for label margins
    params.zoom.translate([params.viz.clust.margin.left, params.viz.clust.margin.top]);

    // resize window
    if (params.viz.resize){
      d3.select(window).on('resize', function(){
        setTimeout(reset_visualization_size, 500);
      });
    }

    // initialize double click zoom for matrix 
    zoom.ini_doubleclick();
  }

  function reset_visualization_size() {

    viz.remake();

    // reset zoom and translate
    params.zoom.scale(1).translate(
        [ params.viz.clust.margin.left, params.viz.clust.margin.top]
    );
  }

  // highlight resource types - set up type/color association
  var gene_search = Search(params, params.network_data.row_nodes, 'name');

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
    two_translate_zoom: zoom.two_translate_zoom,
    // expose all_reorder function
    reorder: reorder.all_reorder,
    search: gene_search
  }

}

/* Reordering Module
*/

function Reorder(params){

  /* Reorder the clustergram using the toggle switch
   */
  function all_reorder(inst_order) {

    // // load parameters from d3_clustergram
    // var params = params;

    // set running transition value
    params.viz.run_trans = true;

    // load orders
    if (inst_order === 'clust') {
      params.matrix.x_scale.domain(params.matrix.orders.clust_row);
      params.matrix.y_scale.domain(params.matrix.orders.clust_col);
    } else if (inst_order === 'rank') {
      params.matrix.x_scale.domain(params.matrix.orders.rank_row);
      params.matrix.y_scale.domain(params.matrix.orders.rank_col);
    } else if (inst_order === 'class') {
      params.matrix.x_scale.domain(params.matrix.orders.class_row);
      params.matrix.y_scale.domain(params.matrix.orders.class_col);
    }

    // define the t variable as the transition function
    var t = viz.get_clust_group()
      .transition().duration(2500);

    // reorder matrix
    t.selectAll('.row')
      .attr('transform', function(d, i) {
        return 'translate(0,' + params.matrix.y_scale(i) + ')';
      })
      .selectAll('.tile')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ' , 0)';
      });

    // Move Row Labels
    d3.select('#row_labels').selectAll('.row_label_text')
      .transition().duration(2500)
      .attr('transform', function(d, i) {
        return 'translate(0,' + params.matrix.y_scale(i) + ')';
      });

    // t.selectAll('.column')
    d3.select('#col_labels').selectAll('.col_label_text')
      .transition().duration(2500)
      .attr('transform', function(d, i) {
        return 'translate(' + params.matrix.x_scale(i) + ')rotate(-90)';
      });

    // reorder row_label_triangle groups
    d3.selectAll('.row_triangle_group')
      .transition().duration(2500)
      .attr('transform', function(d, i) {
        return 'translate(0,' + params.matrix.y_scale(i) + ')';
      });

    // reorder col_class groups
    d3.selectAll('.col_class_group')
      .transition().duration(2500)
      .attr('transform', function(d, i) {
        return 'translate(' + params.matrix.x_scale(i) + ',0)';
      })
      .each('end', function() {
        // set running transition to 0
        params.viz.run_trans = false;
      });

    // backup allow programmatic zoom
    setTimeout(end_reorder, 2500);
  }

  function row_reorder() {

    // get inst row (gene)
    var inst_row = d3.select(this).select('text').text();

    // get row and col nodes 
    params.viz.run_trans = true;

    var mat       = viz.get_matrix();
    var row_nodes = viz.get_nodes('row');
    var col_nodes = viz.get_nodes('col');

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
      tmp_arr.push( mat[inst_row][index].value);
    });

    // sort the rows
    var tmp_sort = d3.range(tmp_arr.length).sort(function(a, b) {
      return tmp_arr[b] - tmp_arr[a];
    });

    // // get parameters
    // var params = params;

    // resort the columns (resort x)
    params.matrix.x_scale.domain(tmp_sort);

    // reorder matrix 
    ////////////////////

    // define the t variable as the transition function
    var t = viz.get_clust_group()
      .transition().duration(2500);

    // reorder matrix
    t.selectAll('.tile')
      .attr('transform', function(data) {
        return 'translate(' + params.matrix.x_scale(data.pos_x) + ',0)';
      });

    // Move Col Labels
    d3.select('#col_labels').selectAll('.col_label_text')
      .transition().duration(2500)
      .attr('transform', function(data, index) {
        return 'translate(' + params.matrix.x_scale(index) + ')rotate(-90)';
      });

    // reorder col_class groups
    d3.selectAll('.col_class_group')
      .transition().duration(2500)
      .attr('transform', function(data, index) {
        return 'translate(' + params.matrix.x_scale(index) + ',0)';
      })
      .each('end', function() {
        // set running transition to 0
        params.viz.run_trans = false;
      });

    // highlight selected row 
    d3.selectAll('.row_label_text')
      .select('rect')
      .style('opacity', 0);
    d3.select(this)
      .select('rect')
      .style('opacity', 1);

    // backup allow programmatic zoom
    setTimeout(end_reorder, 2500);
  }

  function col_reorder(){
    // set running transition value
    params.viz.run_trans = true;

    var mat       = viz.get_matrix();
    var row_nodes = viz.get_nodes('row');
    var col_nodes = viz.get_nodes('col');

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
      tmp_arr.push( mat[index][inst_col].value);
    });

    // sort the rows
    var tmp_sort = d3.range(tmp_arr.length).sort(function(a, b) {
      return tmp_arr[b] - tmp_arr[a];
    });

    // resort rows - y axis
    ////////////////////////////
    params.matrix.y_scale.domain(tmp_sort);

    // reorder
    // define the t variable as the transition function
    var t = viz.get_clust_group()
      .transition().duration(2500);

    // reorder matrix
    t.selectAll('.row')
      .attr('transform', function(data, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ')';
      });

    // reorder row_label_triangle groups
    d3.selectAll('.row_triangle_group')
      .transition().duration(2500)
      .attr('transform', function(data, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ')';
      });

    // Move Row Labels
    d3.select('#row_labels').selectAll('.row_label_text')
      .transition().duration(2500)
      .attr('transform', function(data, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ')';
      });

    // t.selectAll('.column')
    d3.select('#col_labels').selectAll('.col_label_text')
      .transition().duration(2500)
      .attr('transform', function(data, index) {
        return 'translate(' + params.matrix.x_scale(index) + ')rotate(-90)';
      })
      .each('end', function() {
        // set running transition to 0
        params.viz.run_trans = false;
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

  // allow programmatic zoom after reordering
  function end_reorder() {
    params.viz.run_trans = false;
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

    var zoom_x = d3.event.scale,
      zoom_y = d3.event.scale,
      trans_x = d3.event.translate[0] - params.viz.clust.margin.left,
      trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

    // apply transformation
    apply_transformation(trans_x, trans_y, zoom_x, zoom_y);  
  }

  function apply_transformation(trans_x, trans_y, zoom_x, zoom_y) {

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

    // apply transformation and reset translate vector
    // the zoom vector (zoom.scale) never gets reset
    ///////////////////////////////////////////////////
    // translate clustergram
    // d3.select('#clust_group')
    viz.get_clust_group()
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
      .translate([trans_x + params.viz.clust.margin.left, trans_y + params.viz.clust.margin.top
      ]);

   
    // check if widest row or col are wider than the allowed label width
    ////////////////////////////////////////////////////////////////////////

    if (params.bounding_width_max.row * params.zoom.scale() > params.norm_label.width.row) {
      params.viz.zoom_scale_font.row = params.norm_label.width.row / (params.bounding_width_max
          .row * params.zoom.scale());

      // reduce font size
      d3.selectAll('.row_label_text').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.labels.defalut_fs_row * params.viz.zoom_scale_font.row + 'px')
          .attr('y', params.matrix.y_scale.rangeBand() * params.scale_font_offset(params.viz.zoom_scale_font.row));

      });

    } else {
      // reset font size
      d3.selectAll('.row_label_text').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.labels.defalut_fs_row + 'px')
          .attr('y', params.matrix.y_scale.rangeBand() * 0.75);
      });

      if (Utils.has( params.network_data.row_nodes[0], 'value')) {
        d3.selectAll('.row_bars')
        .attr('width', function(d) {
          var inst_value = 0;
          inst_value = params.labels.bar_scale_row(Math.abs(d.value));
          return inst_value;
        })
        .attr('x', function(d) {
          var inst_value = 0;
          inst_value = -params.labels.bar_scale_row(Math.abs(d.value))  ;
          return inst_value;
        });
      }

    }

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

    if (params.bounding_width_max.col * (params.zoom.scale() / params.viz.zoom_switch) > params.norm_label.width.col) {
      params.viz.zoom_scale_font.col = params.norm_label.width.col / (params.bounding_width_max
          .col * (params.zoom.scale() / params.viz.zoom_switch));

      // reduce font size
      d3.selectAll('.col_label_click').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.labels.defalut_fs_col * params.viz.zoom_scale_font
            .col + 'px');

      });

    } else {
      // reset font size
      d3.selectAll('.col_label_click').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.labels.defalut_fs_col + 'px');
      });

     if (Utils.has( params.network_data.col_nodes[0], 'value')) {
        d3.selectAll('.col_bars')
          .attr('width', function(d) {
            var inst_value = 0;
            if (d.value > 0){
              inst_value = params.labels.bar_scale_col(d.value);
            }
            return inst_value;
          })
        }

    }

    if (Utils.has( params.network_data.col_nodes[0], 'value')) {
      d3.selectAll('.col_bars')
        .attr('width', function(d) {
          var inst_value = 0;
          if (d.value > 0){
            inst_value = params.labels.bar_scale_col(d.value)/zoom_y;
          }
          return inst_value;
        })
      }


    // column value bars
    ///////////////////////
    // console.log(zoom_y)

    // //!! change the size of the highlighting rects
    // //////////////////////////////////////////////
    // // re-size of the highlighting rects
    // d3.select('#row_labels')
    //   .each(function(){
    //   // get the bounding box of the row label text
    //   var bbox = d3.select(this)
    //          .select('text')[0][0]
    //          .getBBox();
    //   // use the bounding box to set the size of the rect
    //   d3.select(this)
    //     .select('rect')
    //   .attr('x', bbox.x*0.5)
    //   .attr('y', 0)
    //   .attr('width', bbox.width*0.5)
    //   .attr('height', params.matrix.y_scale.rangeBand())
    //   .style('fill','yellow');
    // });

    // // col_label_click
    // d3.select('#col_labels')
    //   .each(function(){
    //   // get the bounding box of the row label text
    //   var bbox = d3.select(this)
    //          .select('text')[0][0]
    //          .getBBox();
    //   // use the bounding box to set the size of the rect
    //   d3.select(this)
    //     .select('rect')
    //   .attr('x', bbox.x*1.25)
    //   .attr('y', 0)
    //   .attr('width', bbox.width * 1.25)
    //   // used thd reduced rect width for the columsn
    //   // reduced because thee rects are slanted
    //   .attr('height', params.matrix.x_scale.rangeBand()*0.6)
    //   .style('fill','yellow')
    //   .style('opacity',0);
    //   });
  }

  function two_translate_zoom(pan_dx, pan_dy, fin_zoom) {

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

        // console.log('restricting pan up')
        shift_top_viz = half_height + pan_dy;

        shift_up_viz = half_height / params.viz.zoom_switch - shift_top_viz; //- move_up_one_row;

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
      // d3.select('#clust_group')
      viz.get_clust_group()
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
      var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy *
        zoom_y;

      // reset the zoom translate and zoom
      params.zoom.scale(zoom_y);
      params.zoom.translate([pan_dx, net_y_offset]);

      // check if widest row or col are wider than the allowed label width
      ////////////////////////////////////////////////////////////////////////

      if (params.bounding_width_max.row * params.zoom.scale() > params.norm_label
          .width.row) {
        params.viz.zoom_scale_font.row = params.norm_label.width.row / (params.bounding_width_max
            .row * params.zoom.scale());

        // reduce font size
        d3.selectAll('.row_label_text').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.labels.defalut_fs_row * params.viz.zoom_scale_font
              .row + 'px')
            .attr('y', params.matrix.y_scale.rangeBand() * params.scale_font_offset(
              params.viz.zoom_scale_font.row));
        });

      } else {
        // reset font size
        d3.selectAll('.row_label_text').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.labels.defalut_fs_row + 'px')
            .attr('y', params.matrix.y_scale.rangeBand() * 0.75);
        });
      }

      if (params.bounding_width_max.col * (params.zoom.scale() / params.viz.zoom_switch) >
        params.norm_label.width.col) {
        params.viz.zoom_scale_font.col = params.norm_label.width.col / (params.bounding_width_max
            .col * (params.zoom.scale() / params.viz.zoom_switch));

        // reduce font size
        d3.selectAll('.col_label_click').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.labels.defalut_fs_col * params.viz.zoom_scale_font
              .col + 'px');
        });

      } else {
        // reset font size
        d3.selectAll('.col_label_click').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.labels.defalut_fs_col + 'px');
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

  function ini_doubleclick(){

    // disable double-click zoom: double click should reset zoom level
    d3.selectAll('svg').on('dblclick.zoom', null);

    // double click to reset zoom - add transition
    d3.select('#main_svg')
      .on('dblclick', function() {
        // programmatic zoom reset 
        two_translate_zoom(0, 0, 1);
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

// make visualization using configuration object and network 
var viz = Viz(config);


/* API
 * ----------------------------------------------------------------------- */

return {
    find_gene: viz.search.find_entities,
    get_genes: viz.search.get_entities,
    change_groups: viz.change_group,
    reorder: viz.reorder
};
	
}
