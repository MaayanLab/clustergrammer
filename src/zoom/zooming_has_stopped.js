module.exports = function zooming_has_stopped(params){
  
  var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));

  if (inst_zoom === 0){
    var check_stop = Number(d3.select(params.root+' .viz_svg').attr('stopped_zoom'));
    if (check_stop!=0){
      d3.select(params.root+' .viz_svg').attr('stopped_zoom',0);
      console.log('NOT zooming - only run once')
    }
  }

};