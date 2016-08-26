var get_cat_title = require('../categories/get_cat_title');

module.exports = function make_row_cat_super_labels(cgm){

  var params = cgm.params;

  var viz = params.viz;
  var extra_x_room = 2.75;

  if (d3.select('.row_cat_label_container').empty()){
    d3.select(cgm.params.viz.viz_svg)
      .append('g')
      .classed('row_cat_label_container', true);
  }

  d3.selectAll(params.root+' .row_cat_label_container text')
    .remove();

  var x_offset = viz.clust.margin.left + viz.clust.dim.width + viz.uni_margin;
  var y_offset = viz.norm_labels.margin.top + viz.norm_labels.width.col
    + 2.5*viz.uni_margin;
  var cat_text_size = 1.15*viz.cat_room.symbol_width;
  var cat_super_opacity = 0.65;
  var extra_y_room = 1.25;

  d3.select(params.root+' .row_cat_label_container')
    .attr('transform', function(){
      x_offset = viz.norm_labels.margin.left + viz.norm_labels.width.row
        + viz.cat_room.symbol_width + extra_x_room * viz.uni_margin;
      y_offset = viz.clust.margin.top - viz.uni_margin;
      return 'translate('+x_offset+','+y_offset+') rotate(-90)';
    });


  d3.selectAll(params.root+' .row_cat_label_container text').remove();

  if (viz.sim_mat === false){

    d3.select(params.root+' .row_cat_label_container')
      .selectAll()
      .data(viz.all_cats.row)
      .enter()
      .append('text')
      .classed('row_cat_super',true)
      .style('font-size', cat_text_size+'px')
      .style('opacity', cat_super_opacity)
      .style('cursor','default')
      .attr('transform', function(d){
        var inst_y = extra_y_room*viz.cat_room.symbol_width
          * parseInt( d.split('-')[1], 10 );
        return 'translate(0,'+inst_y+')';
      })
      .text(function(d){
        return get_cat_title(viz, d, 'row');
      });

  }
};