# clustergrammer.js

Clustergrammer.js is a clustergram/heatmap matrix visualization tool implemented in D3.js. A live example of Clustergrammer.js can be seen [here](http://amp.pharm.mssm.edu/clustergrammer/). The project began as an extension of this example http://bost.ocks.org/mike/miserables/. 

Some of clustergrammer's features include:
  
- zooming/panning
- additional ordering options 
- dendrogram
- row filtering
- row searching
- row/column categories 
- optional 'split' matrix cells for up/down values

Clustergrammer.js' source code is under the src directory and Webpack Module Developer is being used to make clustergrammer.js. 

The easiest way to visualize a matrix of your own data (see [matrix format](#input-matrix-format)) is to use the Python module, [clustergrammer.py](#clustergrammer-python-module). Clustergrammer.py, takes a tab-separated matrix file as input, calculates clustering, and generates the visualization json for clustergrammer.js (see [example workflow](#example-workflow)). Users can also generate the visualization json using their own script as long as they adhere to the [format](#clustergrammer-json-format).

Clustergrammer is designed to be a reusable chart and has been integrated into several [Ma'ayan lab](http://icahn.mssm.edu/research/labs/maayan-laboratory) web tools including:

- [Clustergrammer](http://amp.pharm.mssm.edu/clustergrammer/)
- [Enrichr](http://amp.pharm.mssm.edu/Enrichr/)
- [GEN3VA](http://amp.pharm.mssm.edu/gen3va/)
- [L1000CDS2](http://amp.pharm.mssm.edu/l1000cds2/)
- [GEO2Enrichr](http://amp.pharm.mssm.edu/g2e/)
- [Harmoniozome](http://amp.pharm.mssm.edu/Harmonizome/)

# Dependencies

clustergrammer.js requires:
- jQuery
- jQuery UI
- Underscore.js
- Bootstrap

clustergrammer.py requires
- numpy
- scipy 
- pandas 

# clustergrammer API

### Required Arguments 
To make a clustergram pass an arguments object with the following required values to Clustergrammer:
```
var args = {
  'root':'#id_of_container',
  'network_data': network_data
};

var cgm = Clustergrammer(args);
``` 
This will make a clustergram visualization in the container referred to as root (specified using a css id selector) using the visualization json (referred to as netowrk_data). The visualization json format is defined [here](#clustergrammer-json-format).


# Input Matrix Format


# Clustergrammer JSON Format
Your network (called network_data here) must be in the following json format - make_clust.py and clustergrammer.py can be used to make a json of this format from a matrix given in tab separated format (see make_clust.py, which produces example_network.json from example_tsv_network.txt)

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
Both row_node and col_node objects are required to have the three properties: "name", "clust", "rank" . "name" specifies the name given to the row or column. "clust" and "rank" give the ordering of the row or column in the clustergram - these orderings have to be precalculated by the user and the python script make_clust.py can be used for this. 

##### optional properties: "group", "cl", "value"
row_nodes and col_nodes have optional properties: "group" and "cl" (group is given as an array of group membership at different distance cutoffs and used for the dendrogram-like colorbar - see clustergrammer.py). If row_nodes and col_nodes have the property "group" then a dendrogram like colorbar will be added to the visualization and a slider can be used to change the group size. 

If row_nodes and col_nodes have the property "cl" then the triangles on each row/column label will be colored based on the classification (cl) of each row/column. 

If row_nodes or col_nodes have the property "value", then semi-transpaent bars will be made behind the labels that represent 
"value". Currently this is only implemented for columns, values can only be positive, and the bars are always red. 

#### links properties 

##### required properties: "source", "target", "value"
Link objects are required to have three properties: "source", "target", "value". "source" and "target" give the integer value of the row and column of the tile in the visualization. "value" specifies the opacity and color of the tile, where positive/negative values result in red/blue tiles (tiles are not made for links with zero value). If no 'input_domain' is specified then the domain for input values is given by the maximum absolute value of all link values. The positive and negative tile colors can be modified ysing the 'tile_colors' property in the arguments_obj. 

##### optional properties: "highlight", "value_up", "value_dn", "info"
Links have the opional property "highlight" that can be used to highlight a tile with a black border. Links also have the optional properties "value_up" and "value_dn" which allow the user to split a tile into up- and down-triangles if a link has both up- and down-values. If a link has only an up- or down-value then a normal square tile is shown. Note that adding "highlight", "value_up", or "value_dn" will result in additional svg components and will slow down the visualization. The property info can be used to pass additional information to the tile clickback funciton. 

### Optional make_clust Properties 

## reorder clustergram

clustergrammer.reorder takes a single argument that can take the values: 'clust' or 'rank'; and will reorder the clustergram accordingly. 

## find row in clustergram
clustergrammer.find_row will find and zoom into the row that is specified by the input DOM element with id 'gene_search_box'. 

# clustergrammer Python Module
The example network json, mult_view.json, used in the visualization was produced using the python script make_clustergram.py. The python script clustergrammer.py defines the class, Network, that loads the example network in tab separated format, example_tsv_network.txt, calculates clustering, and saves the network in the required format. To remake example_network.json run make_clust.py. 

D3 Clustergram was developed by Nick Fernandez at Icahn School of Medicine at Mount Sinai. 

