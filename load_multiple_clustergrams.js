
inst_network = 'mult_view.json';
// make_clust('large_vect_post_example.json');

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
var arguments_obj = {
  root: '#container-id-1',
  'row_label':'Row Title',
  'col_label':'Colum Title',
  'outer_margins': outer_margins,
  'show_tile_tooltips':true,
  'size':viz_size,
  'about':'Zoom, scroll, and click buttons to interact with the clustergram.',
  'row_search_placeholder':'Gene',
};

d3.json('json/'+inst_network, function(network_data){

  arguments_obj.network_data = network_data;

  cgm = Clustergrammer(arguments_obj);

  d3.select(cgm.params.root + ' .wait_message').remove();

  d3.select(cgm.params.root+ ' .title_section')
    .append('img')
    .classed('title_image',true)
    .attr('src','img/clustergrammer_logo.png')
    .attr('alt','clustergrammer')
    .style('width','167px')
    .style('margin-left','-2px')
    .style('margin-top','5px');

});

d3.json('json/'+inst_network, function(network_data){

  arguments_obj.root = '#container-id-2';
  arguments_obj.network_data = network_data;

  cgm = Clustergrammer(arguments_obj);

  d3.select(cgm.params.root + ' .wait_message').remove();

  d3.select(cgm.params.root+ ' .title_section')
    .append('img')
    .classed('title_image',true)
    .attr('src','img/clustergrammer_logo.png')
    .attr('alt','clustergrammer')
    .style('width','167px')
    .style('margin-left','-2px')
    .style('margin-top','5px');

});


d3.json('json/'+inst_network, function(network_data){

  arguments_obj.root = '#container-id-3';
  arguments_obj.network_data = network_data;

  cgm = Clustergrammer(arguments_obj);

  d3.select(cgm.params.root + ' .wait_message').remove();

  d3.select(cgm.params.root+ ' .title_section')
    .append('img')
    .classed('title_image',true)
    .attr('src','img/clustergrammer_logo.png')
    .attr('alt','clustergrammer')
    .style('width','167px')
    .style('margin-left','-2px')
    .style('margin-top','5px');

});