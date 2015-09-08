
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
      .scaleExtent([1, params.real_zoom * params.zoom_switch])
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
        return 'translate(' + params.x_scale(index) + ',0)';
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
