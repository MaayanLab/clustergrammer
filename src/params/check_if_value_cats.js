var underscore = require('underscore');

module.exports = function check_if_value_cats(cat_states){

  var tmp_cat = cat_states[0];

  var has_title = false;
  var might_have_values = false;
  var cat_types = 'cat_strings';
  var max_abs_val = NaN;
  var all_values = [];
  var cat_scale = null;

  var super_string = ': ';

  if (typeof tmp_cat === 'string'){
    if ( tmp_cat.indexOf(super_string) > -1 ){
      has_title = true;
      tmp_cat = tmp_cat.split(super_string)[1];
    }
  }

  if ( isNaN(tmp_cat) == false ){
    might_have_values = true;
  }

  // check each value for number
  if (might_have_values){

    // the default state is that all are now values, check each one
    cat_types = 'cat_values';

    underscore.each(cat_states, function(inst_cat){

      if (has_title){
        inst_cat = inst_cat.split(super_string)[1];
      }

      // checking whether inst_cat is 'not a number'
      if ( isNaN(inst_cat) === true ){
        cat_types = 'cat_strings';
      } else {
        inst_cat = parseFloat(inst_cat);
        all_values.push(inst_cat);
      }

    });

  }

  if (cat_types === 'cat_values'){

    // get absolute value
    var max_value = underscore.max(all_values, function (d) {
      return Math.abs(d);
    });

    max_abs_val = Math.abs(max_value);

    cat_scale = d3.scale.linear().domain([0, max_abs_val]).range([0,1]);
  }

  var inst_info = {};
  inst_info.type = cat_types;
  inst_info.max_abs_val = max_abs_val;
  inst_info.cat_scale = cat_scale;

  return inst_info;

};