var cat_tooltip_text = require('./cat_tooltip_text');
var d3_tip_custom = require('../tooltip/d3_tip_custom');
var reset_cat_opacity = require('./reset_cat_opacity');

module.exports = function make_row_cat(params) {

  // make or reuse outer container 
  if (d3.select(params.root+' .row_cat_outer_container').empty()){
    d3.select(params.root+' .row_container')
      .append('g')
      .attr('class','row_cat_outer_container')
      .attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)')
      .append('g')
      .attr('class', 'row_cat_container');
  } else {
    d3.select(params.root+' .row_container')
      .select('row_cat_outer_container')
      .attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)');
  }

  // white background 
  if (d3.select(params.root+' .row_cat_container').select('.white_bars').empty()){
    d3.select(params.root+' .row_cat_container')
      .append('rect')
      .attr('class','white_bars')
      .attr('fill', params.viz.background_color)
      .attr('width', params.viz.cat_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });
  } else {
    d3.select(params.root+' .row_cat_container')
      .select('class','white_bars')
      .attr('fill', params.viz.background_color)
      .attr('width', params.viz.cat_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });
  }

  // d3-tooltip 
  var cat_tip = d3_tip_custom()
    .attr('class','d3-tip')
    .direction('e')
    .offset([5,0])
    .style('display','block')
    .html(function(d){
      return cat_tooltip_text(params, d, this, 'row');
    });

  // groups that hold classification triangle and colorbar rect
  var row_cat_group = d3.select(params.root+' .row_cat_container')
    .selectAll('g')
    .data(params.network_data.row_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'row_cat_group')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(params.network_data.row_nodes_names, d.name);
      return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
    });

  d3.select(params.root+' .row_cat_container')
    .selectAll('.row_cat_group')
    .call(cat_tip);

  // add row triangles
  row_cat_group
    .append('path')
    .attr('d', function() {
      var origin_x = params.viz.cat_room.symbol_width - 1;
      var origin_y = 0;
      var mid_x = 1;
      var mid_y = params.viz.y_scale.rangeBand() / 2;
      var final_x = params.viz.cat_room.symbol_width - 1;
      var final_y = params.viz.y_scale.rangeBand();
      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
        mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
      return output_string;
    })
    .attr('fill', '#eee')
    .style('opacity', params.viz.triangle_opacity);

  var cat_rect;
  var inst_selection;

  if (params.viz.show_categories.row){
    d3.selectAll(params.root+' .row_cat_group')
      .each(function() {
    
        inst_selection = this;

        _.each( params.viz.all_cats.row, function(inst_cat){

          var inst_num = parseInt(inst_cat.split('-')[1], 10);
          var cat_rect_class = 'row_cat_rect_'+String(inst_num);

          if (d3.select(inst_selection).select('.'+cat_rect_class).empty()){
            cat_rect = d3.select(inst_selection)
              .append('rect')
              .attr('class', cat_rect_class)
              .attr('cat', inst_cat);
          } else {
            cat_rect = d3.select(inst_selection)
              .select('.'+cat_rect_class);
          }

          cat_rect
            .attr('width', params.viz.cat_room.symbol_width)
            .attr('height', params.viz.y_scale.rangeBand())
            .style('fill', function(d) {
              var inst_color = params.viz.cat_colors.row[inst_cat][d[inst_cat]];
              return inst_color;
            })
            .attr('x', function() {
              var inst_offset = params.viz.cat_room.symbol_width + params.viz.uni_margin/2 ;
              return inst_offset + 'px';
            })
            .attr('transform',function(){
              var cat_room = (params.viz.cat_room.symbol_width + params.viz.cat_room.separation);
              var inst_shift = inst_num * cat_room ;
              return 'translate('+inst_shift+',0)';
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
    }


};
