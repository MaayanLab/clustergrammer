# d3_clustergram 

This is a clustergram implemented in D3.js. I started from the example http://bost.ocks.org/mike/miserables/ and added the following features 
  
- zooming/panning
- more ordering options 
- row searching
- dendrogram-like colorbar
- row/column classification triangles
- optional value bars for col/row nodes 
- user defined click callback functions
- optional split tiles and highlighting tiles
- optional resizing

The d3_clustergram repo is being hosted on github and gist and a live example of the visualization can be found on blocks. 
- github: https://github.com/cornhundred/d3_clustergram 
- gist: https://gist.github.com/cornhundred/c56253a5f3579a63406f
- blocks http://bl.ocks.org/cornhundred/c56253a5f3579a63406f

# d3_clustergram API

## making a clustergram using d3_clustergram.make_clust

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
  'transpose':true,
  'zoom':false,
  'tile_colors':['#ED9124','#1C86EE'],
  'background_color':'orange',
};

d3_clustergram.make_clust( arguments_obj );
``` 

### network_data json
Your network (called network_data here) must be in the following json format 

```
{
  "row_nodes":[
     {
      "name": "ATF7",
      "clust": 67,
      "value": 0.691,
      "rank": 66,
      "group": []
      "cl": "1.0"
    }
  ],
  "col_nodes":[
    {
      "name": "Col-0",
      "clust": 4,
      "value": 0.139,
      "rank": 10,
      "group": [],
      "cl": "1.0"
    }
  ],
  "links":[
    {
      "source": 0,
      "target": 0,
      "value": 0.023,
      "highlight":0
    }
  ]
}
```

There are three required properties: row_nodes, col_nodes, and links. Each of these properties is an array of objects with required and optional properties. 

#### row_nodes and col_nodes properties 

##### required properties: "name", "clust", "rank" 
Both row_node and col_node objects are required to have the three properties: "name", "clust", "rank" . "name" specifies the name given to the row or column. "clust" and "rank" give the ordering of the row or column in the clustergram - these orderings have to be precalculated by the user and the python script d3_clustergram.py can be used for this. 

##### optional properties: "group", "cl", "value"
row_nodes and col_nodes have optional properties: "group" and "cl" (group is given as an array of group membership at different distance cutoffs and used for the dendrogram-like colorbar - d3_clustergram.py gives an example of how to obtain group values). If row_nodes and col_nodes have the property "group" then a dendrogram like colorbar will be added to the visualization and a slider can be used to change the group size. 

If row_nodes and col_nodes have the property "cl" then the triangles on each row/column label will be colored based on the classification (cl) of each row/column. 

If row_nodes or col_nodes have the property "value", then semi-transpaent bars will be made behind the labels that represent 
"value". Currently this is only implemented for columns, values can only be positive, and the bars are always red. 

#### links properties 

##### required properties: "source", "target", "value"
Link objects are required to have three properties: "source", "target", "value". "source" and "target" give the integer value of the row and column of the tile in the visualization. "value" specifies the opacity and color of the tile, where positive/negative values result in red/blue tiles (tiles are not made for links with zero value). If no 'input_domain' is specified then the domain for input values is given by the maximum absolute value of all link values. The positive and negative tile colors can be modified ysing the 'tile_colors' property in the arguments_obj. 

##### optional properties: "highlight", "value_up", "value_dn"
Links have the opional property "highlight" that can be used to highlight a tile with a black border. Links also have the optional properties "value_up" and "value_dn" which allow the user to split a tile into up- and down-triangles if a link has both up- and down-values. If a link has only an up- or down-value then a normal square tile is shown. Note that adding "highlight", "value_up", or "value_dn" will result in additional svg components and will slow down the visualization. 

### Optional make_clust Properties 

## reorder clustergram: d3_clustergram.reorder

d3_clustergram.reorder takes a single argument that can take the values: 'clust' or 'rank'; and will reorder the clustergram accordingly. 

## find row in clustergram: d3_clustergram.find_row
d3_clustergram.find_row will find and zoom into the row that is specified by the input DOM element with id 'gene_search_box'. 

D3 Clustergram was developed by Nick Fernandez at Icahn School of Medicine at Mount Sinai. 