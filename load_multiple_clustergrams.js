
all_clusts = ['mult_view.json',
'mult_view_sim_col.json',
'mult_view_sim_row.json'];

var outer_margins = {
    'top':2,
    'bottom':30,
    'left':5,
    'right':2
  };

var viz_size = {
  'width':1140,
  'height':800
};

// define arguments object
var default_args = {
  'row_label':'Row Title',
  'col_label':'Colum Title',
  'outer_margins': outer_margins,
  'show_tile_tooltips':true,
  'size':viz_size,
  'about':'Zoom, scroll, and click buttons to interact with the clustergram.',
  'row_search_placeholder':'Gene',
};

var cat_colors = null;
var tmp_num;

make_clust(make_sim_mats)

function make_clust(make_sim_mats){
  var clust_name = 'mult_view.json'
  d3.json('json/'+clust_name, function(network_data){
    var tmp_num = all_clusts.indexOf(clust_name)+1;
    var args = $.extend(true, {}, default_args);
    args.root = '#container-id-'+tmp_num;
    args.network_data = network_data;
    cgm = Clustergrammer(args);
    d3.select(cgm.params.root+' .wait_message').remove();
  });

  make_sim_mats();
}

function make_sim_mats(inst_rc){
  _.each(['row','col'], function(inst_rc){
    clust_name = 'mult_view_sim_'+inst_rc+'.json'
    d3.json('json/'+clust_name, function(network_data){
      if (inst_rc === 'col'){
        tmp_num = 2;
      } else if (inst_rc === 'row'){
        tmp_num = 3;
      }
      var args = $.extend(true, {}, default_args);
      args.root = '#container-id-'+tmp_num;
      args.network_data = network_data;
      cgm = Clustergrammer(args);
      d3.select(cgm.params.root+' .wait_message').remove();
    });
  });
}


    // if (clust_name === ){
    //   // args.cat_colors = {};
    //   // args.cat_colors.row = cat_colors.col;
    //   // args.cat_colors.col = cat_colors.col; 
    // }

    // if (clust_name === 'mult_view_sim_row.json'){
    //   // args.cat_colors = {};
    //   // args.cat_colors.row = cat_colors.row;
    //   // args.cat_colors.col = cat_colors.row; 
    // }

