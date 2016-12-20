module.exports = function calc_row_dendro_triangles(params){

  var triangle_info = {};
  var inst_level = params.group_level.row;
  var row_nodes = params.network_data.row_nodes;
  var row_nodes_names = params.network_data.row_nodes_names;

  _.each(row_nodes, function(d){

    // console.log('row_node '+d.name)

    var tmp_group = d.group[inst_level];
    var inst_index = _.indexOf(row_nodes_names, d.name);
    var inst_top = params.viz.y_scale(inst_index);
    var inst_bot = inst_top + params.viz.y_scale.rangeBand();

    if ( _.has(triangle_info, tmp_group) === false ){
      triangle_info[tmp_group] = {};
      triangle_info[tmp_group].name_top = d.name;
      triangle_info[tmp_group].name_bot = d.name;
      triangle_info[tmp_group].pos_top = inst_top;
      triangle_info[tmp_group].pos_bot = inst_bot;
      triangle_info[tmp_group].pos_mid = (inst_top + inst_bot)/2;
      triangle_info[tmp_group].name = tmp_group;
      triangle_info[tmp_group].all_names = [];
      triangle_info[tmp_group].inst_rc = 'row';
    }

    triangle_info[tmp_group].all_names.push(d.name);

    if (inst_top < triangle_info[tmp_group].pos_top){
      triangle_info[tmp_group].name_top = d.name;
      triangle_info[tmp_group].pos_top = inst_top;
      triangle_info[tmp_group].pos_mid = (inst_top + triangle_info[tmp_group].pos_bot)/2;
    }

    if (inst_bot > triangle_info[tmp_group].pos_bot){
      triangle_info[tmp_group].name_bot = d.name;
      triangle_info[tmp_group].pos_bot = inst_bot;
      triangle_info[tmp_group].pos_mid = (triangle_info[tmp_group].pos_top + inst_bot)/2;
    }

  });

  var group_info = [];

  _.each(triangle_info, function(d){
    group_info.push(d);
  });

  return group_info;
};