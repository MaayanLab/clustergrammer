var section_fun = {};

section_fun['initialize_view'] = function(){
  console.log('initializing view');
  click_reorder_button('row','clust');
  click_reorder_button('col','clust');
  cgm.reset_cats();
  cgm.update_view('N_row_sum','all');
  close_enrichr_menu();
}

section_fun['run_filter_sum_10'] = function(){
  console.log('sum filtering');
  cgm.update_view('N_row_sum', 10);
}

section_fun['run_filter_sum_20'] = function(){
  console.log('sum filtering');
  cgm.update_view('N_row_sum', 20);
}

section_fun['run_filter_var_10'] = function(){
  console.log('variance filtering');
  click_reorder_button('row','clust');
  click_reorder_button('col','clust');
  highlight_sidebar_element(cgm.params, 'slider_N_row_var');
  cgm.update_view('N_row_var', 10);

  // update slider manually - 2 means the third position of the slider
  // for some reason I need to call it twice
  cgm.slider_functions['N_row_var'].value(1);
  cgm.slider_functions['N_row_var'].value(2);

  d3.select(cgm.params.root+' .title_N_row_var')
    .text('Top rows variance: 10');

  d3.select(cgm.params.root+' .slider_N_row_var')
    .attr('current_state', '10');
}

section_fun['run_reorder_row_var'] = function(){
  highlight_sidebar_element(cgm.params, 'toggle_row_order');
  click_reorder_button('row','rankvar');
}

section_fun['run_reorder_single_row'] = function(){

  var params = cgm.params;

  var inst_element = get_row_element(params, 'EGFR');

  var group_trans = d3.select(inst_element).attr('transform');

  var container_trans = d3.select(params.root+' .clust_container')
    .attr('transform')
    .split(',')[1].replace(')','');

  var x_trans = params.viz.norm_labels.width.row * 0.9;

  var row_trans = group_trans.split(',')[1].replace(')','');
  var y_trans = String(Number(row_trans) + Number(container_trans) +
    params.viz.rect_height/2);

  var wait_click = 500;
  setTimeout(sim_click, wait_click, params, 'double', x_trans, y_trans);
  var wait_reorder = wait_click + 300;
  setTimeout(fire_double_click_row, wait_reorder, params, inst_element);
}

section_fun['run_conclusions'] = function(){
  console.log('run conclusions');
  click_reorder_button('row','clust');
  click_reorder_button('col ','clust');
  cgm.update_view('N_row_sum','all');
}

section_fun['run_zoom_and_pan'] = function(){
  console.log('zoom_and_pan');
  setTimeout(function(){cgm.zoom(0, 0, 3)}, 0);
  setTimeout(function(){cgm.zoom(0, 0, 1)}, 1500);
}

section_fun['open_enrichr_menu'] = function(){

  cgm.update_view('N_row_sum','all');

  var x_trans = 72;
  var y_trans = 25;
  var wait_click = 500;
  setTimeout(sim_click, wait_click, cgm.params, 'single', x_trans, y_trans);

  setTimeout(open_enrichr_menu, 750);
}

section_fun['run_enrichr_cats'] = function(){

  console.log('run_enrichr_cats\n--------------')
  var lib_of_interest = 'ChEA 2015'

  var x_trans = 115;
  var y_trans = 93;
  var wait_click = 500;
  setTimeout(sim_click, wait_click, cgm.params, 'single', x_trans, y_trans);

  setTimeout(click_lib, 750, lib_of_interest);

  setTimeout(close_enrichr_menu, 1500);

}

section_fun['clear_enrichr_cats'] = function(){

  setTimeout(open_enrichr_menu, 500);

  var x_trans = 460;
  var y_trans = 65;
  var wait_click = 1500;
  setTimeout(sim_click, wait_click, cgm.params, 'single', x_trans, y_trans);

  function delay_enr_clear(){
    console.log('delay_enr_clear')
    $(d3.select('.enr_menu_clear')[0]).d3Click();
  }

  setTimeout(delay_enr_clear, 2000);
}

section_fun['dendro_groups'] = function(){
  click_reorder_button('row','clust');
  click_reorder_button('col','clust');
  function highlight_dendro(){
    highlight_sidebar_element(cgm.params, 'slider_row');
    highlight_sidebar_element(cgm.params, 'slider_col');
  }
  setTimeout(highlight_dendro, 1500);
}

section_fun['row_search'] = function(){
  highlight_sidebar_element(cgm.params, 'gene_search_container');
}

var update_section_db = _.debounce(update_section, 1500);

function update_section(current_section){

  if (prev_section != current_section){

    prev_section = current_section;

    var function_name = tutorial_info[current_section].run_function;
    var inst_function = section_fun[function_name];

    // run if buttons are active
    if (d3.select('.toggle_col_order').select('button').attr('disabled') === null){
      inst_function();

    // wait if still transitioning
    } else {

      // need to check that you are in the same section
      setTimeout(inst_function, 2000);
    }

  } else {
    console.log('already in section - do not run\n')
  }
}

function highlight_sidebar_element(params, highlight_class){

  var duration = 4000;

  if (highlight_class.indexOf('slider') < 0){
    d3.select(params.root+' .'+highlight_class)
      .style('background','#007f00')
      .style('box-shadow','0px 0px 10px 5px #007f00')
      .transition().duration(1).delay(duration)
      .style('background','#FFFFFF')
      .style('box-shadow','none');
  } else {
    d3.select(params.root+' .'+highlight_class)
      .style('box-shadow','0px 0px 10px 5px #007f00')
      .transition().duration(1).delay(duration)
      .style('box-shadow','none');
  }
}

function sim_click(params, single_double, pos_x, pos_y){

  var click_duration = 200;

  var click_circle = d3.select(params.root+' .viz_svg')
    .append('circle')
    .attr('cx',pos_x)
    .attr('cy',pos_y)
    .attr('r',25)
    .style('stroke','black')
    .style('stroke-width','3px')
    .style('fill','#007f00')
    .style('opacity',0.5);

  if (single_double === 'double'){
    click_circle
      .transition().duration(click_duration)
      .style('opacity',0.0)
      .transition().duration(50)
      .style('opacity',0.5)
      .transition().duration(click_duration)
      .style('opacity',0.0)
      .remove();
  } else {
    click_circle
      .transition().duration(click_duration)
      .style('opacity',0.0)
      .transition().duration(250)
      .remove();
  }

}


function click_lib(lib_of_interest){

  found_lib = d3.select(cgm.params.root+' .enr_lib_section')
    .selectAll('g')
    .filter(function(){
      var inst_text = d3.select(this).select('text').text();
      return inst_text === lib_of_interest;
    })[0];
  $(found_lib).d3Click();
  console.log('click_lib')
}

function open_enrichr_menu(){
  // only open, do not close
  if (d3.select('.enrichr_menu').classed('showing') === false){
    $(d3.select('#enrichr_menu_button_graph')[0]).d3Click();
  }
}

function close_enrichr_menu(){
  console.log('close_enrichr_menu')
  // only open, do not close
  if (d3.select('.enrichr_menu').classed('showing') === true){
    $(d3.select('#enrichr_menu_button_graph')[0]).d3Click();
  }
}

function click_reorder_button(inst_rc, inst_order){
  var inst_button = d3.selectAll('.toggle_'+inst_rc+'_order .btn')
    .filter(function(){
      return this.__data__ == inst_order;
    })[0];

  $(inst_button).click();
}



function get_row_element(params, inst_row){

  var inst_element = d3.selectAll(params.root+' .row_label_group')
    .filter(function(){
      var inst_data = this.__data__;
      return inst_data.name == inst_row;
    })[0][0];

  return inst_element;
}

function fire_double_click_row(params, inst_element){
  $(inst_element).d3DblClick();
}

// allows doubleclicking on d3 element
jQuery.fn.d3DblClick = function () {
  this.each(function (i, e) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("dblclick", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    e.dispatchEvent(evt);
  });
};

jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false,
      false, false, false, 0, null);
    e.dispatchEvent(evt);
  });
};