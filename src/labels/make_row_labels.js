var utils = require('../Utils_clust');
var add_row_click_hlight = require('./add_row_click_hlight');
var row_reorder = require('../reorder/row_reorder');
var make_row_tooltips = require('./make_row_tooltips');
var underscore = require('underscore');

module.exports = function make_row_labels(cgm, row_names='all', text_delay = 0){

  // console.log('make_row_labels')
  // console.log(row_names)

  var params = cgm.params;
  var row_nodes = [];

  if (row_names === 'all'){
    row_nodes = params.network_data.row_nodes;
  } else {
    underscore.each(params.network_data.row_nodes, function(inst_row){
      // if (_.contains(row_names, inst_row.name)){
      if (underscore.contains(row_names, inst_row.name)){
        row_nodes.push(inst_row);
      }
    });
  }

  // make row labels in row_label_zoom_container, bind row_nodes data
  var row_labels = d3.select(params.root+' .row_label_zoom_container')
    .selectAll('g')
    .data(row_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .classed('row_label_group', true);

  var row_nodes_names = params.network_data.row_nodes_names;
  row_labels
    .attr('transform', function(d) {
         // var inst_index = d.row_index;
         var inst_index = underscore.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
    });

  row_labels
    .on('dblclick', function(d) {

      var data_attr = '__data__';
      var row_name = this[data_attr].name;

      // if (params.sim_mat){
      //   row_reorder(cgm, this, row_name);

      //   d3.selectAll(params.root+' .col_label_text')
      //     .filter(function(d){
      //       return d.name == row_name;}
      //       )[0][0];

      //   // this is causing buggyness may reenable
      //   // col_reorder -> two_translate_zoom -> show_visible_area -> make_row_labels -> col_reorder
      //   // col_reorder(cgm, col_selection, row_name);

      // } else {
      //   row_reorder(cgm, this, row_name);
      // }

      row_reorder(cgm, this, row_name);

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
    .attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row*0.35 )
    .attr('text-anchor', 'end')
    .style('font-size', params.labels.default_fs_row + 'px')
    .text(function(d){ return utils.normal_name(d); })
    .attr('pointer-events','none')
    .style('opacity',0)
    .style('cursor','default')
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
        .attr('height', params.viz.y_scale.rangeBand())
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

  // almost-deprecated row value bars
  ///////////////////////////////
  if (utils.has(params.network_data.row_nodes[0], 'value')) {

    row_labels
      .append('rect')
      .classed('row_bars', true)
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
      .attr('height', params.viz.y_scale.rangeBand() )
      .attr('fill', function(d) {
        return d.value > 0 ? params.matrix.bar_colors[0] : params.matrix.bar_colors[1];
      })
      .attr('opacity', 0.4);

  }

};