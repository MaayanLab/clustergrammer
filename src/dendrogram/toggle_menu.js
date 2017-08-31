
module.exports = function toggle_menu(cgm, menu_type, toggle, make_menu_function=null){

  var params = cgm.params;

  if (toggle === 'open'){

    if (make_menu_function != null){
      make_menu_function(cgm);
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