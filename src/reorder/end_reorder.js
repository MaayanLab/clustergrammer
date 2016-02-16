var Params = require('../params');
module.exports = function() {
  var params = Params.get();
  params.viz.run_trans = false;
};
