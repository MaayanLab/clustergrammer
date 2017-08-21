var position_svg_dendro_slider = require('./position_svg_dendro_slider');

module.exports = function build_svg_tree_icon(cgm, inst_rc){

  inst_rc = 'row';

  var slider_length = 40;
  var clicks = 0;

  var params = cgm.params;
  var offset = 7;

  var tree_icon_group = d3.select(params.root +' .viz_svg')
      .append('g')
      .classed( inst_rc + '_tree_group', true)
      .append('g')
      .classed('dendro_tree_container', true)
      .on('click', function(){

        if (d3.select(params.root+' .tree_menu').empty()){
          var tree_menu = d3.select(params.root+' .viz_svg')
            .append('g')
            .attr('transform', function(){
              var shift = {}
              shift.x = params.viz.clust.margin.left/2;
              shift.y = params.viz.clust.margin.top/2;
              return 'translate(' + shift.x + ', ' + shift.y + ')';
            })
            .classed('tree_menu', true);

          tree_menu
            .append('rect')
            .classed('tree_menu_background', true)
            .attr('width', function(){
              var inst_width = params.viz.clust.dim.width + params.viz.clust.margin.left/1.5;
              return inst_width;
            })
            .attr('height', function(){
              var inst_height = 500;
              return inst_height;
            })
            .attr('fill', 'white')
            .attr('opacity', 0.95)
            .attr('stroke', '#A3A3A3')
            .attr('stroke-width', '3px');

        } else {
          d3.select(params.root+' .tree_menu').remove();
        }


      })

  // // distinguish double from single clicks
  // /////////////////////////////////////////
  // jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
  //     return this.each(function() {
  //         var clicks = 0,
  //             self = this;
  //         jQuery(this).click(function(event) {
  //             clicks++;
  //             if (clicks == 1) {
  //                 setTimeout(function() {
  //                     if (clicks == 1) {
  //                         single_click_callback.call(self, event);
  //                     } else {
  //                         double_click_callback.call(self, event);
  //                     }
  //                     clicks = 0;
  //                 }, timeout || 300);
  //             }
  //         });
  //     });
  // }

  // $(params.root + ' .viz_svg').single_double_click(function() {
  //     console.log('single click')
  // }, function() {
  //     console.log('double click')
  // });

  d3.select(params.root + ' .dendro_tree_container')
    .attr('transform', 'scale(0.9)');

  position_svg_dendro_slider(cgm, inst_rc);

  var rect_height = slider_length + 20;
  var rect_width = 30;
  tree_icon_group
    .append('rect')
    .classed(inst_rc+'_slider_background', true)
    .attr('height', rect_height+'px')
    .attr('width', rect_width+'px')
    .attr('fill', params.viz.background_color)
    .attr('transform', function(){
      var translate_string = 'translate(-10, -5)';
      return translate_string;
    })
    .style('opacity', 0);

  tree_icon_group
    .append("line")
    .style('stroke-width', slider_length/7+'px')
    .style('stroke', 'black')
    .style('stroke-linecap', 'round')
    .style('opacity', 0.0)
    .attr("y1", 0)
    .attr("y2", function(){
      return slider_length-2;
    });

  var offset_triangle = 0; // -slider_length/40;
  var tree_width = 20;

  // main branch
  tree_icon_group
    .append('path')
    .style('fill', 'black')
    .attr('transform', 'translate('+offset_triangle+', 0)')
    .attr('d', function() {

      // up triangle
      var start_x = 0;
      var start_y = slider_length;

      var mid_x = tree_width/2;//left_x + slider_length/10;
      var mid_y = 0;

      var final_x = tree_width;//left_x + slider_length/5;
      var final_y = slider_length;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L'
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    .style('opacity', 0.35)
    .on('mouseover', function(){
      d3.selectAll(params.root + ' .tree_leaf_circle').style('opacity', high_opacity);
    })
    .on('mouseout', function(){
      d3.selectAll(params.root + ' .tree_leaf_circle').style('opacity', default_opacity);
    });

  // left branch
  var branch_height = 30;
  tree_icon_group
    .append('path')
    .style('fill', 'black')
    .attr('transform', 'translate('+offset_triangle+', 0)')
    .attr('d', function() {

      // up triangle
      var start_x = 4.3;
      var start_y = 23;

      var mid_x = -5;//left_x + slider_length/10;
      var mid_y = branch_height/2.5;

      var final_x = 5.8;//left_x + slider_length/5;
      var final_y = branch_height/1.8;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L'
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    .style('opacity', 0.35)
    .on('mouseover', function(){
      d3.selectAll(params.root + ' .tree_leaf_circle').style('opacity', high_opacity);
    })
    .on('mouseout', function(){
      d3.selectAll(params.root + ' .tree_leaf_circle').style('opacity', default_opacity);
    });


  // right branch
  tree_icon_group
    .append('path')
    .style('fill', 'black')
    .attr('transform', 'translate('+offset_triangle+', 0)')
    .attr('d', function() {

      // up triangle
      var start_x = 15.7;
      var start_y = 23;

      var mid_x = 25;//left_x + slider_length/10;
      var mid_y = branch_height/2.5;

      var final_x = 14.2;//left_x + slider_length/5;
      var final_y = branch_height/1.8;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L'
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    .style('opacity', 0.35)
    .on('mouseover', function(){
      d3.selectAll(params.root + ' .tree_leaf_circle').style('opacity', high_opacity);
    })
    .on('mouseout', function(){
      d3.selectAll(params.root + ' .tree_leaf_circle').style('opacity', default_opacity);
    });

  var default_opacity = 0.35;
  var high_opacity = 0.6;
  var small_leaf_offset = 13;
  var small_leaf_radius = 9.5;

  tree_icon_group
    .selectAll()
    .data([
      [-3,small_leaf_offset,small_leaf_radius],
      [tree_width/2,0, 17],
      [23,small_leaf_offset,small_leaf_radius]])
    .enter()
    .append('circle')
    .classed('tree_leaf_circle', true)
    .attr('r', function(d){
      return d[2];
    })
    .attr('transform', function(d){
      return 'translate('+d[0]+', '+d[1]+')';
    })
    .style('fill', 'blue')
    .style('opacity', default_opacity)
    .on('mouseover', function(){
      d3.selectAll(params.root + ' .tree_leaf_circle').style('opacity', high_opacity);
    })
    .on('mouseout', function(){
      d3.selectAll(params.root + ' .tree_leaf_circle').style('opacity', default_opacity);
    });


};
