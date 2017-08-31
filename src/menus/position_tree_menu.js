module.exports = function position_tree_menu(cgm){

  var params = cgm.params;

  if (d3.select(params.root+' .tree_menu').empty() === false){

    var menu_width = cgm.params.viz.tree_menu_width;

    d3.select(params.root+' .tree_menu')
      .attr('transform', function(){
        var shift = {};
        shift.x = params.viz.clust.dim.width + params.viz.clust.margin.left - menu_width + 30;
        shift.y = params.viz.clust.margin.top + 15;
        return 'translate(' + shift.x + ', ' + shift.y + ')';
      });

  }
};