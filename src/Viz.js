
/* Represents the entire visualization: labels, dendrogram (optional) and matrix.
 */
function Viz(params) {

  // scope these variables to viz
  var matrix,
  row_dendrogram,
  col_dendrogram,
  zoom,
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

    // !! needs to be improved
    // remove any previous visualizations
    d3.select('#main_svg').remove();

    // instantiate zoom object
    zoom = Zoom(params);

    console.log('was a previous svg found? '+ d3.select('#'+params.viz.svg_div_id).select('svg').empty())

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



    // make the matrix
    /////////////////////////
    matrix = Matrix(network_data, svg_group, params);


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
      .data(col_nodes, function(d){return d.name;})
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
    // left border
    d3.select('#main_svg')
      .append('rect')
      .attr('id','left_border')
      .attr('fill', params.viz.super_border_color) //!! prog_colors
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', 'translate(0,0)');

    // right border
    d3.select('#main_svg')
      .append('rect')
      .attr('id','right_border')
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
      .attr('id','top_border')
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
      .attr('id','bottom_border')
      .attr('fill', params.viz.super_border_color) //!! prog_colors
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
        var inst_offset = params.viz.svg_dim.height - params.viz.grey_border_width;
        return 'translate(0,' + inst_offset + ')';
      });

    ///////////////////////////////////
    // initialize translate vector to compensate for label margins
    params.zoom.translate([params.viz.clust.margin.left, params.viz.clust.margin.top]);

    // params.initialize_resizing = initialize_resizing;

    params.initialize_resizing(params);

    // initialize double click zoom for matrix
    zoom.ini_doubleclick();

    if (params.viz.do_zoom) {
      svg_group.call(params.zoom);
    }
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

  return {
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
    search: gene_search,
    opacity_slider: opacity_slider,
    run_reset_visualization_size: run_reset_visualization_size,
    update_network: update_network, 
    params: params
  }


}
