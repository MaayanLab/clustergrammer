module.exports = function toggle_play_button(params, show){

  
  if (show === false){
    d3.select(params.root+' .play_button')
    .transition().duration(500)
    .style('opacity', 0);
  } else {
    d3.select(params.root+' .play_button')
      .transition().duration(500)
      .style('opacity', 1);
      
    $.unblockUI();

  }

};