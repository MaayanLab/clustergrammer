
module.exports = function(params, inst_selection, inst_rc) {

  // trim text that is longer than the container 
  var max_width;
  var inst_zoom;
  var inst_width;
  var trimmed_text;
  var current_num_char;
  var inst_text;
  var original_text;
  var keep_num_char;

  function trim(){
          inst_text = d3.select(this).text();
          current_num_char = inst_text.length;
          keep_num_char = current_num_char - 4;
          trimmed_text = inst_text.substring(0,keep_num_char)+'..';
          return trimmed_text;
        }

  if (inst_rc === 'row'){
    max_width = params.norm_label.width.row ;
    inst_zoom = params.zoom_behavior.scale();
  } else {
    // the column label has extra length since its rotated
    max_width = params.norm_label.width.col ;
    inst_zoom = params.zoom_behavior.scale()/params.viz.zoom_switch;
  }

  var tmp_width = d3.select(inst_selection)
    .select('text')
    .node()
    .getBBox()
    .width;

  inst_width = tmp_width*inst_zoom;

  if (inst_width > max_width){

    while (inst_width > max_width){

      d3.select(inst_selection)
        .select('text')
        .text( trim );

      tmp_width = d3.select(inst_selection)
        .select('text')
        .node().getBBox().width;

      inst_width = tmp_width*inst_zoom;

    }

  } 

  else if (inst_width < max_width * 0.7 ) {

      // add characters back 
      // wait until the text is 25% smaller than the max area 

      d3.select(inst_selection)  
        .select('text')
        .text(function(d){

          inst_text = d3.select(this).text();

          if (inst_text.slice(-2)==='..'){
            current_num_char = inst_text.length-2;
          } else {
            current_num_char = inst_text.length;
          }
          
          original_text = d.name;
          keep_num_char = current_num_char +2;
          trimmed_text = original_text.substring(0,keep_num_char)+'..';

          // if '..' was added to original text 
          if (trimmed_text.length > original_text.length){
            trimmed_text = original_text;
          }

          return trimmed_text;
        });

  }

};
