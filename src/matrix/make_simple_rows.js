module.exports = function make_simple_rows(params, ini_inp_row_data, tip, row_selection) {

  var inp_row_data = ini_inp_row_data.row_data;

  // value: remove zero values to make visualization faster
  var row_values = _.filter(inp_row_data, function(num) {
    return num.value !== 0;
  });

  var timeout;
  var delay = 1000;

  // generate tiles in the current row
  var tile = d3.select(row_selection)
    .selectAll('rect')
    .data(row_values, function(d){ return d.col_name; })
    .enter()
    .append('rect')
    .attr('class', 'tile row_tile')
    .attr('width', params.viz.rect_width)
    .attr('height', params.viz.rect_height)
    // switch the color based on up/dn value
    .style('fill', function(d) {
      return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
    })
    .on('mouseover', function(p) {

      d3.select(this)
        .classed('hovering', true);

      // highlight row - set text to active if
      d3.selectAll(params.root+' .row_label_group text')
        .classed('active', function(d) {
          return p.row_name.replace(/_/g, ' ') === d.name;
        });

      d3.selectAll(params.root+' .col_label_text text')
        .classed('active', function(d) {
          return p.col_name === d.name;
        });

      var inst_selection = this;
      var context = this;
      var args = [].slice.call(arguments);
      args.push(this);
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        var is_hovering = d3.select(inst_selection).classed('hovering');
        if (is_hovering){
          d3.selectAll('.d3-tip')
            .style('display','block');
          tip.show.apply(context, args);
        }
      }, delay, inst_selection); 

    })
    .on('mouseout', function() {
      d3.select(this)
        .classed('hovering',false);
      d3.selectAll(params.root+' text').classed('active', false);
      tip.hide();
    })
    .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
      return output_opacity;
    })
    .attr('transform', function(d) {
      var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width;
      var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
      return 'translate(' + x_pos + ','+y_pos+')';
    });

  if (params.matrix.tile_type == 'updn'){

    // value split
    var row_split_data = _.filter(inp_row_data, function(num){
      return num.value_up != 0 || num.value_dn !=0 ;
    });

    // tile_up
    d3.select(row_selection)
      .selectAll('.tile_up')
      .data(row_split_data, function(d){return d.col_name;})
      .enter()
      .append('path')
      .attr('class','tile_up')
      .attr('d', function() {

        // up triangle
        var start_x = 0;
        var final_x = params.viz.x_scale.rangeBand();
        var start_y = 0;
        var final_y = params.viz.y_scale.rangeBand() - params.viz.y_scale.rangeBand() /60;

        var output_string = 'M' + start_x + ',' + start_y + ', L' +
        start_x + ', ' + final_y + ', L' + final_x + ',0 Z';

        return output_string;
      })
      .attr('transform', function(d) {
        var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width;
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate(' + x_pos + ','+y_pos+')';
      })
      .style('fill', function() {
        return params.matrix.tile_colors[0];
      })
      .style('fill-opacity',function(d){
        var inst_opacity = 0;
        if (Math.abs(d.value_dn)>0){
          inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_up));
        }
        return inst_opacity;
      })
      .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll(params.root+' .row_label_group text')
          .classed('active', function(d) {
            return p.row_name.replace(/_/g, ' ') === d.name;
          });

        d3.selectAll(params.root+' .col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });
        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }
      })
      .on('mouseout', function() {
        d3.selectAll(params.root+' text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
      });

    // tile_dn
    d3.select(row_selection)
      .selectAll('.tile_dn')
      .data(row_split_data, function(d){return d.col_name;})
      .enter()
      .append('path')
      .attr('class','tile_dn')
      .attr('d', function() {

        // dn triangle
        var start_x = 0;
        var final_x = params.viz.x_scale.rangeBand();
        // var start_y = params.viz.y_scale.rangeBand() - params.viz.y_scale.rangeBand() /60;
        var start_y = params.viz.y_scale.rangeBand();
        // var final_y = params.viz.y_scale.rangeBand() - params.viz.y_scale.rangeBand() /60;
        var final_y = params.viz.y_scale.rangeBand();

        var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
        final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';

        return output_string;
      })
      .attr('transform', function(d) {
        var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width;
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate(' + x_pos + ','+y_pos+')';
      })
      .style('fill', function() {
        return params.matrix.tile_colors[1];
      })
      .style('fill-opacity',function(d){
        var inst_opacity = 0;
        if (Math.abs(d.value_up)>0){
          inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_dn));
        }
        return inst_opacity;
      })
      .on('mouseover', function(p) {
      // highlight row - set text to active if
      d3.selectAll(params.root+' .row_label_group text')
        .classed('active', function(d) {
          return p.row_name.replace(/_/g, ' ') === d.name;
        });

      d3.selectAll(params.root+' .col_label_text text')
        .classed('active', function(d) {
          return p.col_name === d.name;
        });
      if (params.matrix.show_tile_tooltips){
        tip.show(p);
      }
    })
    .on('mouseout', function() {
      d3.selectAll(params.root+' text').classed('active', false);
      if (params.matrix.show_tile_tooltips){
        tip.hide();
      }
    });

    // remove rect when tile is split 
    tile
      .each(function(d){
        if ( Math.abs(d.value_up)>0 && Math.abs(d.value_dn)>0 ){
          d3.select(this).remove();
        }
      });

  }

  // append title to group
  if (params.matrix.tile_title) {
    tile.append('title')
    .text(function(d) {
      var inst_string = 'value: ' + d.value;
      return inst_string;
    });
  }

};