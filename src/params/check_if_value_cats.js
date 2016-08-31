module.exports = function check_if_value_cats(names_of_cat){

  var super_string = ': ';

  var tmp_cat = names_of_cat[0];

  console.log('\n***********************')

  if ( tmp_cat.indexOf(super_string) > -1 ){
    console.log('does contain super_string')
  } else {
    console.log('does not contain super_string')
  }

  _.each(names_of_cat, function(inst_cat){
    console.log(inst_cat);
  });


};