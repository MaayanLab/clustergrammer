
module.exports = function toggle_menu(cgm, menu_type, toggle, make_menu=null){

  var params = cgm.params;

  if (toggle === 'open'){

    d3.selectAll(cgm.params.root + ' .svg_menus')
      .remove();

    if (make_menu != null){
      make_menu(cgm);
    }


  } else if (toggle === 'close'){

    d3.select(params.root + ' .' + menu_type)
      .transition(700)
      .attr('opacity', 0);

    setTimeout(function(){
      d3.select(params.root + ' .' + menu_type)
        .remove();
    }, 700);
  }

};