Getting Started
---------------

Introduction
============
Clustergrammer is an interactive web-based tool for visualizing high-dimensional data as hierarchically clustered heatmap. Clustergrammer can be used in three main ways: 1) web application, Jupyter notebook interactive widget, and JavaScript and Python libraries. This section will provide quick instructions on how to

.. _getting_started_web_app:

Getting Started Clustergrammer-Web
==================================
Instructions for using the web application...

.. _getting_started_widget:

Getting Started Clustergrammer-Widget
=====================================
Here is a link to a notebook with an example interactive widget hosted on nbviewer:
`Interactive Widget <http://nbviewer.jupyter.org/github/MaayanLab/clustergrammer-widget/blob/master/Running_clustergrammer_widget.ipynb>`_

Interacting with Clustergrammer
===============================
Clustergrammer is built to enable users to intuitively explore/analyze high-dimensional datasets and has many interactive features:

- zooming/panning
- row/column reordering (e.g. reorder based on sum)
- interactive dendrogram
- dimensionality reduction (e.g. filter rows based on variance)
- interactive row/column categories

.. _getting_started_web_development:

Getting Started Web Development
================================
Clustergrammer can be used to generate a interactive visualizations for your web application. Clustergrammer consists of two parts:

#. the front-end Clustergrammer.js JavaScript library makes the interactive visualization
#. the back-end Clustergrammer.py Python library clusters a matrix of data and makes the JSON for the front-end

These libraries can be installed npm, ``npm install Clustergrammer``, and pip, ``pip install clustergrammer``, respectively.


The easiest way to generate a visualize of your own data on a webpage is to:

#. follow the :ref:`python_workflow_example` to cluster your matrix and generate the front-end JSON
#. then use the :ref:`example_pages` workflow to visualize your calculated JSON

