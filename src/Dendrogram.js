
/* Dendrogram color bar.
 */
function Dendrogram(type, params) {

  var group_colors = [],
    dom_class,
    i;

  build_color_groups();

  if (type === 'row') {
    dom_class = 'row_class_rect';
    build_row_dendro();
  } else {
    dom_class = 'col_class_rect';
    build_col_dendro();
  }

  function build_color_groups() {
    var max_groups ;
    if ( params.network_data.row_nodes.length > params.network_data.col_nodes.length){
      max_groups = params.network_data.row_nodes;
    } else {
      max_groups = params.network_data.col_nodes;
    }
    for (i = 0; i < params.network_data.row_nodes.length; i++) {
      // grab colors from the list
      if (i === 1) {
        group_colors[i] = Colors.get_default_color();
      } else {
        group_colors[i] = Colors.get_random_color(i);
      }
    }
  }

  /* Changes the groupings (x- and y-axis color bars).
   */
  function change_groups(inst_rc, inst_index) {
    d3.selectAll('.' + dom_class)
      .style('fill', function(d) {
        return group_colors[d.group[inst_index]];
      });

    if (inst_rc==='row'){
      params.group_level.row = inst_index;
    } else if (inst_rc==='col'){
      params.group_level.col = inst_index;
    }

  }

  function color_group(j) {
    return group_colors[j];
  }

  function get_group_color(j) {
    return group_colors[j];
  }

  function build_row_dendro() {

    d3.selectAll('.row_viz_group')
      .each(function(d){

        var inst_level = params.group_level.row;

        var dendro_rect = d3.select(this)
          .append('rect')
          .attr('class', dom_class)
          .attr('width', function() {
            var inst_width = params.class_room.symbol_width - 1;
            return inst_width + 'px';
          })
          .attr('height', params.matrix.y_scale.rangeBand())
          .style('fill', function(d) {
            if (_.has(d,'group')){
              var inst_color = get_group_color(d.group[inst_level]);
            } else {
              inst_color = '#eee';
            }

            return inst_color;
          })
          .attr('x', function() {
            var inst_offset = params.class_room.symbol_width + 1;
            return inst_offset + 'px';
          })

        // show group in modal 
        if (typeof params.click_group === 'function'){
          dendro_rect
            .on('click', function(d){
              var group_nodes_list = get_inst_group('row',d);
              params.click_group('row', group_nodes_list);
            });
        }       

      })

  }

  function build_col_dendro() {

    var col_nodes = params.network_data.col_nodes;
    var col_nodes_names = _.pluck(col_nodes, 'name');

    // append groups - each will hold a classification rect
    var col_class_ini_group = d3.select('.col_viz_zoom_container')
    .selectAll('g')
    .data(col_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'col_viz_group')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
    });

    d3.selectAll('.col_viz_group')
      .each(function(d){

        var inst_level = params.group_level.col;

        var dendro_rect = d3.select(this)
          .append('rect')
          .attr('class', dom_class)
          .attr('width', params.matrix.x_scale.rangeBand())
          .attr('height', function() {
            var inst_height = params.class_room.col - 1;
            return inst_height;
          })
          .style('fill', function(d) {
            if (_.has(d,'group')){
              var inst_color = get_group_color(d.group[inst_level]);
            } else {
              inst_color ='#eee';
            }
            return inst_color;
          });

        if (typeof params.click_group==='function'){
          dendro_rect
            .on('click',function(d){
              var group_nodes_list = get_inst_group('col',d);
              params.click_group('col',group_nodes_list);
            });
        }

    })
  }

  function get_inst_group(inst_rc,d){

    if (inst_rc === 'col'){
      var inst_level = params.group_level.col;
      var inst_nodes = params.network_data.col_nodes;
    } else if (inst_rc==='row') {
      var inst_level = params.group_level.row;
      var inst_nodes = params.network_data.row_nodes;
    }

    var inst_group = d.group[inst_level];
    var group_nodes_list = [];

    _.each(inst_nodes, function(node){
      if (node.group[inst_level] === inst_group){
        group_nodes_list.push(node.name);
      }
    });

    return group_nodes_list;
  }

  return {
    color_group: color_group,
    get_group_color: get_group_color,
    change_groups: change_groups
  };
}
