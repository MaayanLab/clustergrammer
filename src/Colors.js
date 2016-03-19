// colors from http://graphicdesign.stackexchange.com/revisions/3815/8
var rand_colors;

rand_colors = d3.scale.category20b().range();

function get_default_color() {
  //return rand_colors[0];
  return '#EEE';
}

function get_random_color(i) {
  return rand_colors[i % get_num_colors()];
}

function get_num_colors() {
  return rand_colors.length;
}

module.exports = {
  get_default_color: get_default_color,
  get_random_color: get_random_color,
  get_num_colors: get_num_colors
};
