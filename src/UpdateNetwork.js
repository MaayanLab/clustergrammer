function update_network(args){

  var old_params = this.params;

  var config = Config(args);
  var params = VizParams(config);

  var delays = define_enter_exit_delays(old_params, params);

  var network_data = params.network_data;

  // ordering - necessary for redefining the function called on button click
  var reorder = Reorder(params);
  this.reorder = reorder.all_reorder;

  enter_exit_update(params, network_data, reorder, delays);

  // update network data 
  // this.params.network_data = network_data;
  this.params = params;

  // search functions 
  var gene_search = Search(params, params.network_data.row_nodes,'name');
  this.get_genes  = gene_search.get_entities;
  this.find_gene = gene_search.find_entities;

  // initialize screen resizing - necesary for resizing with new params 
  params.initialize_resizing(params);

  // necessary to have zoom behavior on updated clustergram
  // params.zoom corresponds to the zoomed function from the Zoom object 
  d3.select('#main_svg').call(params.zoom);

  // d3.select('#main_svg').on('dblclick.zoom',null);    

  // initialize the double click behavior - necessary for nomal zoom/double click
  // behavior 
  var zoom = Zoom(params);
  zoom.ini_doubleclick();

}

function define_enter_exit_delays(old_params, params){

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

function enter_exit_update(params, network_data, reorder, delays){

  // get row and col names 
  var row_nodes_names = params.network_data.row_nodes_names;
  var col_nodes_names = params.network_data.col_nodes_names;

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

  // exit
  ////////////

  // remove entire rows 
  d3.select('#clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .exit()
    .transition().duration(duration)
    .style('opacity',0)
    .remove();


  // move rows 
  d3.select('#clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .transition().delay(delays.update).duration(duration)
    .attr('transform', function(d){
      var tmp_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,'+params.matrix.y_scale(tmp_index)+')';
    })

  // update existing rows - enter, exit, update tiles in existing row
  d3.select('#clust_group')
    .selectAll('.row')
    .each(eeu_existing_row);

  // function to remove tiles 
  function eeu_existing_row(ini_inp_row_data){

    var inp_row_data = ini_inp_row_data.row_data;

    // remove zero values from 
    var row_data = _.filter(inp_row_data, function(num){
      return num.value !=0;
    });

    // remove tiles 
    var cur_row = d3.select(this)
      .selectAll('rect')
      .data(row_data, function(d){return d.col_name;});

    // exit removing rows 
    cur_row
      .exit()
      .transition().duration(300)
      .attr('fill-opacity',0)
      .remove();

    // update tiles in x direction 
    cur_row
      .transition().delay(delays.update).duration(duration)
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
      .attr('transform', function(d) {
        if (_.contains(col_nodes_names, d.col_name)){
          var inst_col_index = _.indexOf(col_nodes_names, d.col_name);
          var x_pos = params.matrix.x_scale(inst_col_index) + 0.5*params.viz.border_width; 
          return 'translate(' + x_pos + ',0)';
        }
      });

    // enter new tiles 
    cur_row
      .enter()
      .append('rect')
      .attr('class', 'tile row_tile')
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
      .attr('fill-opacity',0)
      .attr('transform', function(d){
        var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate('+x_pos+','+y_pos+')';
      })
      .transition().delay(delays.enter).duration(duration)
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .attr('fill-opacity',function(d){
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      });




  }

  // // update tile positions 
  // d3.select('#clust_group')
  //   .selectAll('.row')
  //   .transition().delay(delays.update).duration(duration)
  //   .attr('transform', function(d){
  //     var y_pos = 0;
  //     if ( _.contains(row_nodes_names, d.name) ){
  //       var inst_row_index = _.indexOf(row_nodes_names, d.name);
  //       y_pos = params.matrix.x_scale(inst_row_index);
  //     }
  //     return 'translate(0,'+ y_pos +')';
  //   });

  d3.selectAll('.horz_lines').remove();
  d3.selectAll('.vert_lines').remove();

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
  d3.selectAll('.row_viz_group')
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
  d3.selectAll('.col_viz_group')
    .data(col_nodes, function(d){return d.name;})
    .exit()
    .transition().duration(duration)
    .style('opacity',0)
    .remove();  

  // resize clust components using appropriate delays 
  resize_after_update(params, row_nodes, col_nodes, links, duration, delays);


  // enter new elements 
  //////////////////////////

  // enter new rows 
  var new_row_groups = d3.select('#clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class','row')
    .attr('transform', function(d) {
      var tmp_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(tmp_index) + ')';
    });

  new_row_groups.each(enter_simple_rows);

    // make each row in the clustergram
  function enter_simple_rows(ini_inp_row_data) {

    var inp_row_data = ini_inp_row_data.row_data;

    // remove zero values to make visualization faster
    var row_data = _.filter(inp_row_data, function(num) {
      return num.value !== 0;
    });

    // generate tiles in the current row
    var tile = d3.select(this)
      .selectAll('rect')
      .data(row_data, function(d){return d.col_name;})
      .enter()
      .append('rect')
      .attr('class', 'tile row_tile')
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
      // switch the color based on up/dn value
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .on('mouseover', function(p) {

        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return p.row_name === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
      })
      .attr('title', function(d) {
        return d.value;
      });

    tile
      .style('fill-opacity',0)
      .transition().delay(delays.enter).duration(duration)
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      });

    tile
      .attr('transform', function(d) {
        var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width; 
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate(' + x_pos + ','+y_pos+')';
      });

    // // append title to group
    // if (params.matrix.tile_title) {
    //   tile.append('title')
    //   .text(function(d) {
    //     var inst_string = 'value: ' + d.value;
    //     return inst_string;
    //   });
    // }

  }

  // d3.select('#clust_group')
  //   .selectAll('.tile')
  //   .data(links, function(d){return d.name;})
  //   .enter()
  //   .append('rect')
  //   .style('fill-opacity',0)
  //   .attr('class','tile new_tile')
  //   .attr('width', params.matrix.rect_width)
  //   .attr('height', params.matrix.rect_height)
  //   .attr('transform', function(d) {
  //     var x_pos = params.matrix.x_scale(d.target) + 0.5*params.viz.border_width;
  //     var y_pos = params.matrix.y_scale(d.source) + 0.5*params.viz.border_width/params.viz.zoom_switch;
  //     return 'translate(' + x_pos + ','+ y_pos +')';
  //   })
  //   .style('fill', function(d) {
  //       return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
  //   })
  //   .transition().delay(delays.enter).duration(duration)
  //   .style('fill-opacity', function(d) {
  //       // calculate output opacity using the opacity scale
  //       var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
  //       return output_opacity;
  //   });


  // d3.select('#clust_group')
    

  // d3.selectAll('.tile')
  //   .on('mouseover',null)
  //   .on('mouseout',null);

  // // redefine mouseover events for tiles 
  // d3.select('#clust_group')
  //   .selectAll('.tile')
    // .on('mouseover', function(p) {
    //   var row_name = p.name.split('_')[0];
    //   var col_name = p.name.split('_')[1];
    //   // highlight row - set text to active if
    //   d3.selectAll('.row_label_text text')
    //     .classed('active', function(d) {
    //       return row_name === d.name;
    //     });

  //     d3.selectAll('.col_label_text text')
  //       .classed('active', function(d) {
  //         return col_name === d.name;
  //       });
  //   })
  //   .on('mouseout', function mouseout() {
  //     d3.selectAll('text').classed('active', false);
  //   })
  //   .attr('title', function(d) {
  //     return d.value;
  //   });



  var labels = Labels(params);


  var row_triangle_ini_group = labels.make_rows( params, row_nodes, reorder, duration );
  var container_all_col      = labels.make_cols( params, col_nodes, reorder, duration );

  Dendrogram('row', params, row_triangle_ini_group, duration);
  Dendrogram('col', params, row_triangle_ini_group, duration);

  // Fade in new gridlines 
  ///////////////////////////
  var row_nodes_names = params.network_data.row_nodes_names;
  var col_nodes_names = params.network_data.col_nodes_names;


  // append horizontal lines
  d3.select('#clust_group')
    .selectAll('.horz_lines')
    .data(row_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class','horz_lines')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(inst_index) + ') rotate(0)';
    })
    .append('line')
    .attr('x1',0)
    .attr('x2',params.viz.clust.dim.width)
    .style('stroke-width', params.viz.border_width/params.viz.zoom_switch+'px')
    .style('stroke','white')
    .attr('opacity',0)
    .transition().delay(delays.enter).duration(2*duration)
    .attr('opacity',1);

  // append vertical line groups
  d3.select('#clust_group')
    .selectAll('.vert_lines')
    .data(col_nodes)
    .enter()
    .append('g')
    .attr('class', 'vert_lines')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
    })
    .append('line')
    .attr('x1', 0)
    .attr('x2', -params.viz.clust.dim.height)
    .style('stroke-width', params.viz.border_width + 'px')
    .style('stroke', 'white')
    .attr('opacity',0)
    .transition().delay(delays.enter).duration(2*duration)
    .attr('opacity',1);

  // // reset resize on expand button click and screen resize 
  // params.initialize_resizing(params);

    // // instantiate zoom object
    // var zoom = Zoom(params);

    // // initialize double click zoom for matrix
    // ////////////////////////////////////////////
    // zoom.ini_doubleclick();

    // if (params.viz.do_zoom) {
    //   d3.select('#main_svg').call(params.zoom);
    // }

}

