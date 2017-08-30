var recluster = require('../recluster/recluster');
var button_section = require('./make_tree_menu_button_section');

module.exports = function make_tree_menu(cgm){

  var params = cgm.params;
  var menu_width = 400;

  // make tree menu (state is in cgm, remade each time)
  /////////////////////////////////////////////////////
  var tree_menu = d3.select(params.root+' .viz_svg')
    .append('g')
    .attr('transform', function(){
      var shift = {};
      shift.x = params.viz.clust.dim.width + params.viz.clust.margin.left - menu_width + 25;
      shift.y = params.viz.clust.margin.top;
      return 'translate(' + shift.x + ', ' + shift.y + ')';
    })
    .classed('tree_menu', true);

  tree_menu
    .attr('opacity', 0.0)
    .transition()
    .attr('opacity', 1.0);

  var menu_opacity = 0.95;

  tree_menu
    .append('rect')
    .classed('tree_menu_background', true)
    .attr('width', function(){
      var inst_width = menu_width;
      return inst_width;
    })
    .attr('height', function(){
      var inst_height = 500;
      return inst_height;
    })
    .attr('fill', 'white')
    .attr('stroke', '#A3A3A3')
    .attr('stroke-width', '3px')
    .attr('opacity', menu_opacity);

  // Clustering Parameters
  tree_menu
    .append('text')
    .classed('tree_menu_title', true)
    .attr('transform', 'translate(20,30)')
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('font-size','18px')
    .attr('font-weight', 800)
    .attr('cursor', 'default')
    .text('Clustering Parameters');


var reorder_click = function(d){

      // toggle tree menu
      d3.select(params.root+' .tree_menu')
        .transition(700)
        .attr('opacity', 0);
      setTimeout(function(){
        d3.select(params.root+' .tree_menu')
          .remove();
      }, 700);

      // update distance metric
      cgm.params.matrix.distance_metric = d;

      recluster(cgm, d);

    }

  var button_info = {};
  button_info.cgm = cgm;
  button_info.tree_menu = tree_menu;
  button_info.menu_width = menu_width;

  // linkage
  /////////////////
  var distance_names = ['cosine', 'euclidean', 'correlation'];
  button_info.name = 'Distance Metric';
  button_info.y_offset = 65;
  button_info.x_offset = 0;
  button_section(button_info, distance_names, reorder_click)

  // linkage
  /////////////////
  var linkage_names = ['average', 'single', 'complete'];
  button_info.name = 'Linkage Type';
  button_info.y_offset = 65;
  button_info.x_offset = 200;
  button_section(button_info, linkage_names, reorder_click)

  // // linkage
  // /////////////////
  // var linkage_names = ['average', 'single', 'complete'];
  // button_info.name = 'Linkage Type';
  // button_info.y_offset = 65;
  // button_info.x_offset = 200;
  // button_section(button_info, linkage_names, reorder_click)

  ///////////////////////////////////////////////////////
};