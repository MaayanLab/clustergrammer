var make_tree_menu = require('./make_tree_menu');

module.exports = function toggle_tree_menu(cgm, toggle){

  var params = cgm.params;

  if (toggle === 'open'){

    // console.log('open')
    make_tree_menu(cgm);

  } else if (toggle === 'close'){

    d3.select(params.root+' .tree_menu')
      .transition(700)
      .attr('opacity', 0);

    setTimeout(function(){
      d3.select(params.root+' .tree_menu')
        .remove();
    }, 700);
  }

};