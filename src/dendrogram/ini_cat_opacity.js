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

        var cat_value = d[inst_cat];

        if (typeof cat_value === 'string'){

          if ( cat_value.indexOf(super_string) > -1 ){
            cat_value = cat_value.split(super_string)[1];
          }
        }

        cat_value = parseFloat(cat_value);

        return viz.cat_info[inst_rc][inst_cat].cat_scale(cat_value);
      });
  }

};