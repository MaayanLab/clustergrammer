
var viz_size = {'width':1140, 'height':750};

// define arguments object
var default_args = {
  'show_tile_tooltips':true,
  'about':'Zoom, scroll, and click buttons to interact with the clustergram.',
  'row_search_placeholder':'Gene'
  // 'ini_view':{'N_row_sum':100}
};

$(document).ready(function(){
    $(this).scrollTop(0);
});

make_clust(make_sim_mats)

resize_container();

window.onscroll = function() {

  var show_col_sim = 200;
  var show_row_sim = 1200;
  var hide_clust = 900;
  var hide_col_sim = 1800;
  var inst_scroll = $(document).scrollTop();

  // load col sim mat 
  if (inst_scroll > show_col_sim){
    if (d3.select('#container-id-2 .viz_svg').empty()){
      make_sim_mats('col', cat_colors)
    }
  }

  // load row sim mat 
  if (inst_scroll > show_row_sim){
    if (d3.select('#container-id-3 .viz_svg').empty()){
      make_sim_mats('row', cat_colors)
    }
  }

  // hide clust 
  if (inst_scroll > hide_clust){
    d3.select('#container-id-1 .viz_svg')
      .style('display', 'none');
  } else {
    d3.select('#container-id-1 .viz_svg')
      .style('display', 'block');
  }

  // hide col sim mat
  if (inst_scroll > hide_col_sim || inst_scroll < show_col_sim){
    d3.select('#container-id-2 .viz_svg')
      .style('display', 'none');
  } else {
    d3.select('#container-id-2 .viz_svg')
      .style('display', 'block');
  }

}

var tmp_num;
var cat_colors;
function make_clust(make_sim_mats){
  var clust_name = 'mult_view.json'

  d3.json('json/'+clust_name, function(network_data){
    var args = $.extend(true, {}, default_args);
    args.root = '#container-id-1';
    args.network_data = network_data;

    cgm = Clustergrammer(args);
    d3.select(cgm.params.root+' .wait_message').remove();
    cat_colors = cgm.params.cat_colors;

    // make_sim_mats(cat_colors);
    
  });

}


function make_sim_mats(inst_rc, cat_colors){

  clust_name = 'mult_view_sim_'+inst_rc+'.json'
  d3.json('json/'+clust_name, function(network_data){

    var args = $.extend(true, {}, default_args);
    args.cat_colors = {};
    if (inst_rc === 'col'){
      tmp_num = 2;
      args.cat_colors.row = cat_colors.col;
      args.cat_colors.col = cat_colors.col;
    } else if (inst_rc === 'row'){
      tmp_num = 3;
      args.cat_colors.row = cat_colors.row;
      args.cat_colors.col = cat_colors.row;
    }

    args.root = '#container-id-'+tmp_num;

    args.network_data = network_data;
    cgm = Clustergrammer(args);
    d3.select(cgm.params.root+' .wait_message').remove();
  });

}

function resize_container(){

  var screen_width = viz_size.width;
  var screen_height = viz_size.height;

  d3.selectAll('.clustergrammer_container')
    .style('width', screen_width+'px')
    .style('height', screen_height+'px');
}



