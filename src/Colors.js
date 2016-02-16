// colors from http://graphicdesign.stackexchange.com/revisions/3815/8
var rand_colors;

// generate random colors
var tmp0 = ['#000000', '#FF34FF', '#FFFF00', '#FF4A46'];
var tmp1 = d3.scale.category20().range().reverse();
var tmp2 = d3.scale.category20b().range();
var tmp3 = d3.scale.category20c().range();
rand_colors = tmp0.concat(tmp1).concat(tmp2).concat(tmp3);

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
