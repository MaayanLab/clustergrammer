var get_cat_title = require('../categories/get_cat_title');

// var d3_tip_custom = require('../tooltip/d3_tip_custom');
// var cat_tooltip_text = require('../dendrogram/cat_tooltip_text');

module.exports = function make_row_cat_super_labels(cgm){

  var params = cgm.params;

  var viz = params.viz;
  var extra_x_room = 2.75;

  if (d3.select('.row_cat_label_container').empty()){

    d3.select(cgm.params.viz.viz_svg)
      .append('g')
      .classed('row_cat_label_container', true);

    // append background section for optional value-bars (e.g. enrichment pvals)
    d3.select(cgm.params.viz.viz_svg + ' .row_cat_label_container')
      .append('g')
      .classed('row_cat_label_bars', true);
  }


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


  // clear old categories
  d3.selectAll(params.root+' .row_cat_label_container text').remove();
  d3.selectAll(params.root+' .row_cat_label_bars rect').remove();

  // // d3-tooltip
  // var cat_tip = d3_tip_custom()
  //   .attr('class',function(){
  //     var root_tip_selector = params.viz.root_tips.replace('.','');
  //     var class_string = root_tip_selector + ' d3-tip row_cat_tip_super';
  //     return class_string;
  //   })
  //   .direction('e')
  //   .offset([5,0])
  //   .style('display','block')
  //   .style('opacity', 1)
  //   .html(function(d){
  //     console.log('mouseover title d: ' + d)
  //     // return cat_tooltip_text(params, d, this, 'row');
  //     return get_cat_title(viz, d, 'row');
  //   });


  // do not show row label categories if you are viewing a similarity matrix
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
      // .on('mouseover', cat_tip.show)


    // // optional bar behind name
    // ///////////////////////////////
    // d3.select('.row_cat_label_bars')
    //   .append('rect')
    //   .style('height','12px')
    //   .style('width','70px')
    //   .style('opacity',0.5)
    //   .attr('transform', function(d){
    //     // var inst_y = extra_y_room*viz.cat_room.symbol_width
    //     //   * parseInt( d.split('-')[1], 10 );
    //     var inst_y = -10;
    //     return 'translate(0,'+inst_y+')';
    //   });


  }

  // // disable mouseover
  // //////////////////////////////////////
  // d3.select(params.root+' .row_cat_label_container')
  //   .selectAll('.row_cat_super')
  //   .call(cat_tip);

};