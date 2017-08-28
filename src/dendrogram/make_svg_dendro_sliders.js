var build_svg_dendro_slider = require('./build_svg_dendro_slider');
var build_svg_tree_icon = require('./build_svg_tree_icon');

module.exports = function make_svg_dendro_sliders(cgm){

  build_svg_dendro_slider(cgm, 'row');
  build_svg_dendro_slider(cgm, 'col');

  // disabled
  // build_svg_tree_icon(cgm);

};