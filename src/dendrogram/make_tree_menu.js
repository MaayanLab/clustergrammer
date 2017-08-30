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

var button_names = ['cosine', 'euclidean', 'correlation'];

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

  button_section(cgm, tree_menu, menu_width, button_names, reorder_click)

  ///////////////////////////////////////////////////////
};