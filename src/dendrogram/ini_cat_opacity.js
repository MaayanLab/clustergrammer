module.exports = function ini_cat_opacity(viz, inst_rc, cat_rect, inst_cat, updating=false){

  // debugger;

  var super_string = ': ';
  var inst_type = viz.cat_info[inst_rc][inst_cat].type;

  // set opacity based on string or value cats
  if (inst_type === 'cat_strings'){

    // optionally have categories transition in
    if (updating){
      cat_rect
        .classed('cat_strings', true)
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .style('opacity', viz.cat_colors.opacity);

    } else {
      // opacity is fixed
      cat_rect
        .classed('cat_strings', true)
        .style('opacity', viz.cat_colors.opacity);

    }



  } else {

    // opacity varies based on value
    cat_rect
      .classed('cat_values', true)
      .style('opacity', function(d){

        var unprocessed_val = d[inst_cat];

        var cat_value = get_cat_value(unprocessed_val);

        return viz.cat_info[inst_rc][inst_cat].cat_scale(Math.abs(cat_value));
      })
      .style('fill', function(d){
        var inst_color;

        var cat_value = get_cat_value(d[inst_cat]);

        // get positive and negative colors
        console.log(cat_value)
        if (cat_value > 0){
          console.log('positive')
          inst_color = viz.cat_value_colors[0]
        } else {
          console.log('negative')
          inst_color = viz.cat_value_colors[1]
        }

        return inst_color;
      });
  }

  function get_cat_value(unprocessed_value){
    if (typeof unprocessed_value === 'string'){

      if ( unprocessed_value.indexOf(super_string) > -1 ){
        unprocessed_value = unprocessed_value.split(super_string)[1];
      }
    }

    var cat_value = parseFloat(unprocessed_value);

    return cat_value;
  }

};