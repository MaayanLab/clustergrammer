function update_network(args){

  var config = Config(args);
  var params = VizParams(config);

  var width  = params.viz.svg_dim.width;
  var height = params.viz.svg_dim.height;
  var margin_left = args.outer_margins.left;
  var margin_top = args.outer_margins.top;

  var network_data = params.network_data;

  var update_dur = 1000;

  enter_exit_update(params, network_data, update_dur);

  // var viz = Viz(params);

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


function enter_exit_update(params, network_data, update_dur){

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
    .transition().duration(update_dur)
    .style('opacity',0)
    .remove();

  // remove row labels 
  d3.selectAll('.row_label_text')
    .data(row_nodes, function(d){ return d.name;})
    .exit()
    .transition().duration(update_dur)
    .style('opacity',0)
    .remove();

  // remove column labels 
  d3.selectAll('.col_label_click')
    .data(col_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(update_dur)
    .style('opacity',0)
    .remove();      

  // remove row triangles and colorbars 
  d3.selectAll('.row_triangle_group')
    .data(row_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(update_dur)
    .style('opacity',0)
    .remove();      

  // remove row triangles 
  d3.selectAll('.col_label_text')
    .data(col_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(update_dur)
    .style('opacity',0)
    .remove();      

  d3.selectAll('.horz_lines')
    .data(row_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(update_dur)
    .style('opacity',0)
    .remove();

  d3.selectAll('.vert_lines')
    .data(col_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(update_dur)
    .style('opacity',0)
    .remove();

  // remove dendrogram 
  d3.selectAll('.col_class_group')
    .data(col_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(update_dur)
    .style('opacity',0)
    .remove();  

  resize_after_update(params, row_nodes, col_nodes, links, update_dur);

  // reset resize on expand button click and screen resize 
  params.initialize_resizing(params);


}

