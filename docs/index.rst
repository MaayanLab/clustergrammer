.. sphinx-autobuild . _build_html
Welcome to Clustergrammer's Documentation!
==========================================
Clustergrammer is an web-based visualization tool that enables users to easily generate highly interactive and shareable/embeddable heatmap visualizations of high-dimensional data. The front-end is built using D3.js and back-end calculations are done using Python.The easiest way to use Clustergrammer is to upload a file with your matrix of data to the `Clustergrammer web application`_. Please read the :doc:`getting_started` guide for more information.

Interactive Demo
----------------
Press play or interact with the demo below:

.. raw:: html

         <iframe id='iframe_preview' src="http://amp.pharm.mssm.edu/clustergrammer/demo/" frameBorder="0" style='height: 495px; width:730px;'></iframe>

Using Clustergrammer
---------------------
Clustergrammer can be used in three ways:

#. :ref:`Web application <getting_started_web_app>`
#. Jupyter Notebook :ref:`Interactive Widget <getting_started_widget>`
#. `JavaScript <https://github.com/MaayanLab/clustergrammer>`_ and `Python <https://github.com/MaayanLab/clustergrammer-py>`_ Libraries

Contents:

.. toctree::
   :maxdepth: 2

   getting_started
   web_app
   jupyter_widget
   clustergrammer_js
   developing_with_clustergrammer
   input_matrix_data_formats


Indices and tables
==================

* :ref:`genindex`
* :ref:`search`
.. * :ref:`modindex`


.. _`Clustergrammer web application`: http://amp.pharm.mssm.edu/clustergrammer/