var cat_tooltip_text = require('./cat_tooltip_text');
var d3_tip_custom = require('../tooltip/d3_tip_custom');
var reset_cat_opacity = require('./reset_cat_opacity');

module.exports = function make_col_cat(params) {

  // make or reuse outer container 
  if (d3.select(params.root+' .col_cat_outer_container').empty()){
    d3.select(params.root+' .col_container')
      .append('g')
      .attr('class', 'col_cat_outer_container')
      .attr('transform', function () {
        var inst_offset = params.viz.norm_labels.width.col + 2; 
        return 'translate(0,' + inst_offset + ')'; 
      })
      .append('g')
      .attr('class', 'col_cat_container');
  } else {
    d3.select(params.root+' .col_container')
      .select('col_cat_outer_container')
      .attr('transform', function () {
        var inst_offset = params.viz.norm_labels.width.col + 2; 
        return 'translate(0,' + inst_offset + ')'; 
      });
  }
  
  // d3-tooltip 
  var cat_tip = d3_tip_custom()
    .attr('class', 'd3-tip')
    .direction('s')
    .offset([5,0])
    .style('display','block')
    .html(function(d){
      return cat_tooltip_text(params, d, this, 'col');
    });

  // append groups - each will hold classification rects 
  d3.select(params.root+' .col_cat_container')
    .selectAll('g')
    .data(params.network_data.col_nodes, function(d){ return d.name; })
    .enter()
    .append('g')
    .attr('class', 'col_cat_group')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(params.network_data.col_nodes_names, d.name);
      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
    });

  d3.select(params.root+' .col_cat_container')
    .selectAll('.col_cat_group')
    .call(cat_tip);

  // add category rects 
  d3.selectAll(params.root+' .col_cat_group')
    .each(function() {

      var inst_selection = this;
      var cat_rect;

      _.each( params.viz.all_cats.col, function(inst_cat){

        var inst_num = parseInt(inst_cat.split('-')[1], 10);
        var cat_rect_class = 'col_cat_rect_'+String(inst_num);

        if (d3.select(inst_selection).select('.'+cat_rect_class).empty()){
          cat_rect = d3.select(inst_selection)
            .append('rect')
            .attr('class', cat_rect_class)
            .attr('cat', inst_cat)
            .attr('transform',function(){
              var cat_room = params.viz.cat_room.symbol_width + params.viz.cat_room.separation;
              var inst_shift = inst_num * cat_room;
              return 'translate(0,'+ inst_shift +')';
            });
        } else {
          cat_rect = d3.select(inst_selection)
            .select('.'+cat_rect_class);
        }

        cat_rect
          .attr('width', params.viz.x_scale.rangeBand())
          .attr('height', params.viz.cat_room.symbol_width)
          .style('fill', function(d) {
            return params.viz.cat_colors.col[inst_cat][d[inst_cat]];
          })
          .style('opacity', params.viz.cat_colors.opacity)
          .on('mouseover', cat_tip.show)
          .on('mouseout', function(){

            cat_tip.hide(this);

            reset_cat_opacity(params);

            d3.select(this)
              .classed('hovering', false);  

          });
      });

  });
};
