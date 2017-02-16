<!-- # clustergrammer -->
<!-- # ![clustergrammer_logo](img/clustergrammer_logo.png | width=100) -->

<img src='img/clustergrammer_logo.png' alt="Clustergramer" width="300px" >

[![NPM](https://img.shields.io/npm/v/clustergrammer.svg)](https://www.npmjs.com/package/clustergrammer)
[![NPM](https://img.shields.io/npm/l/clustergrammer.svg)](https://github.com/MaayanLab/clustergrammer/blob/master/LICENSES/LICENSE)

Clustergrammer is an interactive web-based tool for visualizing high-dimensional data as heatmaps. The front-end JavaScript library, [clustergrammer.js](#clustergrammer-javascript-library) is built using D3.js and 'back-end' calculations are done using the Python library [clustergrammer.py](#clustergrammer-python-library). Pleae see Clustergramer's [documentation](http://clustergrammer.readthedocs.io/) for more information. Click the screenshot below to view an interaceive tutorial:

[![demo_screenshot](img/demo_screenshot.png "demo_screenshot.png")](http://maayanlab.github.io/clustergrammer/scrolling_tour)

The project began as an extension of this example http://bost.ocks.org/mike/miserables/ and some of clustergrammer's interacive features include:
- zooming/panning
- multiple reordering options (e.g. variance)
- interactive dendrogram
- row filtering and searching
- row/column categories

Clustergrammer is designed to be a reusable chart and has been integrated into several [Ma'ayan lab](http://icahn.mssm.edu/research/labs/maayan-laboratory) web tools including:
- [Clustergrammer (web application)](http://amp.pharm.mssm.edu/clustergrammer/)
- [Enrichr](http://amp.pharm.mssm.edu/Enrichr/)
- [GEN3VA](http://amp.pharm.mssm.edu/gen3va/)
- [L1000CDS2](http://amp.pharm.mssm.edu/l1000cds2/)
- [GEO2Enrichr](http://amp.pharm.mssm.edu/g2e/)
- [Harmoniozome](http://amp.pharm.mssm.edu/Harmonizome/)

# Using Clustergrammer
Clustergrammer can be used as:
* **Libraries**: [clustergrammer.js](#clustergrammer-javascript-library) and [clustergrammer.py](#clustergrammer-python-library) libraries by developers
* **Notebook Widget**: Jupyter/IPython notebook [interactive-widget](http://nbviewer.jupyter.org/github/MaayanLab/clustergrammer-widget/blob/master/Running_clustergrammer_widget.ipynb) ([GitHub repo](https://github.com/MaayanLab/clustergrammer-widget))
* **Web-app**: [http://amp.pharm.mssm.edu/clustergrammer/](http://amp.pharm.mssm.edu/clustergrammer/)

Clustergrammer consists of two parts: 1) the front-end JavaScript library [clustergrammer.js](#clustergrammer-javascript-library) used the make the interactive visualization, and 2) the 'back-end' [clustergrammer.py](#clustergrammer-python-library) used to cluster your data and make the [JSON](https://github.com/MaayanLab/clustergrammer-json) for the front-end visualization.

You can install [clustergrammer.js](#clustergrammer-javascript-library) by downloading the [latest release](https://github.com/MaayanLab/clustergrammer/releases/latest) or with npm `npm install clustergrammer`. You also install [clustergrammer.py](#clustergrammer-python-library) by downloading the [latest release](https://github.com/MaayanLab/clustergrammer-py/releases/latest) or with pip `pip install clustergrammer`.

The easiest way to visualize a matrix of your own data is to follow the [example Python workflow](#example-python-workflow) that demonstrates how to use the Python library [clustergrammer.py](#clustergrammer-python-library). Users can also generate the JSON for clustergrammer.js (see the example [mult_view.json](json/mult_view.json)) using their own scripts as long as they adhere to the [format](https://github.com/MaayanLab/clustergrammer-json).


# Clustergrammer JavaScript Library
Clustergrammer.js uses the visualization library D3.js to build an interactive heatmap visualization made using SVG. The Clustergrammer.js source code is under the [src](src) directory and Webpack Module Developer is being used to make clustergrammer.js.

To make a visualization pass an arguments object with the following required values to Clustergrammer:
```
// load visualization JSON to network_data

var args = {
  'root':'#id_of_container',
  'network_data': network_data
};

var cgm = Clustergrammer(args);
```
The id of the container where the visualization SVG will be placed is passed as ```root``` (this root container must be made by the user). The visualization JSON (example here [mult_view.json](json/mult_view.json) and format discussed [here](https://github.com/MaayanLab/clustergrammer-json)) contains the information necessary to make your visualization and  is passed as ```network_data```. The visualization JSON is produced by [clustergrammer.py](https://github.com/MaayanLab/clustergrammer-py/). See additional [optional clustergrammer.js arguments](optional_clustergrammerjs_arguments.md) for additional options that can be passed to clustergrammer.js.

### Clustergrammer.js Dependencies
- D3.js
- jQuery
- Underscore.js

### Visualization Resizing
The visualization can be resized by: first resizing the container and then resizing the visualization using ```cgm.resize_viz()```. An example of resizing when the window change size is shown below.

```
d3.select(window).on('resize', function(){

  // first, resize the container when the screen size changes
  your_function_to_resize_the_container();

  // then, resize the visualization to match the container's new size
  cgm.resize_viz();

});
```

# Example Webpages
The page [index.html](index.html) (and the corresponding script [load_clustergram.js](js/load_clustergram.js)) demonstrates how to make a full-screen resizable clustergrammer visualization.

The page [multiple_clustergrams.html](multiple_clustergrams.html) (and corresponding script [load_multiple_clustergrams.js](js/load_multiple_clustergrams.js)) demonstrates how to visualize multiple clustergrams on one page. Note that each visualization requires its own container.

# Clustergrammer Python Library
The Clustergrammer python library [clutergrammer.py](https://github.com/MaayanLab/clustergrammer-py), takes a tab-separated matrix file as input (see format [here](#input-matrix-format)), calculates clustering, and generates the visualization json (see format [here](https://github.com/MaayanLab/clustergrammer-json)) for clustergrammer.js. The library can be installed using [pip](https://pypi.python.org/pypi/clustergrammer/) and is compatable with Python 2.7 and 3.5:

```
# Python 2
$ pip install clustergrammer

# Python 3
$ pip3 install clustergrammer
```

or the source code can be obtained from clustergrammer.py [repo](https://github.com/MaayanLab/clustergrammer-py): simply copy the clustergrammer directory with the source code to the main directory to use the library in this repo.

### Clustergrammer.py Dependencies
- Numpy
- Scipy
- Pandas

## Example Python Workflow

```
from clustergrammer import Network
net = Network()

# load matrix file
net.load_file('txt/rc_two_cats.txt')

# calculate clustering
net.make_clust(dist_type='cos',views=['N_row_sum', 'N_row_var'])

# write visualization json to file
net.write_json_to_file('viz', 'json/mult_view.json')
```
The script [make_clustergrammer.py](make_clustergrammer.py) is used to generate the visualization [jsons](json) for the [examples pages](#example-pages) in this repo. To visualize your own data modify the [make_clustergrammer.py](make_clustergrammer.py) script.

# Input Matrix Format
Clustergrammer.py discussed [here](#clustergrammer-python-library) takes a tab separated matrix with unique row and column names as input. The simplest format is shown here (note: that tabs are required, but spaces are used in the example below to increase readability):

```
       Col-A   Col-B   Col-C
Row-A   0.0    -0.1     1.0
Row-B   3.0     0.0     8.0
Row-C   0.2     0.1     2.5
```

Row and column categories can also be included in the matrix in the following way:

![cat_tsv](img/cat_tsv.png "cat_tsv.png")

This screenshot of an Excel spreadsheet shows a single row category being added as an additional column of strings (e.g. ```'Type: Interesting'```) and a single column category being added as an additional row of strings (e.g. '```Gender: Male'```). Up to 15 categories can be added in a similar manner. Titles for row/column names or categories can be added by prefixing each string with ```Title: ```(note a space is required after the colon). For example the title of the column names is ```Cell Line``` and the title of the row categories is ```Gender``` .

Alternatively, row/column names and categories can be stored as Python tuples as shown below (or see [tuple_cats.txt](txt/tuple_cats.txt)).

```
  ('Cell Line: A549', 'Gender: Male') ('Cell Line: H1299', 'Gender: Female')  ('Cell Line: H661', 'Gender: Female')
('Gene: EGFR','Type: Interesting')  -3.234  5.03  0.001
('Gene: TP53','Type: Not Interesting')  8.3 4.098 -12.2
('Gene: IRAK','Type: Not Interesting')  7.23  3.01  0.88
```
This format is easier to export from a Python Pandas DataFrame (see [net.write_matrix_to_tsv](https://github.com/MaayanLab/clustergrammer-py/blob/master/clustergrammer/export_data.py)). Note that 'titles' have been added to row and column names as well as row and column categories.

Several example tab-separated matrix files can be found in the [txt](txt) directory. See [example Python workflow](#example-python-workflow) or [make_clustergrammer.py](make_clustergrammer.py) for examples of how to use Clustergrammer.py to generate a visualization json from these matrix files.

## Licensing
Clustergrammer was developed by Nicolas Fernandez in the [Ma'ayan lab](http://labs.icahn.mssm.edu/maayanlab/) at the [Icahn School of Medicine at Mount Sinai](http://icahn.mssm.edu/). Clustergrammer's license and third-party licenses are in the LICENSES directory.
