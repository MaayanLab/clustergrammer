# clustergrammer

Clustergrammer.js is an interactive clustergram/heatmap matrix visualization tool implemented in D3.js. A live example that includes an interactive demo can be seen [here](http://amp.pharm.mssm.edu/clustergrammer/) and a screenshot is show below.

[![demo_screenshot](img/demo_screenshot.png "demo_screenshot.png")](http://amp.pharm.mssm.edu/clustergrammer/)

The project began as an extension of this example http://bost.ocks.org/mike/miserables/.

Some of clustergrammer's interacive features include:

- zooming/panning
- row/column reordering based on sum/variance/clustering etc.
- dendrogram
- row filtering
- row searching
- row/column categories
- optional 'split' matrix cells for up/down values

Clustergrammer.js' source code is under the src directory and Webpack Module Developer is being used to make clustergrammer.js.

The easiest way to visualize a matrix of your own data (see [matrix format](#input-matrix-format)) is to use the Python module, [clustergrammer.py](#clustergrammer-python-module). This module takes a tab-separated matrix file as input, calculates clustering, and generates the visualization json for clustergrammer.js (see [example workflow](#example-workflow)). Users can also generate the visualization json on their own using another programming language (e.g. Matlab) as long as they adhere to the [format](#clustergrammer-json-format).

Clustergrammer is designed to be a reusable chart and has been integrated into several [Ma'ayan lab](http://icahn.mssm.edu/research/labs/maayan-laboratory) web tools including:

- [Clustergrammer](http://amp.pharm.mssm.edu/clustergrammer/)
- [Enrichr](http://amp.pharm.mssm.edu/Enrichr/)
- [GEN3VA](http://amp.pharm.mssm.edu/gen3va/)
- [L1000CDS2](http://amp.pharm.mssm.edu/l1000cds2/)
- [GEO2Enrichr](http://amp.pharm.mssm.edu/g2e/)
- [Harmoniozome](http://amp.pharm.mssm.edu/Harmonizome/)

# Dependencies

clustergrammer.js requires:
- D3.js
- jQuery
- Underscore.js

clustergrammer.py requires
- numpy
- scipy
- pandas

# Clustergrammer API

## Required Arguments
To make a visualization pass an arguments object with the following required values to Clustergrammer:
```
var args = {
  'root':'#id_of_container',
  'network_data': network_data
};

var cgm = Clustergrammer(args);
```
This will make a clustergram visualization in the 'root' container using the [visualization json](#clustergrammer-json-format) (referred to as network_data and made using the python module [clustergrammer.py](#clustergrammer-python-module)). The user must generate the root container and define its width and height, which will be used to define the visualization size.

Resizing the visualization can be done by first resizing the container and then resizing the clustergram using Clustergrammer's ```cgm.resize_viz()``` function. An example of resizing when the window change size is shown below.

```
d3.select(window).on('resize', function(){

  // first, resize the container when the screen size changes
  your_function_to_resize_the_container();

  // then, resize the visualization to match the container's new size
  cgm.resize_viz();

});
```

The visualization json format is defined [here](#clustergrammer-json-format). Clustergrammer can make more than one visualization per page (see [example](multiple_clust.html)), but each visualization requires its own container.

## API Examples
The page [index.html](index.html) and the corresponding script [load_clustergram.js](js/load_clustergram.js) show an example of how to make a full-screen visualization that resizes with the window.

The page [multiple_clust.html](multiple_clust.html) and corresponding script [load_multiple_clustergrams.js](js/load_multiple_clustergrams.js) show an example of visualizing multiple clustergrams on one page. For more options see (see [Optional Clustergrammer.js Arguments](#optional-clustergrammer.js-arguments))

# Input Matrix Format
Clustergrammer.js requires a specific json [format](#clustergrammer-json-format) to make the visualization and you can use the python module [clustergrammer.py](#clustergrammer-python-module) to create this json from an input tab-separated matrix file in the following format:

```
       Col-A   Col-B   Col-C
Row-A   0.0    -0.1     1.0
Row-B   3.0     0.0     8.0
Row-C   0.2     0.1     2.5
```
(note that tabs are required, but spaces are used in the example below to increase readability)

The matrix must have unique names for rows and columns. Row and column categories can also be included in the matrix in the following way:

![cat_tsv](img/cat_tsv.png "cat_tsv.png")

This Excel screenshot shows a single row category being added as an additional column of strings (e.g. 'Type: Interesting') and a single column category being added as an additional row of strings (e.g. 'Gender: Male'). Up to 15 categories can be added in a similar manner.

The 'title' of row/column names and categories can also be included by prefixing each string with 'Title: ' - e.g. the title of the column names is 'Cell Line' and the title of the row categories is 'Gender'.

Alternatively, row/column names and categories can be stored as Python tuples as shown below (or see [tuple_cats.txt](txt/tuple_cats.txt)).

```
	('Cell Line: A549', 'Gender: Male')	('Cell Line: H1299', 'Gender: Female')	('Cell Line: H661', 'Gender: Female')
('Gene: EGFR','Type: Interesting')	-3.234	5.03	0.001
('Gene: TP53','Type: Not Interesting')	8.3	4.098	-12.2
('Gene: IRAK','Type: Not Interesting')	7.23	3.01	0.88
```

## Matrix Examples
Several examples can be found in the [txt](txt) directory. An example matrix tab-separated file with row and column categories can be seen here: [rc_two_cats.txt](txt/rc_two_cats.txt). See [example workflow](#example-workflow) or [make_clustergrammer.py](make_clustergrammer.py) for examples of how to use the python module to generate a visualization json from a matrix file.

# Clustergrammer Python Module
The python module [clutergrammer.py](https://github.com/MaayanLab/clustergrammer-py), takes a tab-separated matrix file as input, calculates clustering, and generates the visualization json for clustergrammer.js. The clustergrammer python module can be installed using pip

```
pip install clustergrammer
```

## Example Workflow
```
from clustergrammer import Network
net = Network()

net.load_file('txt/rc_two_cats.txt')

net.make_clust(dist_type='cos',views=['N_row_sum', 'N_row_var'])

net.write_json_to_file('viz', 'json/mult_view.json', 'no-indent')
```
The above workflow instaitiates an instance of the ```Network``` class as ```net```, loads a matrix tsv file, calculates clustering (with distance set to cosine and optional view requested), and writes the visualization json to a file.

The python script [make_clustergrammer.py](make_clustergrammer.py) generates the visualization jsons for the examples pages on this repo. You can modify the script to make a visualization from your own file and find out more about the API below.

The script [make_clustergrammer.py](make_clustergrammer.py) is used to generate the visualization jsons (see [json](json) directory) for the examples pages in this repo. To visualize your own data modify the [make_clustergrammer.py](make_clustergrammer.py) script.

or by using the source code found here: https://github.com/MaayanLab/clustergrammer-py.

Clustergrammer was developed by Nick Fernandez at Icahn School of Medicine at Mount Sinai.


# Clustergrammer JSON Format
Your visualization JSON (referred to as network_data) must be in the following format (group arrays are not shown):

```
{
  "row_nodes":[
     {
      "name": "ATF7",
      "clust": 67,
      "rank": 66,
      "rankvar": 10,
      "group": []
    }
  ],
  "col_nodes":[
    {
      "name": "Col-0",
      "clust": 4,
      "rank": 10,
      "rankvar": 120,
      "group": []
    }
  ],
  "links":[
    {
      "source": 0,
      "target": 0,
      "value": 0.023
    }
  ]
}
```
See [example workflow](#example-workflow) or [make_clustergrammer.py](make_clustergrammer.py) for examples of how to use the python module to generate a visualization json from a matrix file.

Optional 'views' of the clustergram are encoded in the 'views' value at the base level of the visualization json. These views are used to store filtered versions of the matrix - the links are shared but the views have their own row_nodes/col_nodes. The view attributes are stored in the view object (e.g. N_row_sum). Views are discussed in the python module [section](#clustergrammer-python-module).

```
"views":[
  {
    "N_row_sum": "all",
    "dist": "cos",
    "nodes":{
      "row_nodes": [],
      "col_nodes": []
    }
  }
```


There are three required properties: ```row_nodes```, ```col_nodes```, and ```links```. Each of these properties is an array of objects and these objects are discussed below.

#### ```row_nodes``` and ```col_nodes``` properties

##### required properties: ```name```, ```clust```, ```rank```
row_node and col_node objects are required to have the three properties: ```name```, ```clust```, ```rank``` . ```name``` specifies the name given to the row or column. ```clust``` and ```rank``` give the ordering of the row or column in the clustergram.

##### optional properties: ```group```, ```value```
row_nodes and col_nodes have optional properties: ```group``` and ```value```. Group is an array that contains group-membership of the row/column at different dendrogram distance cutoffs. If ```row_nodes``` and ```col_nodes``` have the property ```group``` then a dendrogram will be added the clustergram.

If row_nodes or col_nodes have the property ```value```, then semi-transpaent bars will be made behind the labels that represent this value.

#### ```links``` properties

##### required properties: ```source```, ```target```, ```value```
Link objects are required to have three properties: ```source```, ```target```, ```value```. ```source``` and ```target``` give the integer value of the row and column of the tile in the visualization. ```value``` specifies the opacity and color of the tile, where positive/negative values result in red/blue tiles (tiles are not made for links with zero value).

##### optional properties: ```value_up```, ```value_dn```
Links also have the optional properties ```value_up``` and ```value_dn``` which allow the user to split a tile into up- and down-triangles if a link has both up- and down-values. If a link has only an up- or down-value then a normal square tile is shown.


# Optional Clustergrammer.js Arguments

These arguments can also be passsed to Clustergrammer as part of the args object.

```row_label``` and ```col_label```: Pass strings that will be used as 'super-labels' for the rows and columns.

```row_label_scale``` and ```col_label_scale```: A number that will be used as a scaling factor that increases or decreases the size of row and column labels (as well as the font-size of the text).

```super_label_scale```: A number that will be used a a scaling factor that increases or decreases the size of the 'super-labels'.

```ini_expand```: Initialize the visualization in 'expanded' mode so that the sidebar controls are not visible.

```opacity_scale```: This defines the function that will map values in your matrix to opacities of cells in the visualization. The default is 'linear', but 'log' is also available.

```input_domain```: This defines the maximum (absolute) value from your input matrix that corresponds to an opacity of 1. The default is defined based on the maximum absolute value of any cell in your matrix. Lowering this value will increase the opacity of the overall visualization and effectively cutoff the visualization opacity at the value you choose.

```do_zoom```: This determines whether zooming will be available in the visualization. The default is set to true.

```tile_colors```: This determines the colors that indicate positive and negative values, respectively, in the visualization. The default are red and blue. The input for this is an array of hexcode or color names, e.g. ['#ED9124','#1C86EE'].

```row_order``` and ```col_order```: This sets the initial ordering of rows and columns. The default is clust. The options are
  * alpha: ordering based on names of rows or columns
  * clust: ordering based on clustering (covered [here](clustergrammer-python-module))
  * rank: ordering based on the sum of the values in row/column
  * rank_var: ordering based on the variance of the values in the row/column

```ini_view```: This defines the initial view of the clustergram. A clutergram can have many views available (discussed [here](#making-additional-views)) and these views generally consist of filtered versions of the clustergram.

```sidebar_width```: The width, in pixels, of the sidebar. The default is 150px.

```sidebar_icons```: This determines whether the sidebar will have icons for help, share, and screenshot. The default is true.

```max_allow_fs```: This sets the maximum allowed font-size. The default is set to 16px.
