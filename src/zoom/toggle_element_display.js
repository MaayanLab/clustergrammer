module.exports = function toggle_element_display(vis_area, inst_selection){

  var inst_trans = d3.select(inst_selection)
    .attr('transform');

  var y_trans = Number(inst_trans.split(',')[1].split(')')[0]);

  d3.select(inst_selection)
    .style('display',function(){
      var inst_display;
      if (y_trans < vis_area.max_y && y_trans > vis_area.min_y){
        inst_display = 'block';
      } else {
        inst_display = 'none';
      }
      return inst_display;
    });  

};