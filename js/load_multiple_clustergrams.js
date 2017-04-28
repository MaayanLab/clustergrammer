var tmp_num;
var cat_colors;
// global cgm
cgm = {};
resize_container();

var hzome = ini_hzome();

default_args = {};
  default_args.row_tip_callback = hzome.gene_info;
  default_args.matrix_update_callback = matrix_update_callback;
  default_args.dendro_callback = dendro_callback;

function make_clust(make_sim_mats){
  var clust_name = 'mult_view.json'

  d3.json('json/'+clust_name, function(network_data){

    var args = $.extend(true, {}, default_args);

    args.root = '#container-id-1';
    args.network_data = network_data;

    cgm['clust'] = Clustergrammer(args);
    d3.select(cgm['clust'].params.root+' .wait_message').remove();
    cat_colors = cgm['clust'].params.viz.cat_colors;

    check_setup_enrichr(cgm['clust']);

    make_sim_mats('col', cat_colors);
    make_sim_mats('row', cat_colors);

  });

}


d3.select('.blockMsg').select('h1').text('Please wait...');

var viz_size = {'width':1140, 'height':750};

$(document).ready(function(){
    $(this).scrollTop(0);
});

make_clust(make_sim_mats)

d3.select(window).on('resize',function(){
  resize_container();

  _.each(cgm, function(inst_cgm){
    inst_cgm.resize_viz();
  })

});

window.onscroll = function() {

  var show_col_sim = 200;
  var show_row_sim = 1200;
  var hide_clust = 900;
  var hide_col_sim = 1800;
  var inst_scroll = $(document).scrollTop();

  // // load col sim mat
  // if (inst_scroll > show_col_sim){
  //   if (d3.select('#container-id-2 .viz_svg').empty()){
  //     make_sim_mats('col', cat_colors)
  //   }
  // }

  // // load row sim mat
  // if (inst_scroll > show_row_sim){
  //   if (d3.select('#container-id-3 .viz_svg').empty()){
  //     make_sim_mats('row', cat_colors)
  //   }
  // }

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

function make_sim_mats(inst_rc, cat_colors){

  clust_name = 'mult_view_sim_'+inst_rc+'.json';
  d3.json('json/'+clust_name, function(network_data){

    var args = $.extend(true, {}, default_args);
    args.cat_colors = {};

    // do not need to transfer cat colors if predefined in viz_json
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
    cgm[inst_rc] = Clustergrammer(args);
    d3.select(cgm[inst_rc].params.root+' .wait_message').remove();
  });

}

function matrix_update_callback(){
  console.log('matrix_update_callback')
  if (_.has(enr_obj, this.root))
    if (genes_were_found){
      enr_obj[this.root].clear_enrichr_results();
    }
}

function dendro_callback(inst_selection){

  var clust_num = this.root.split('-')[2];

  var inst_data = inst_selection.__data__;

  // toggle enrichr export section
  if (inst_data.inst_rc === 'row'){

    if (clust_num !== '2'){
      d3.selectAll('.enrichr_export_section')
        .style('display', 'block');
    } else {

      d3.selectAll('.enrichr_export_section')
        .style('display', 'none');
    }

  } else {
    d3.selectAll('.enrichr_export_section')
      .style('display', 'none');
  }

}

function resize_container(){

  var container_width = d3.select('#wrap').style('width').replace('px','');
  var container_width = Number(container_width) - 30;

  d3.selectAll('.clustergrammer_container')
    .style('width', container_width+'px');

}