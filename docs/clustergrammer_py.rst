Clustergrammer.py
=================
Clustergrammer.py is the back-end calculation library that is used to hierarchically cluster the data and generate the JSON for the front-end Clustergrammer.js visualization library.

Dependencies
-------------

- Numpy
- Pandas
- SciPy

Clustergrammer.py API
---------------------
Clustergrammer.py generates a Network object, which is used to load a matrix (e.g. from a Pandas DataFrame), normalize/filter the matrix, cluster the matrix, and finally generate the visualization JSON for the front-end Clustergrammer.js.