# d3_clustergram 

This is a clustergram implemented in D3.js. I started from the example http://bost.ocks.org/mike/miserables/ and added the following features 
	
- zooming/panning
- more ordering options 
- row searching
- dendrogram-like colorbar
- classification triangles
- optional value bars for col/row nodes 
- user defined click callback functions

# d3_clustergram API

## make clustergram: d3_clustergram.make_clust()

To make a clustergram pass in an object with your network and other optinal arguments. An example is in load_network.js and shown below 

'''

// define arguments object 
var arguments_obj = {
	'network_data': network_data,
	'svg_div_id': 'svg_div',
	'row_label':'Row-Data-Name',
	'col_label':'Column-Data-Name',
  'outer_margins': outer_margins,
  'opacity_scale':'log',
  'input_domain':7,
  'title_tile': true,
  'click_tile': click_tile_callback,
  'click_group': click_group_callback
  'resize':false
  'order':'rank'
};

d3_clustergram.make_clust( arguments_obj );

'''

## reorder clustergram: d3_clustergram.reorder()

## find row in clustergra: d3_clustergram.find_row()


D3 Clustergram was developed by Nick Fernandez at Icahn School of Medicine at Mount Sinai. 