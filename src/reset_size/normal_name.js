module.exports = function normal_name(params, d){
  
  var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
  if (inst_name.length > params.labels.max_label_char){
    inst_name = inst_name.substring(0,params.labels.max_label_char)+'..';
  }
  return inst_name;

};