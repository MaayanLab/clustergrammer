// colors from http://graphicdesign.stackexchange.com/revisions/3815/8
var all_colors;
// var seed = 101;
var seed = 8;

var tmp1 = d3.scale.category20b().range();
var tmp2 = d3.scale.category20().range();

// all_colors = tmp1;
all_colors = tmp1.concat(tmp2);

all_colors = shuffle(all_colors);

function get_default_color() {
  return '#EEE';
}

function get_random_color(i) {
  return all_colors[i % get_num_colors()];
}

function get_num_colors() {
  return all_colors.length;
}

function random_gen() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function shuffle(array) {

  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    // randomIndex = Math.floor(Math.random() * currentIndex);
    randomIndex = Math.floor(random_gen() * currentIndex);

    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


module.exports = {
  get_default_color: get_default_color,
  get_random_color: get_random_color,
  get_num_colors: get_num_colors
};
