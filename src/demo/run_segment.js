
module.exports = function run_segment(params, inst_time, inst_segment){

  setTimeout( inst_segment().run, inst_time, params);
  var inst_duration = inst_segment().get_duration();
  inst_time = inst_time + inst_duration;

  return inst_time;

}