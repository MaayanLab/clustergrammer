module.exports = function check_if_value_cats(names_of_cat){

  console.log('checking if there are value cats')

  var super_string = ': ';

  var tmp_cat = names_of_cat[0];

  var has_title = false;
  var might_have_values = false;
  var cat_types = 'cat_strings';

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
    cat_types = 'cat_values';

    _.each(names_of_cat, function(inst_cat){

      if (has_title){
        inst_cat = inst_cat.split(super_string)[1];
      }

      // checking whether inst_cat is 'not a number'
      if ( isNaN(inst_cat) == true ){
        cat_types = 'cat_strings';
      }

    });

  }


  // // use something like this to get abs max value
  // matrix.max_link = _.max(network_data.links, function (d) {
  //   return Math.abs(d.value);
  // }).value;
  // matrix.abs_max_val = Math.abs(matrix.max_link) * params.clamp_opacity;


  return cat_types;

};