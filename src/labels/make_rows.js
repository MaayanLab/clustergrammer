var utils = require('../utils');
var add_row_click_hlight = require('./add_row_click_hlight');
var row_reorder = require('../reorder/row_reorder');
var make_row_tooltips = require('./make_row_tooltips');

module.exports = function(params, text_delay) {
  var row_nodes = params.network_data.row_nodes;

  var row_nodes_names = params.network_data.row_nodes_names;
  var row_container;

  // row container holds all row text and row visualizations (triangles rects)
  if ( d3.select(params.viz.viz_svg + ' .row_container').empty() ){
    row_container = d3.select(params.viz.viz_svg)
      .append('g')
      .attr('class','row_container')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.viz.clust.margin.top + ')');
  } else {
    row_container = d3.select(params.viz.viz_svg)
      .select('.row_container')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.viz.clust.margin.top + ')');
  }

  if (d3.select(params.root+' .row_white_background').empty()){
    row_container
      .append('rect')
      .classed('row_white_background',true)
      .classed('white_bars',true)
      .attr('fill', params.viz.background_color)
      .attr('width', params.norm_label.background.row)
      .attr('height', 30*params.viz.clust.dim.height + 'px');
  }

  if ( d3.select(params.root +' .row_label_container').empty() ){
    // container to hold text row labels
    row_container
      .append('g')
      .attr('class','row_label_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)')
      .append('g')
      .attr('class', 'row_label_zoom_container');
  } else {
    // container to hold text row labels
    row_container
      .select(params.root+' .row_label_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');
  }


  var row_labels = d3.select(params.root+' .row_label_zoom_container')
    .selectAll('g')
    .data(row_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'row_label_group')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
    });

  d3.select(params.root+' .row_label_zoom_container')
    .selectAll('.row_label_group')
    .on('dblclick', function(d) {
      row_reorder(params, this);
      if (params.tile_click_hlight){
        add_row_click_hlight(this,d.ini);
      }
    });

  make_row_tooltips(params);

  // append rectangle behind text
  row_labels
    .insert('rect')
    .style('opacity', 0);

  // append row label text
  row_labels
    .append('text')
    .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 )
    .attr('text-anchor', 'end')
    .style('font-size', params.labels.default_fs_row + 'px')
    .text(function(d){ return utils.normal_name(d); })
    .attr('pointer-events','none')
    .style('opacity',0)
    .transition().delay(text_delay).duration(text_delay)
    .style('opacity',1);

  // change the size of the highlighting rects
  row_labels
    .each(function() {
      var bbox = d3.select(this)
          .select('text')[0][0]
        .getBBox();
      d3.select(this)
        .select('rect')
        .attr('x', bbox.x )
        .attr('y', 0)
        .attr('width', bbox.width )
        .attr('height', params.matrix.y_scale.rangeBand())
        .style('fill', function() {
        var inst_hl = 'yellow';
        return inst_hl;
        })
        .style('opacity', function(d) {
        var inst_opacity = 0;
        // highlight target genes
        if (d.target === 1) {
          inst_opacity = 1;
        }
        return inst_opacity;
        });
    });


  // row visualizations - classification triangles and colorbar rects
  var row_cat_outer_container;
  if (d3.select(params.root+' .row_cat_outer_container').empty()){

    row_cat_outer_container = row_container
      .append('g')
      .attr('class','row_cat_outer_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)')
      .append('g')
      .attr('class', 'row_cat_container');

  } else {

    row_cat_outer_container = row_container
      .select('row_cat_outer_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)')
      .append('g')
      .attr('class', 'row_cat_container');

  }

  // white background for triangle
  if (d3.select(params.root+' .row_cat_container').select('.white_bars').empty()){

    row_cat_outer_container
      .append('rect')
      .attr('class','white_bars')
      .attr('fill', params.viz.background_color)
      .attr('width', params.cat_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });

  } else {

    row_cat_outer_container
      .select('class','white_bars')
      .attr('fill', params.viz.background_color)
      .attr('width', params.cat_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });

  }

  // groups that hold classification triangle and colorbar rect
  var row_cat_group = d3.select(params.root+' .row_cat_container')
    .selectAll('g')
    .data(row_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'row_cat_group')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
    });

  // add triangles
  row_cat_group
    .append('path')
    .attr('d', function() {
      var origin_x = params.cat_room.symbol_width - 1;
      var origin_y = 0;
      var mid_x = 1;
      var mid_y = params.matrix.y_scale.rangeBand() / 2;
      var final_x = params.cat_room.symbol_width - 1;
      var final_y = params.matrix.y_scale.rangeBand();
      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
        mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
      return output_string;
    })
    .attr('fill', function(d) {
      // initailize color
      var inst_color = '#eee';
      if (params.labels.show_categories) {
        inst_color = params.labels.class_colors.row[d.cl];
      }
      return inst_color;
    })
    .style('opacity',0)
    .transition().delay(text_delay).duration(text_delay)
    .style('opacity',1);


  if (utils.has(params.network_data.row_nodes[0], 'value')) {

    row_labels
      .append('rect')
      .attr('class', 'row_bars')
      .attr('width', function(d) {
        var inst_value = 0;
        inst_value = params.labels.bar_scale_row( Math.abs(d.value) );
        return inst_value;
      })
      .attr('x', function(d) {
        var inst_value = 0;
        inst_value = -params.labels.bar_scale_row( Math.abs(d.value) );
        return inst_value;
      })
      .attr('height', params.matrix.y_scale.rangeBand() )
      .attr('fill', function(d) {
        return d.value > 0 ? params.matrix.bar_colors[0] : params.matrix.bar_colors[1];
      })
      .attr('opacity', 0.4);

  }

  // add row callback function
  d3.selectAll(params.root+' .row_label_group')
    .on('click',function(d){
      if (typeof params.click_label == 'function'){
        params.click_label(d.name, 'row');
        add_row_click_hlight(params, this, d.ini);
      } else {
        if (params.tile_click_hlight){
          add_row_click_hlight(params, this, d.ini);
        }
      }

    });

};
