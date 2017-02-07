module.exports = function check_zoom_stop_status(params){

  var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));

  var check_stop = Number(d3.select(params.root+' .viz_svg')
                             .attr('stopped_zoom'));

  var stop_attributes = false;
  if (inst_zoom === 0 && check_stop != 0){
    stop_attributes = true;
  }

  return stop_attributes;
};