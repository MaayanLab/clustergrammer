module.exports = function draw_up_tile(params){
  
  var start_x = 0;
  var final_x = params.viz.x_scale.rangeBand();
  var start_y = 0;
  var final_y = params.viz.y_scale.rangeBand() - params.viz.y_scale.rangeBand() /60;

  var output_string = 'M' + start_x + ',' + start_y + ', L' +
  start_x + ', ' + final_y + ', L' + final_x + ',0 Z';

  return output_string;
};