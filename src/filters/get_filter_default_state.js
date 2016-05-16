module.exports = function get_filter_default_state(filter_data, filter_type){

  var default_state = filter_data[filter_type]
    .sort(function(a, b){return b-a;})[0];

  default_state = String(default_state);

  return default_state;
};