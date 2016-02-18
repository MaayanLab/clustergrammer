var resize_after_update = require('../reset_size/reset_size_after_update');
var make_rows = require('../labels/make_rows');
var make_cols = require('../labels/make_cols');
var eeu_existing_row = require('./eeu_existing_row');

module.exports = function(params, network_data, delays){

  // remove old tooltips 
  d3.selectAll(params.root+' .d3-tip')
    .remove();

  if (params.matrix.show_tile_tooltips){
    // d3-tooltip - for tiles
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .direction('n')
      .offset([0, 0])
      .html(params.matrix.make_tile_tooltip);

    d3.select(params.root+'.clust_group')
      .call(tip);
    }

  // reposition matrix
  d3.select('.clust_container')
    .attr('transform', 'translate(' +
      params.viz.clust.margin.left + ',' +
      params.viz.clust.margin.top + ')');

  // reposition row container
  d3.select(params.root+' .row_viz_container')
    .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

  // reposition col container
  d3.select(params.root+' .col_label_outer_container')
    .attr('transform', 'translate(0,' + params.norm_label.width.col + ')');

  // reposition col_viz container
  d3.select('.col_viz_outer_container')
    .attr('transform', function() {
        var inst_offset = params.norm_label.width.col + 2;
        return 'translate(0,' + inst_offset + ')';
      });

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

  // exit
  ////////////

  // remove entire rows
  var exiting_rows = d3.select(params.root+' .clust_group')
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
  var move_rows = d3.select(params.root+' .clust_group')
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
  d3.select(params.root+' .clust_group')
    .selectAll('.row')
    .each(function(d) {
      // TODO add tip back to arguments 
      var tmp = this;
      eeu_existing_row(params, d, delays, duration, tmp);
    });


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
  var new_row_groups = d3.select(params.root+' .clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class','row')
    .attr('transform', function(d) {
      var tmp_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(tmp_index) + ')';
    })  ;

  new_row_groups.each(enter_new_rows);

  // make each row in the clustergrao
  function enter_new_rows(ini_inp_row_data) {

    var inp_row_data = ini_inp_row_data.row_data;

    // remove zero values to make visualization faster
    var row_data = _.filter(inp_row_data, function(num) {
      return num.value !== 0;
    });

    // update tiles
    ////////////////////////////////////////////
    var tile = d3.select(this)
      .selectAll('rect')
      .data(row_data, function(d){ return d.col_name; })
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

    if (params.matrix.tile_type == 'updn'){

      // value split
      var row_split_data = _.filter(inp_row_data, function(num){
        return num.value_up != 0 || num.value_dn !=0 ;
      });

      // tile_up
      var new_tiles_up = d3.select(this)
        .selectAll('.tile_up')
        .data(row_split_data, function(d){ return d.col_name; })
        .enter()
        .append('path')
        .attr('class','tile_up')
        .attr('d', function() {

          // up triangle
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand();
          var start_y = 0;
          var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;

          var output_string = 'M' + start_x + ',' + start_y + ', L' +
          start_x + ', ' + final_y + ', L' + final_x + ',0 Z';

          return output_string;
        })
        .attr('transform', function(d) {
          var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
          var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
          return 'translate(' + x_pos + ','+y_pos+')';
        })
        .style('fill', function() {
          return params.matrix.tile_colors[0];
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
        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }
      })
      .on('mouseout', function() {
        d3.selectAll('text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
      });

      new_tiles_up
        .style('fill-opacity',0)
        .transition().delay(delays.enter).duration(duration)
        .style('fill-opacity',function(d){
          var inst_opacity = 0;
          if (Math.abs(d.value_dn)>0){
            inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_up));
          }
          return inst_opacity;
        });


      // tile_dn
      var new_tiles_dn = d3.select(this)
        .selectAll('.tile_dn')
        .data(row_split_data, function(d){return d.col_name;})
        .enter()
        .append('path')
        .attr('class','tile_dn')
        .attr('d', function() {

          // dn triangle
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand();
          var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
          var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;

          var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
          final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';

          return output_string;
        })
        .attr('transform', function(d) {
          var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
          var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
          return 'translate(' + x_pos + ','+y_pos+')';
        })
        .style('fill', function() {
          return params.matrix.tile_colors[1];
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
        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }
      })
      .on('mouseout', function() {
        d3.selectAll('text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
      });

      new_tiles_dn
        .style('fill-opacity',0)
        .transition().delay(delays.enter).duration(duration)
        .style('fill-opacity',function(d){
          var inst_opacity = 0;
          if (Math.abs(d.value_up)>0){
            inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_dn));
          }
          return inst_opacity;
        });

      // remove tiles when splitting is done
      tile
        .each(function(d){
          if ( Math.abs(d.value_up)>0 && Math.abs(d.value_dn)>0 ){
            d3.select(this).remove();
          }
        });

    }

  }

  // var labels = Labels(params);

  make_rows(params, duration);
  make_cols(params, duration);

  // Fade in new gridlines
  ///////////////////////////

  // append horizontal lines
  d3.select(params.root+' .clust_group')
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
  d3.select(params.root+' .clust_group')
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

};
