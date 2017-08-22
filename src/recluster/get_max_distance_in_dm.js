module.exports = function get_max_tree_distance(dm){

  var max_distance_in_dm = 0;

  _.each(dm, function(row){
    _.each(row, function(inst_val){
      if (isFinite(inst_val)){
        if (inst_val > max_distance_in_dm){
          max_distance_in_dm = inst_val;
        }
      }
    });

  });

  return max_distance_in_dm;

};