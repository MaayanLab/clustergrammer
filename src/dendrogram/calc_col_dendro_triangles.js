var underscore = require('underscore');

module.exports = function calc_col_dendro_triangles(params){

  var triangle_info = {};
  var inst_level = params.group_level.col;
  var col_nodes = params.network_data.col_nodes;
  var col_nodes_names = params.network_data.col_nodes_names;

  underscore.each(col_nodes, function(d){

    var tmp_group = d.group[inst_level];
    var inst_index = underscore.indexOf(col_nodes_names, d.name);
    var inst_top = params.viz.x_scale(inst_index);
    var inst_bot = inst_top + params.viz.x_scale.rangeBand();

    if ( underscore.has(triangle_info, tmp_group) === false){
      triangle_info[tmp_group] = {};
      triangle_info[tmp_group].name_top = d.name;
      triangle_info[tmp_group].name_bot = d.name;
      triangle_info[tmp_group].pos_top = inst_top;
      triangle_info[tmp_group].pos_bot = inst_bot;
      triangle_info[tmp_group].pos_mid = (inst_top + inst_bot)/2;
      triangle_info[tmp_group].name = tmp_group;
      triangle_info[tmp_group].all_names = [];
      triangle_info[tmp_group].inst_rc = 'col';
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

  underscore.each(triangle_info, function(d){
    group_info.push(d);
  });

  return group_info;

};