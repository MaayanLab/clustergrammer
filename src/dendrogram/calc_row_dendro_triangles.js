var underscore = require('underscore');

module.exports = function calc_row_dendro_triangles(params){

  var triangle_info = {};
  var inst_level = params.group_level.row;
  var row_nodes = params.network_data.row_nodes;
  var row_nodes_names = params.network_data.row_nodes_names;

  underscore.each(row_nodes, function(inst_node){

    var tmp_group = inst_node.group[inst_level];
    var inst_index = underscore.indexOf(row_nodes_names, inst_node.name);
    var inst_top = params.viz.y_scale(inst_index);
    var inst_bot = inst_top + params.viz.y_scale.rangeBand();

    if ( underscore.has(triangle_info, tmp_group) === false ){
      triangle_info[tmp_group] = {};
      triangle_info[tmp_group].name_top = inst_node.name;
      triangle_info[tmp_group].name_bot = inst_node.name;
      triangle_info[tmp_group].pos_top = inst_top;
      triangle_info[tmp_group].pos_bot = inst_bot;
      triangle_info[tmp_group].pos_mid = (inst_top + inst_bot)/2;
      triangle_info[tmp_group].name = tmp_group;
      triangle_info[tmp_group].all_names = [];
      triangle_info[tmp_group].inst_rc = 'row';
    }

    triangle_info[tmp_group].all_names.push(inst_node.name);

    if (inst_top < triangle_info[tmp_group].pos_top){
      triangle_info[tmp_group].name_top = inst_node.name;
      triangle_info[tmp_group].pos_top = inst_top;
      triangle_info[tmp_group].pos_mid = (inst_top + triangle_info[tmp_group].pos_bot)/2;
    }

    if (inst_bot > triangle_info[tmp_group].pos_bot){
      triangle_info[tmp_group].name_bot = inst_node.name;
      triangle_info[tmp_group].pos_bot = inst_bot;
      triangle_info[tmp_group].pos_mid = (triangle_info[tmp_group].pos_top + inst_bot)/2;
    }

  });

  var group_info = [];

  underscore.each(triangle_info, function(inst_triangle){
    group_info.push(inst_triangle);
  });

  return group_info;
};