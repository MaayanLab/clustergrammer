var build_single_dendro_slider = require('./build_single_dendro_slider');

module.exports = function build_dendro_sliders(cgm){

  build_single_dendro_slider(cgm, 'row');
  build_single_dendro_slider(cgm, 'col');

};