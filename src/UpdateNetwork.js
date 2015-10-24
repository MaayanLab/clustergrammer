function update_network(args){

  var old_params = this.params;

  var config = Config(args);
  var params = VizParams(config);

  var delays = check_need_exit_enter(old_params, params);

  var network_data = params.network_data;

  enter_exit_update(params, network_data, delays);

  // update network data 
  this.params.network_data = network_data;

  // ordering 
  var reorder = Reorder(params);
  this.reorder = reorder.all_reorder;

  // reset row and col label click reorder 
  d3.selectAll('.col_label_text')
    .on('dblclick',null);

  d3.selectAll('.row_label_text')
    .on('dblclick',null);

  // search functions 
  var gene_search = Search(params, params.network_data.row_nodes,'name');
  this.get_genes  = gene_search.get_entities;
  this.find_genes = gene_search.find_entities;

  d3.select('#main_svg').call(params.zoom);

  // disable default double click zoom 
  d3.select('#main_svg').on('dblclick.zoom',null);

}

function check_need_exit_enter(old_params, params){

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

  delays.exit = 0;

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

  delays.update = delays.update  + delays.exit;
  delays.enter  = delays.enter + delays.exit + delays.update ;

  return delays;
}

function enter_exit_update(params, network_data, delays){

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

  // remove tiles 
  d3.selectAll('.tile')
    .data(links, function(d){ return d.name;})
    .exit()
    .transition().duration(duration)
    .style('opacity',0)
    .remove();

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
  d3.selectAll('.row_triangle_group')
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
  d3.selectAll('.col_class_group')
    .data(col_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(duration)
    .style('opacity',0)
    .remove();  

  resize_after_update(params, row_nodes, col_nodes, links, duration, delays);

  // reset resize on expand button click and screen resize 
  params.initialize_resizing(params);

  // enter new elements 
  //////////////////////////

  d3.select('#clust_group')
    .selectAll('.tile')
    .data(links, function(d){return d.name;})
    .enter()
    .append('rect')
    .style('fill-opacity',0)
    .attr('class','tile new_tile')
    .attr('width', params.matrix.x_scale.rangeBand())
    .attr('height', params.matrix.y_scale.rangeBand())
    .attr('transform', function(d) {
      return 'translate(' + params.matrix.x_scale(d.target) + ','+params.matrix.y_scale(d.source)+')';
    })
    .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
    })
    .transition().delay(delays.enter).duration(duration)
    .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
    });

  var labels = Labels(params);

  var reorder = Reorder(params);

  labels.make_rows( params, row_nodes, reorder );
  labels.make_cols( params, col_nodes, reorder );
  
    // .transition().duration(duration)
    // .style('opacity',1)

  // // remove column labels 
  // d3.selectAll('.col_label_click')
  //   .data(col_nodes, function(d){return d.name;})
  //   .exit()
  //   .transition().duration(duration)
  //   .style('opacity',0)
  //   .remove();      

  // // remove row triangles and colorbars 
  // d3.selectAll('.row_triangle_group')
  //   .data(row_nodes, function(d){return d.name;})
  //   .exit()
  //   .transition().duration(duration)
  //   .style('opacity',0)
  //   .remove();      

  // // remove row triangles 
  // d3.selectAll('.col_label_text')
  //   .data(col_nodes, function(d){return d.name;})
  //   .exit()
  //   .transition().duration(duration)
  //   .style('opacity',0)
  //   .remove();      

  // d3.selectAll('.horz_lines')
  //   .data(row_nodes, function(d){return d.name;})
  //   .exit()
  //   .transition().duration(duration)
  //   .style('opacity',0)
  //   .remove();

  // d3.selectAll('.vert_lines')
  //   .data(col_nodes, function(d){return d.name;})
  //   .exit()
  //   .transition().duration(duration)
  //   .style('opacity',0)
  //   .remove();

  // // remove dendrogram 
  // d3.selectAll('.col_class_group')
  //   .data(col_nodes, function(d){return d.name;})
  //   .exit()
  //   .transition().duration(duration)
  //   .style('opacity',0)
  //   .remove();  

}

