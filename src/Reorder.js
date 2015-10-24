/* Reordering Module
*/

function Reorder(params){

  /* Reorder the clustergram using the toggle switch
   */
  function all_reorder(inst_order) {

    console.log('\n\nrunning all reorder\n\n')

    params.viz.run_trans = true;

    // load orders
    if (inst_order === 'ini') {
      params.matrix.x_scale.domain(params.matrix.orders.ini_row);
      params.matrix.y_scale.domain(params.matrix.orders.ini_col);
    } else if (inst_order === 'clust') {
      params.matrix.x_scale.domain(params.matrix.orders.clust_row);
      params.matrix.y_scale.domain(params.matrix.orders.clust_col);
    } else if (inst_order === 'rank') {
      params.matrix.x_scale.domain(params.matrix.orders.rank_row);
      params.matrix.y_scale.domain(params.matrix.orders.rank_col);
    } else if (inst_order === 'class') {
      params.matrix.x_scale.domain(params.matrix.orders.class_row);
      params.matrix.y_scale.domain(params.matrix.orders.class_col);
    }



    // only animate transition if there are a small number of tiles
    if (d3.selectAll('.tile')[0].length < 10000){

      // define the t variable as the transition function
      var t = viz.get_clust_group()
        .transition().duration(2500);

      // reorder matrix
      t.selectAll('.tile')
        .attr('transform', function(d) {
          return 'translate(' + params.matrix.x_scale(d.target) + ' , '+ params.matrix.y_scale(d.source)+')';
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
          return 'translate(' + params.matrix.x_scale(i) + ') rotate(-90)';
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
        });

    } else {

      // define the t variable as the transition function
      var t = viz.get_clust_group();

      // reorder matrix
      t.selectAll('.tile')
        .attr('transform', function(d) {
          return 'translate(' + params.matrix.x_scale(d.target) + ' , '+ params.matrix.y_scale(d.source)+')';
        });

      // Move Row Labels
      d3.select('#row_labels').selectAll('.row_label_text')
        .attr('transform', function(d, i) {
          return 'translate(0,' + params.matrix.y_scale(i) + ')';
        });

      // t.selectAll('.column')
      d3.select('#col_labels').selectAll('.col_label_text')
        .attr('transform', function(d, i) {
          return 'translate(' + params.matrix.x_scale(i) + ') rotate(-90)';
        });

      // reorder row_label_triangle groups
      d3.selectAll('.row_triangle_group')
        .attr('transform', function(d, i) {
          return 'translate(0,' + params.matrix.y_scale(i) + ')';
        });

      // reorder col_class groups
      d3.selectAll('.col_class_group')
        .attr('transform', function(d, i) {
          return 'translate(' + params.matrix.x_scale(i) + ',0)';
        });

    }

      // params.viz.run_trans = false;

      reposition_tile_highlight();

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

    // resort the columns (resort x)
    params.matrix.x_scale.domain(tmp_sort);

    // reorder matrix
    ////////////////////

    // define the t variable as the transition function
    var t = viz.get_clust_group()
      .transition().duration(2500);

    // reorder matrix
    t.selectAll('.tile')
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.target) + ','+params.matrix.y_scale(d.source)+')';
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
    t.selectAll('.tile')
      .attr('transform', function(d, index) {
        return 'translate('+params.matrix.x_scale(d.target)+',' + params.matrix.y_scale(d.source) + ')';
      });

    // reorder row_label_triangle groups
    d3.selectAll('.row_triangle_group')
      .transition().duration(2500)
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ')';
      });

    // Move Row Labels
    d3.select('#row_labels').selectAll('.row_label_text')
      .transition().duration(2500)
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ')';
      });

    // t.selectAll('.column')
    d3.select('#col_labels').selectAll('.col_label_text')
      .transition().duration(2500)
      .attr('transform', function(d, index) {
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


