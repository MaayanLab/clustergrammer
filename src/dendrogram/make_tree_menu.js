var recluster = require('../recluster/recluster');

module.exports = function make_tree_menu(cgm){

  var params = cgm.params;
  var menu_width = 475;

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
    .attr('opacity', 0.95);

  // tree_menu
  tree_menu
    .append('text')
    .classed('tree_menu_title', true)
    .attr('transform', 'translate(20,30)')
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('font-size','18px')
    .attr('font-weight', 800)
    .attr('cursor', 'default')
    .text('Clustering Menu');

  // menu options
  var possible_distances = ['cosine', 'euclidean', 'correlation', 'jaccard'];
  var vertical_space = 30;
  var menu_y_offset = 110;
  var distance_line_offset = 80;

  tree_menu
    .append('text')
    .attr('transform', 'translate(25, 70)')
    .attr('font-size', '18px')
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .style('cursor', 'default')
    .text('Distance Metric');

  tree_menu
    .append('rect')
    .classed('tree_menu_line', true)
    .attr('height', '2px')
    .attr('width','435px')
    .attr('stroke-width', '3px')
    .attr('opacity', 0.3)
    .attr('fill', 'black')
    .attr('transform', 'translate(20,' + distance_line_offset + ')');

  var distance_section = tree_menu
    .append('g')
    .attr('transform', 'translate(20,'+menu_y_offset+')')
    .classed('distance_section', true);

  var distance_groups = distance_section
    .selectAll('g')
    .data(possible_distances)
    .enter()
    .append('g')
    .attr('transform', function(d,i){
      var vert = i * vertical_space;
      var transform_string = 'translate(0,'+ vert + ')';
      return transform_string;
    })
    .on('click', function(d){

      // if (d === 'euclidean'){
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
      // }

    });

  distance_groups
    .append('circle')
    .attr('cx', 10)
    .attr('cy', -6)
    .attr('r', 7)
    .style('stroke', '#A3A3A3')
    .style('stroke-width', '2px')
    .style('fill',function(d){
      var inst_color = 'white';
      if (d === cgm.params.matrix.distance_metric){
        inst_color = 'red';
      }

      return inst_color;
    });

  distance_groups
    .append('text')
    .attr('transform', 'translate(25,0)')
    .style('font-size','16px')
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .style('cursor', 'default')
    .text(function(d){
      return capitalizeFirstLetter(d);
    });


  function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  ///////////////////////////////////////////////////////
};