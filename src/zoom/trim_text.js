
module.exports = function(params, inst_selection, inst_rc) {

  // trim text that is longer than the container 

  var max_width;
  var inst_zoom;

  var safe_row_trim_text = 0.8;

  if (inst_rc === 'row'){
    max_width = params.norm_label.width.row * safe_row_trim_text;
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


  var inst_text = d3.select(inst_selection)
    .select('text')
    .text();

  var current_num_char;
  if (inst_text.slice(-2)==='..'){
    current_num_char = inst_text.length-2;
  } else {
    current_num_char = inst_text.length;
  }

  // inst_text = inst_text.replace('..','');

  var actual_width = tmp_width;
  var trimmed_text;

  // only scale the available room if the zoom is greater than one 
  // this is for the columns 
  if (inst_zoom > 1){
    actual_width = tmp_width * inst_zoom;
  }

  if (actual_width>max_width){

    d3.select(inst_selection)
      .select('text')
      .text(function(d){

        var original_text = d.name;

        var trim_fraction = max_width/actual_width;

        var keep_num_char = Math.floor(original_text.length*trim_fraction);


        if ( original_text === 'JNWYDREUIEADJDAIFFOF'){
          // console.log('current and keep')
          // console.log(trim_fraction)
          // console.log('keep_num_char' + String(keep_num_char))
          // console.log('curr num char '+ String(current_num_char) )
        }

        // added a character buffer 
        if (keep_num_char < current_num_char-1){
          trimmed_text = original_text.substring(0,keep_num_char)+'..';
        } else {
          trimmed_text = inst_text;
        }


        if ( original_text === 'JNWYDREUIEADJDAIFFOF'){
          // console.log(original_text)
          // console.log(keep_num_char)
          console.log(trimmed_text);
          // console.log('\n\n\n')
        }

        // trimmed_text = original_text;
        return trimmed_text;
      });


  } else if (actual_width < max_width*0.75) {

      // add characters back 
      // wait until the text is 25% smaller than the max area 

      d3.select(inst_selection)  
        .select('text')
        .text(function(d){

          var original_text = d.name;

          var keep_num_char = current_num_char +2;

          trimmed_text = original_text.substring(0,keep_num_char)+'..';

          // if '..' was added to original text 
          if (trimmed_text.length > original_text.length){
            trimmed_text = original_text;
          }

          return trimmed_text;
        });

  }

};
