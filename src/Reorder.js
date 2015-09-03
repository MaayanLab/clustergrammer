/* Reordering Module
*/

function Reorder(){

	function row_reorder() {

    // get inst row (gene)
    var inst_row = d3.select(this).select('text').text();

		// get row and col nodes 
    globals.params.run_trans = true;

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

    // get parameters
    var params = globals.params;

    // resort the columns (resort x)
    params.x_scale.domain(tmp_sort);

    // reorder matrix 
    ////////////////////

    // define the t variable as the transition function
    var t = viz.get_clust_group()
      .transition().duration(2500);

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
    globals.params.run_trans = true;

    var mat       = viz.get_matrix();
    var row_nodes = viz.get_nodes('row');
    var col_nodes = viz.get_nodes('col');

    // get parameters
    var params = globals.params;

    // // get row_nodes from global variable
    // var row_nodes = globals.network_data.row_nodes;
    // var col_nodes = globals.network_data.col_nodes;

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
    params.y_scale.domain(tmp_sort);

    // reorder
    // define the t variable as the transition function
    var t = viz.get_clust_group()
      .transition().duration(2500);

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

	return {
		row_reorder: row_reorder,
		col_reorder: col_reorder
	};

}


