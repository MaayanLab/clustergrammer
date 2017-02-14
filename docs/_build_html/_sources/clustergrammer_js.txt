Clustergrammer.js
-----------------
The front-end library Clustergrammer.js builds the interactive heatmap visualization in SVG using the visualization library D3.js. Clustergrammer is built using Webpack Module Developer.

Dependencies
============

- D3.js
- JQuery
- Underscore

Installation
============
Clustergrammer.js can be installed using node package manager (`npm package`_) with the following:
::

  npm install clustergrammer

or the source code can be obtained from the `Clustergrammer.js repo`_.

.. _javascript_workflow_example:

JavaScript Workflow Example
============================
This workflow shows how to make a visualization using a JSON produced by Clustergrammer.py
::

  // load visualization JSON to network_data
  var args = {
    'root': '#id_of_container',
    'network_data': 'network_data'
  }

  var cgm = Clustergrammer(args);

The id of the container where the visualizaton will be made is passed as ``root`` (this root container must be made by the user). The visualization JSON contains the information necessary to make the visualization and is passed as ``network_data``. See the Clustergrammer.js API for additional arguments that can be passed to Clustergrammer.js.

.. _example_pages:

Example Pages
=============
The `Clustergrammer.js repo`_ contains several example pages demonstrating how to make a webpage with a Clustergramemr heatmap. The page `index.html`_ and corresponding script `load_clustergram.js`_ show how to make a full-screen resizable visualization.

The page `multiple_clust.html`_ and corresponding script `load_multiple_clustergrams.js`_ show how to visualize multiple clustergrams on one page. Note that each heatmap requires its own container.

Clustergrammer.js API
=====================
Clustergrammer.js' API allows users to pass options to the front-end visualization, such as optional callback functions.


Clustergrammer.js JSON Format
=============================
The JSON format required for Clustergrammer.js is described here:

.. _`Clustergrammer.js repo`: https://github.com/MaayanLab/clustergrammer
.. _`npm package`: https://www.npmjs.com/package/clustergrammer
.. _`index.html`: https://github.com/MaayanLab/clustergrammer/blob/master/index.html
.. _`load_clustergram.js`: https://github.com/MaayanLab/clustergrammer/blob/master/js/load_clustergram.js
.. _`multiple_clust.html`: https://github.com/MaayanLab/clustergrammer/blob/master/multiple_clustergrams.html
.. _`load_multiple_clustergrams.js`: https://github.com/MaayanLab/clustergrammer/blob/master/js/load_multiple_clustergrams.js