var calc_col_dendro_triangles = require('./calc_col_dendro_triangles');
module.exports = function make_col_dendro_triangles(params, is_change_group = false){


 var dendro_info = calc_col_dendro_triangles(params);

 console.log(dendro_info);

};