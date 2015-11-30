function update_network(change_view){

  console.log('changing view '+String(change_view.filter));

  // create a new args object 
  //////////////////////////////////////////

  /*
  The original network_data is stored in this.config and will never be 
  overwritten. In order to update the network I need to 
  
  1. Create new network_data object using the filter value and 
  this.config.network_data. I'll use crossfilter to only select links from the 
  original network_data that are connecting the updated nodes. 

  2. Make new_config object by copying the original config and swapping in the 
  updated network_data object. 

  3. Use new_config to make new_params. With new_params and the updated 
  network_data, I can 
  */

  /////////////////////////////
  // new way 
  /////////////////////////////

  // get copy of old params 
  var old_params = this.params;

  // make new_network_data 
  var new_network_data = filter_network_data(this.config.network_data, change_view); 

  // make Deep copy of this.config object 
  var new_config = jQuery.extend(true, {}, this.config);

  // swap in new_network_data
  new_config.network_data = new_network_data;
  // swap in instantaneous order 
  new_config.inst_order = old_params.viz.inst_order;

  // make new params 
  var params = VizParams(new_config);
  var delays = define_enter_exit_delays(old_params, params);

  // ordering - necessary for reordering the function called on button click 
  var reorder = Reorder(params);
  this.reorder = reorder.all_reorder;

  enter_exit_update(params, new_network_data, reorder, delays);

  // update network data in params 
  this.params = params;

  // search functions 
  var gene_search = Search(params, params.network_data.row_nodes, 'name');
  this.get_genes = gene_search.get_entities;
  this.find_gene = gene_search.find_entities;

  // initialize screen resizing - necessary for resizing with new params 
  params.initialize_resizing(params);

  // necessary to have zoom behavior updated on updating clustergram 
  d3.select('#main_svg').call(params.zoom);

  // initialize the double click behavior 
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

  delays.enter  = delays.enter + delays.update ;

  delays.run_transition = true;
  if ( old_params.network_data.links.length > 0.25*params.matrix.def_large_matrix ){
    delays.run_transition = false;
    // delays.update = 0;
    // delays.enter = 0;
  }

  // reduce opacity during update
  d3.select('#main_svg')
    .style('opacity',0.70);

  function finish_update(){
    d3.select('#main_svg')
      .transition().duration(250)
      .style('opacity',1.0);
  }
  setTimeout(finish_update, delays.enter);

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
  var exiting_rows = d3.select('#clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .exit();

  if (delays.run_transition){
    exiting_rows
      .transition().duration(duration)
      .style('opacity',0)
      .remove();
  } else {
    exiting_rows
      .style('opacity',0)
      .remove();
  }


  // move rows 
  var move_rows = d3.select('#clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;});

  if (delays.run_transition){
    move_rows
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d){
        var tmp_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,'+params.matrix.y_scale(tmp_index)+')';
      });
  } else {
    move_rows
      .attr('transform', function(d){
        var tmp_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,'+params.matrix.y_scale(tmp_index)+')';
      });
  }

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

    if (delays.run_transition){
      // exit removing rows 
      cur_row
        .exit()
        .transition().duration(300)
        .attr('fill-opacity',0)
        .remove();
    } else {
      // exit removing rows 
      cur_row
        .exit()
        .attr('fill-opacity',0)
        .remove();
    }

    // update tiles in x direction 
    var update_row_tiles = cur_row
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
      });

    if (delays.run_transition){
      update_row_tiles
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
    } else {
      update_row_tiles
        .attr('width', params.matrix.rect_width)
        .attr('height', params.matrix.rect_height)
        .attr('transform', function(d) {
          if (_.contains(col_nodes_names, d.col_name)){
            var inst_col_index = _.indexOf(col_nodes_names, d.col_name);
            var x_pos = params.matrix.x_scale(inst_col_index) + 0.5*params.viz.border_width; 
            return 'translate(' + x_pos + ',0)';
          }
        });      
    }


    // enter new tiles 
    var new_tiles = cur_row
      .enter()
      .append('rect')
      .attr('class', 'tile row_tile')
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
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
      .attr('fill-opacity',0)
      .attr('transform', function(d){
        var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate('+x_pos+','+y_pos+')';
      });

    if (delays.run_transition){
      new_tiles
        .transition().delay(delays.enter).duration(duration)
        .style('fill', function(d) {
          return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
        })
        .attr('fill-opacity',function(d){
          var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
          return output_opacity;
        });
    } else {
      new_tiles
        .style('fill', function(d) {
          return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
        })
        .attr('fill-opacity',function(d){
          var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
          return output_opacity;
        });
    }

  }


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

  }

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

}

