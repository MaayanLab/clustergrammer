


  // This object is a temporary hack to hold all global state for this module.
  var globals = {};


  /* Main program
   * ----------------------------------------------------------------------- */

  // consume and validate user input
  // build giant config object
  // visualize based on config object
  // handle user events

  make(args);

  // parent_div: size and position svg container - svg_div
  //////////////////////////////////////////////
  function parent_div_size_pos(params) {

    if (params.resize) {
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

  // tmp backup function to allow programmatic zoom after reordering
  function end_reorder() {
    globals.params.run_trans = false;
  }

  // reorder columns with row click
  function reorder_click_row() {

    // set running transition value
    globals.params.run_trans = true;

    // get parameters
    var params = globals.params;

    // get row_nodes from global variable
    var row_nodes = globals.network_data.row_nodes;
    var col_nodes = globals.network_data.col_nodes;

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
        globals.params.run_trans = false;
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
    globals.params.run_trans = true;

    // get parameters
    var params = globals.params;

    // get row_nodes from global variable
    var row_nodes = globals.network_data.row_nodes;
    var col_nodes = globals.network_data.col_nodes;

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
        globals.params.run_trans = false;
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

  /* API functions
   * ----------------------------------------------------------------------- */

  /* Reorder the clustergram using the toggle switch
   */
  function reorder(inst_order) {

    // load parameters from d3_clustergram
    var params = globals.params;

    // set running transition value
    globals.params.run_trans = true;

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
        globals.params.run_trans = false;
      });

    // backup allow programmatic zoom
    setTimeout(end_reorder, 2500);
  }

  /* Changes the groupings (x- and y-axis color bars).
   */
  function change_groups(inst_rc, inst_index) {
    if (inst_rc === 'row') {
      d3.selectAll('.row_class_rect')
        .style('fill', function(d){
          return globals.params.group_colors.row[d.group[inst_index]];
        });
    } else {
      d3.selectAll('.col_class_rect')
        .style('fill', function(d){
          return globals.params.group_colors.col[d.group[inst_index]];
        });
    }
  }

  /* Utility functions
   * ----------------------------------------------------------------------- */

  /* Resize clustergram to fit screen size.
   */
  function resize_to_screen() {
    // Only resize if allowed
    if (globals.params.resize) {
      setTimeout(reset_visualization_size, 500);
    }
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

  // highlight resource types - set up type/color association
  var gene_search = Search(globals.network_data.row_nodes, 'name');