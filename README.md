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

## make clustergram: d3_clustergram.make_clust

### make_clust arguments 
To make a clustergram pass in an object with your network (network_data) and other optinal arguments. An example is in load_network.js and shown below 

```
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
```	

### network_data 
Your network must be in the following json format 

```
{
  "row_nodes":[
     {
      "name": "ATF7",
      "clust": 67,
      "value": 0.6912280941908925,
      "rank": 66,
      "group": []
      "cl": "1.0"
    }
  ],
  "col_nodes":[
    {
      "name": "Col-0",
      "clust": 4,
      "value": 0.13977366189382578,
      "rank": 10,
      "group": [],
      "cl": "1.0"
    }
  ],
  "links":[
    {
      "source": 0,
      "target": 0,
      "value": 0.023191294265036619,
      "highlight":1
    }
  ]
}
```
row_nodes and col_nodes have optional properties: group and cl (group is given as an array of group membership at different distance cutoffs and used for the dendrogram-like colorbar). 

## reorder clustergram: d3_clustergram.reorder

d3_clustergram.reorder takes a single argument that can take the values: 'clust' or 'rank'; and will reorder the clustergram accordingly. 

## find row in clustergra: d3_clustergram.find_row
d3_clustergram.find_row will find and zoom into the row that is specified by the input DOM element with id 'gene_search_box'. 

D3 Clustergram was developed by Nick Fernandez at Icahn School of Medicine at Mount Sinai. 