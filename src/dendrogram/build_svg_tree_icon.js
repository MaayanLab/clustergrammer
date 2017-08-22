var position_svg_dendro_slider = require('./position_svg_dendro_slider');
var d3_tip_custom = require('../tooltip/d3_tip_custom');
var toggle_tree_menu = require('./toggle_tree_menu');

module.exports = function build_svg_tree_icon(cgm, inst_rc){

  inst_rc = 'row';

  var slider_length = 40;
  var params = cgm.params;
  var default_opacity = 0.35;
  var high_opacity = 0.6;

  // d3-tooltip
  var tree_menu_tip = d3_tip_custom()
    .attr('class', function(){
      var root_tip_selector = params.viz.root_tips.replace('.','');
      var class_string = root_tip_selector + '_tree_menu_tip d3-tip';
      return class_string;
    })
    .direction('sw')
    .style('display', 'none')
    .offset([-10,-5])
    .html(function(){
      return 'Clustering Menu';
    });

  var tree_icon_outer_group = d3.select(params.root +' .viz_svg')
      .append('g')
      .classed( inst_rc + '_tree_group', true)
      .on('mouseover', function(){

        // only if no menu is showing
        if (d3.select(params.root+' .tree_menu').empty()){

          d3.selectAll( params.viz.root_tips + '_tree_menu_tip')
            .style('opacity', 1)
            .style('display', 'block');

          tree_menu_tip.show();

        }

        d3.selectAll(params.root + ' .tree_leaf_circle')
          .style('opacity', high_opacity);
      })
      .on('mouseout', function(){
        tree_menu_tip.hide();
        d3.selectAll(params.root + ' .tree_leaf_circle')
        .style('opacity', default_opacity);
      })
      .call(tree_menu_tip);

  var tree_icon_group =  tree_icon_outer_group
    .append('g')
    .classed('dendro_tree_container', true)
    .on('click', function(){

      if (d3.select(params.root+' .tree_menu').empty()){

        toggle_tree_menu(cgm, 'open');

        tree_menu_tip.hide();

      } else {

        toggle_tree_menu(cgm, 'close');

      }
    });

  d3.select(params.root + ' .dendro_tree_container')
    .attr('transform', 'scale(0.9)');

  position_svg_dendro_slider(cgm, inst_rc);

  var offset_triangle = 0;
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
    .style('opacity', 0.35);

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
    .style('opacity', 0.35);

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
    .style('opacity', 0.35);

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
    .attr('fill', 'blue')
    .attr('opacity', default_opacity)
    .attr('');

  tree_icon_group
    .append('rect')
    .attr('width', 50)
    .attr('height', 62)
    .attr('transform', function(){
      return 'translate('+ -15 +', '+ -19 +')';
    })
    .attr('opacity', 0.0);

};
