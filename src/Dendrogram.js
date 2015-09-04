
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
      .attr('height', params.y_scale.rangeBand())
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
      .attr('width', params.x_scale.rangeBand())
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
        row_nodes = globals.network_data.row_nodes;
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
