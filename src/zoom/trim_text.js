
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
  var num_trims;

  if (inst_rc === 'row'){
    max_width = params.norm_label.width.row ;
    inst_zoom = params.zoom_behavior.scale();
    num_trims = params.labels.row_max_char;
  } else {
    max_width = params.norm_label.width.col;
    inst_zoom = params.zoom_behavior.scale()/params.viz.zoom_switch;
    num_trims = params.labels.col_max_char;
  }

  var tmp_width = d3.select(inst_selection)
    .select('text')
    .node()
    .getBBox()
    .width;

  inst_width = calc_width(tmp_width, inst_zoom, inst_rc);

  if (inst_width > max_width){

    for (var i=1; i < num_trims; i++){

      if (inst_width > max_width){
        d3.select(inst_selection)
          .select('text')
          .text( trim );

        tmp_width = d3.select(inst_selection)
          .select('text')
          .node().getBBox().width;

        inst_width = calc_width(tmp_width, inst_zoom, inst_rc);

      }
    }
  } 

  else if (inst_width < max_width * 0.75 ) {

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

  function trim(){
          inst_text = d3.select(this).text();
          current_num_char = inst_text.length;
          keep_num_char = current_num_char - 3;
          trimmed_text = inst_text.substring(0,keep_num_char)+'..';
          return trimmed_text;
        }

  function calc_width(tmp_width, inst_zoom, inst_rc){
    if (inst_rc==='row'){
      inst_width = tmp_width * inst_zoom;
    } else {
      if (inst_zoom < 1){
        inst_width = tmp_width;
      } else {
        inst_width = tmp_width * inst_zoom ;
      }
    }
    return inst_width;
  }    

};
