

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
    .attr('transform', 'translate(' +
      params.viz.clust.margin.left + ',' +
      params.viz.clust.margin.top + ')')
    .append('g')
    .attr('id', 'clust_group');

  if (params.matrix.show_tile_tooltips){
    // d3-tooltip - for tiles 
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .direction('e')
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
