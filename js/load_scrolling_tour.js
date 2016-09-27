
var tutorial_info;
var graph_height = window.innerHeight - 150;
left_tutorial_width = 215;
var right_graph_margin = left_tutorial_width;
var inst_page_width = d3.select('#container')
                        .style('width')
                        .replace('px','');

inst_page_width = Number(inst_page_width);
var graph_width = inst_page_width - right_graph_margin;

console.log('inst_page_width', inst_page_width)
console.log('graph_width', graph_width)

var max_height = 1000;
var max_width = 2000;

var matrix_width = graph_width - 250;

if (graph_height > max_height){
  graph_height = max_height;
}

if (graph_height > 1.5*matrix_width){
  graph_height = 1.5*matrix_width;
}

d3.select('#source')
  .style('margin-top', function(){
    var inst_height = graph_height + 200;
    return inst_height+'px'
  });

function animate_arrow() {
  var repeat_time = 600;

  d3.select('#scroll_arrow')
    .transition()
    .ease('linear')
    .style('margin-top', '-15px')
    .transition()
    .ease('linear')
    .duration(repeat_time)
    .style('margin-top', '0px')
    .transition()
    .ease('linear')
    .duration(repeat_time)
    .style('margin-top', '-15px')
    .each("end", animate_arrow);
}

// make text section
var tutorial_info;
d3.json('json/tutorial_info.json', function(tmp_info){

  d3.select('#sections')
    .selectAll('.instruction')
    .data(tmp_info)
    .enter()
    .append('div')
    .classed('instruction', true)
    .style('padding-right','12px')
    // .style('padding-left','12px')
    // .style('background-color','green')
    .each(function(d){

      if (d.title === 'Conclusions') {
        d3.select(this)
          .style('margin-top','200px')
          .style('height', function(){
            var inst_height = graph_height;
            return inst_height + 'px';
          });
      } else if (d.title === 'Introduction'){
        d3.select(this)
          .style('margin-top','50px');
      }

      d3.select(this)
        .append('h3')
        .classed('tour_title_text', true)
        .text(d.title);


      var paragraphs = d.text;

      d3.select(this)
        .selectAll('p')
        .data(paragraphs)
        .enter()
        .append('p')
        .classed('instruction_text', true)
        .html(function(p){
          return p;
        });

      if (d.title === 'Introduction'){

        d3.select(this)
          .append('text')
          .classed('fa',true)
          .classed('fa-caret-down',true)
          .classed('icon_buttons',true)
          .attr('id', 'scroll_arrow')
          .style('font-size','80px')
          .style('text-align', 'center')
          .style('width','100%');

      }

    });

    tutorial_info = tmp_info;
});

var prev_section = 0;

d3.select('#graph')
  .style('width', graph_width+'px')
  .style('height', graph_height+'px');

// make clustergram
////////////////////////////////
d3.json('json/mult_view.json', function(network_data){

  var args = {
    root: '#graph',
    'network_data': network_data,
    'sidebar_width':130,
    'sidebar_icons':false,
    'row_tip_callback':gene_info
  };

  cgm = Clustergrammer(args);

  // Enrichr categories
  //////////////////////
  enr_obj = Enrichr_request(cgm);
  enr_obj.enrichr_icon();

  ini_scroll();

  d3.select('#source')
    .style('display','block');

  animate_arrow();


});

function ini_scroll(){
  // define the container and graph
  var gs = graphScroll()
      .container(d3.select('#container'))
      .graph(d3.selectAll('#graph'))
      .sections(d3.selectAll('#sections > .instruction'))
      .on('active', function(i){
        update_section_db(i);
      });
}

function click_reorder_button(inst_rc, inst_order){
  var inst_button = d3.selectAll('.toggle_'+inst_rc+'_order .btn')
    .filter(function(){
      return this.__data__ == inst_order;
    })[0];
  $(inst_button).click();
}

var section_fun = {};

section_fun['initialize_view'] = function(){
  console.log('initializing view');
  click_reorder_button('row','clust');
  click_reorder_button('col','clust');
  cgm.update_view('N_row_sum','all');
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
  console.log('in conclusion');
  click_reorder_button('row','clust');
  click_reorder_button('col ','clust');
}

section_fun['run_zoom_and_pan'] = function(){
  console.log('zoom_and_pan');
  setTimeout(function(){cgm.zoom(0, 0, 3)}, 0);
  setTimeout(function(){cgm.zoom(0, 0, 1)}, 1500);
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

      ///////////////
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