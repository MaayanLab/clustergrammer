module.exports = function check_if_value_cats(names_of_cat){

  var super_string = ': ';

  var tmp_cat = names_of_cat[0];

  var has_title = false;
  var might_have_values = false;
  var all_are_values = false;

  if ( tmp_cat.indexOf(super_string) > -1 ){
    has_title = true;
    tmp_cat = tmp_cat.split(super_string)[1];
  }

  if ( isNaN(tmp_cat) == false ){
    might_have_values = true;
  }

  // check each value for number
  if (might_have_values){

    // the default state is that all are now values, check each one
    all_are_values = true;

    _.each(names_of_cat, function(inst_cat){

      if (has_title){
        inst_cat = inst_cat.split(super_string)[1];
      }

      if ( isNaN(inst_cat) == true ){
        all_are_values = false;
      }

    });

  }

  return all_are_values;

};