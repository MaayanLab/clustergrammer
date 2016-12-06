var build_svg_dendro_slider = require('./build_svg_dendro_slider');

module.exports = function make_svg_dendro_sliders(cgm){

  build_svg_dendro_slider(cgm, 'row');
  build_svg_dendro_slider(cgm, 'col');

};