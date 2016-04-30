
var all_clusts = ['mult_view.json',
'mult_view_sim_col.json',
'mult_view_sim_row.json'];

var viz_size = {'width':1140, 'height':800};

// define arguments object
var default_args = {
  'show_tile_tooltips':true,
  'about':'Zoom, scroll, and click buttons to interact with the clustergram.',
  'row_search_placeholder':'Gene',
};

make_clust(make_sim_mats)

resize_container();

var tmp_num;
var cat_colors;
function make_clust(make_sim_mats){
  var clust_name = 'mult_view.json'

  d3.json('json/'+clust_name, function(network_data){
    var tmp_num = all_clusts.indexOf(clust_name)+1;
    var args = $.extend(true, {}, default_args);
    args.root = '#container-id-'+tmp_num;
    args.network_data = network_data;

    cgm = Clustergrammer(args);
    d3.select(cgm.params.root+' .wait_message').remove();
    cat_colors = cgm.params.cat_colors;

    make_sim_mats(cat_colors);
    
  });

}

function make_sim_mats(cat_colors){

  _.each(['row','col'], function(inst_rc){
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
  });
}

function resize_container(){

  var screen_width = viz_size.width;
  var screen_height = viz_size.height;

  d3.selectAll('.clustergrammer_container')
    .style('width', screen_width+'px')
    .style('height', screen_height+'px');
}



