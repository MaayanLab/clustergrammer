
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

_.each(all_clusts, function(clust_name){

  d3.json('json/'+clust_name, function(network_data){

    var tmp_num = all_clusts.indexOf(clust_name)+1;

    var args = $.extend(true, {}, default_args);

    args.root = '#container-id-'+tmp_num;
    args.network_data = network_data;

    if (clust_name == 'large_vect_post_example.json'){
      args.ini_view = {'N_row_var':20};
    }

    cgm = Clustergrammer(args);

    d3.selectAll('.wait_message').remove();

  });

});
