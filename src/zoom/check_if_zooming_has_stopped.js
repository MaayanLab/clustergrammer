var run_when_zoom_stopped = require('./run_when_zoom_stopped');
var check_zoom_stop_status = require('./check_zoom_stop_status');

module.exports = function check_if_zooming_has_stopped(params){

  var stop_attributes = check_zoom_stop_status(params);

  if (stop_attributes === true){

    // wait and double check that zooming has stopped
    setTimeout( run_when_zoom_stopped, 250, params);

  }

};