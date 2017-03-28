var file_saver = require('../screenshot/file_saver');
var make_matrix_string = require('./make_matrix_string');

module.exports = function save_matrix(){

  var saveAs = file_saver();

  var params = this.params;

  var matrix_string = make_matrix_string(params);

  var blob = new Blob([matrix_string], {type: 'text/plain;charset=utf-8'});
  saveAs(blob, 'clustergrammer.txt');

};