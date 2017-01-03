
var graph_dim = get_graph_dim();
var hzome = ini_hzome();

// make text sections
var tutorial_info;
d3.json('json/tutorial_info.json', function(tmp_info){

  d3.select('#sections')
    .selectAll('.instruction')
    .data(tmp_info)
    .enter()
    .append('div')
    .classed('instruction', true)
    .each(function(d){

      if (d.title === 'Conclusion') {
        d3.select(this)
          .style('margin-top','200px')
          .style('height', function(){
            var inst_height = graph_dim.height;
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
  .style('width', graph_dim.width+'px')
  .style('height', graph_dim.height+'px');

// make clustergram
////////////////////////////////
d3.json('json/mult_view.json', function(network_data){

  var args = {
    root: '#graph',
    'network_data': network_data,
    'sidebar_width':130,
    'row_tip_callback':hzome.gene_info
  };

  resize_container(args);

  d3.select(window).on('resize',function(){
    resize_container(args);
    cgm.resize_viz();
  });

  cgm = Clustergrammer(args);

  check_setup_enrichr(cgm);

  // // Enrichr categories
  // //////////////////////
  // enr_obj = Enrichr_request(cgm);
  // enr_obj.enrichr_icon();

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



function get_graph_dim(){

  var graph_height = window.innerHeight - 150;
  var left_tutorial_width = 215;
  var right_graph_margin = left_tutorial_width;
  var inst_page_width = d3.select('#container')
                          .style('width')
                          .replace('px','');

  inst_page_width = Number(inst_page_width);
  var graph_width = inst_page_width - right_graph_margin;

  var max_height = 1000;
  var max_width = 2000;

  var matrix_width = graph_width - 250;

  if (graph_height > max_height){
    graph_height = max_height;
  }

  if (graph_height > 1.5*matrix_width){
    graph_height = 1.5*matrix_width;
  }

  var graph_dim = {};
  graph_dim.width = graph_width;
  graph_dim.height = graph_height

  return graph_dim;
}

function resize_container(args){

  var graph_dim = get_graph_dim();

  var screen_width = window.innerWidth;
  var screen_height = window.innerHeight - 20;

  d3.select(args.root)
    .style('width', graph_dim.width+'px')
    .style('height', graph_dim.height+'px');

}

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