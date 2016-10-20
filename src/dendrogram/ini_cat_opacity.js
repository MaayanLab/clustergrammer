module.exports = function ini_cat_opacity(viz, inst_rc, cat_rect, inst_cat){

  console.log('initializing cat opacity '+ inst_rc)

  var super_string = ': ';
  var has_title;
  var inst_type = viz.cat_info[inst_rc][inst_cat]['type'];

  // set opacity based on string or value cats
  if (inst_type === 'cat_strings'){

    // opacity is fixed
    cat_rect
      .style('opacity', viz.cat_colors.opacity);

  } else {

    // opacity varies based on value
    cat_rect
      .style('opacity', function(d){

        var cat_value = d[inst_cat];

        if ( cat_value.indexOf(super_string) > -1 ){
          has_title = true;
          cat_value = cat_value.split(super_string)[1];
        }

        cat_value = parseFloat(cat_value);

        return viz.cat_info[inst_rc][inst_cat]['cat_scale'](cat_value);
      });
  }

};