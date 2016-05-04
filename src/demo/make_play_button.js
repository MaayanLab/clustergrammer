module.exports = function make_play_button(params){

  if (d3.select(params.root+' .play_button').empty()){
    console.log('make play button')
    var play_button = d3.select(params.root+' .viz_svg')
      .append('g')
      .classed('play_button', true);

    var trans_x = 100;
    var trans_y = 100;
    play_button
      .attr('transform', function(){
        return 'translate('+trans_x+','+trans_y+')';
      });
  }

};