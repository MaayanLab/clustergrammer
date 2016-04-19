
all_clusts = ['mult_view.json'];

var outer_margins = {
    'top':2,
    'bottom':30,
    'left':5,
    'right':2
  };

var viz_size = {
  'width':940,
  'height':800
};

// define arguments object
var args = {
  // root: '#container-id-1',
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

    args.root = '#container-id-'+tmp_num;
    args.network_data = network_data;

    cgm = Clustergrammer(args);

    d3.selectAll('.wait_message').remove();

  });

});
