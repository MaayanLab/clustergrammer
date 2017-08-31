var cat_tooltip_text = require('./cat_tooltip_text');
var d3_tip_custom = require('../tooltip/d3_tip_custom');
var reset_cat_opacity = require('./reset_cat_opacity');
var ini_cat_opacity = require('./ini_cat_opacity');
// var click_filter_cats = require('./click_filter_cats');
var get_cat_names = require('../categories/get_cat_names');
var underscore = require('underscore');

module.exports = function make_row_cat(cgm, updating=false) {

  var params = cgm.params;

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
      .select('.white_bars')
      .attr('fill', params.viz.background_color)
      .attr('width', params.viz.cat_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });
  }

  // remove old col_cat_tips
  d3.selectAll(params.viz.root_tips + '_row_cat_tip')
    .remove();

  // d3-tooltip
  var cat_tip = d3_tip_custom()
    .attr('class',function(){
      var root_tip_selector = params.viz.root_tips.replace('.','');
      var class_string = root_tip_selector + ' d3-tip '+
                         root_tip_selector + '_row_cat_tip';
      return class_string;
    })
    .direction('e')
    .offset([5,0])
    .style('display','none')
    .html(function(d){
      return cat_tooltip_text(params, d, this, 'row');
    });

  // groups that hold classification triangle and colorbar rect
  d3.select(params.root+' .row_cat_container')
    .selectAll('g')
    .data(params.network_data.row_nodes, function(d){
     return d.name;
    })
    .enter()
    .append('g')
    .attr('class', 'row_cat_group')
    .attr('transform', function(d) {
      var inst_index = underscore.indexOf(params.network_data.row_nodes_names, d.name);
      return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
    });

  d3.select(params.root+' .row_cat_container')
    .selectAll('.row_cat_group')
    .call(cat_tip);


  var cat_rect;
  var inst_selection;

  d3.selectAll(params.root+' .row_cat_group rect')
    .remove();

  if (params.viz.show_categories.row){

    d3.selectAll(params.root+' .row_cat_group')
      .each(function() {

        inst_selection = this;

        underscore.each( params.viz.all_cats.row, function(inst_cat){

          var inst_num = parseInt(inst_cat.split('-')[1], 10);
          var cat_rect_class = 'row_cat_rect_'+String(inst_num);

          if (d3.select(inst_selection).select('.'+cat_rect_class).empty()){
            cat_rect = d3.select(inst_selection)
              .append('rect')
              .attr('class', cat_rect_class)
              .attr('cat', inst_cat);
          } else {
            cat_rect = d3.select(inst_selection)
              .select('.' + cat_rect_class);
          }

          cat_rect
            .attr('width', params.viz.cat_room.symbol_width)
            .attr('height', params.viz.y_scale.rangeBand())
            .style('fill', function(d) {
              var cat_name = d[inst_cat];

              // if (cat_name.indexOf(': ') >= 0){
              //   cat_name = cat_name.split(': ')[1];
              // }

              // console.log(cat_name)

              var inst_color = params.viz.cat_colors.row[inst_cat][cat_name];

              // console.log('inst_color: ' + String(inst_color));
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
            .on('click', function(d){

              if (d3.select(this).classed('cat_strings')){

                var found_names = get_cat_names(params, d, this, 'row');

                $(params.root+' .dendro_info').modal('toggle');
                var group_string = found_names.join(', ');
                d3.select(params.root+' .dendro_info input')
                  .attr('value', group_string);

              }

            })
            .on('mouseover', cat_tip.show)
            .on('mouseout', function(){
              cat_tip.hide(this);
              reset_cat_opacity(params);
              d3.select(this)
                .classed('hovering', false);

              d3.selectAll('.d3-tip')
                .style('display', 'none');
            });

        ini_cat_opacity(params.viz, 'row', cat_rect, inst_cat, updating);

        });

      });
    }

};
