.. sphinx-autobuild . _build_html

Welcome to Clustergrammer's Documentation!
------------------------------------------
Clustergrammer is an web-based visualization tool that enables users to easily generate highly interactive and shareable/embeddable heatmap visualizations of high-dimensional data. The front-end is built using D3.js and back-end calculations are done using Python. The easiest ways to use Clustergrammer are to:

- upload a file with your data to the `Clustergrammer web application`_,
- or visualize your data within a Jupyter notebook using Clustergrammer-Widget.

Please read the :doc:`getting_started` guide for more information.

Interactive Demo
================
Press play or interact with the demo below:

.. raw:: html

         <iframe id='iframe_preview' src="http://amp.pharm.mssm.edu/clustergrammer/demo/" frameBorder="0" style='height: 495px; width:730px; margin-bottom:15px;'></iframe>

About Clustergrammer
====================
Clustergrammer is a web-based visualization tool for visualizing high-dimensional data (e.g. a matrix of data) using hierarchically clustered heatmaps. Clustergrammer's front-end (Clustergrammer.js) is built using D3.js and its back-end (Clustergrammer.py) is built using Python (e.g. SciPy). The Clustergrammer project is modular and can be used in several ways:

#. :ref:`Web application <getting_started_web_app>`
#. Jupyter Notebook :ref:`Interactive Widget <getting_started_widget>`
#. `JavaScript <https://github.com/MaayanLab/clustergrammer>`_ and `Python <https://github.com/MaayanLab/clustergrammer-py>`_ Libraries

The web application is the easiest way for a user to generate an interactive and shareable visualization. For more technical users, the Jupyter widget enables visualizations to be built within Jupyter notebook workflows and shared through Jupyter's Nbviewer. Finally, web developers can use Clustergrammer's libraries or Clustergrammer-Web's API to dynamically generate visualizations for their own web appliications.

Use Cases
=========
Clustergrammer can be used to explore and analyze a diverse datasets:

- `Cancer Cell Line Encyclopedia Gene Expression Data`_
- `Iris flower dataset`_
- `MNIST Handwritten Digit Dataset`_

Clustergrammer can easily be integrated into other web applications and is being utilized to visualize data for the following Ma'ayan lab web applications:

- `Enrichr`_
- `GEN3VA`_
- `L1000CDS2`_
- `GEO2Enrichr`_
- `Harmonizome`_

Contents:
=========

.. toctree::
   :maxdepth: 2

   getting_started
   web_app
   jupyter_widget
   viz_interaction
   clustergrammer_js
   clustergrammer_py
   developing_with_clustergrammer
   input_matrix_data_formats
   license


Indices and tables
==================

* :ref:`genindex`
* :ref:`search`


.. _`Clustergrammer web application`: http://amp.pharm.mssm.edu/clustergrammer/
.. _`Enrichr`: http://amp.pharm.mssm.edu/Enrichr/
.. _`GEN3VA`: http://amp.pharm.mssm.edu/gen3va/
.. _`L1000CDS2`: http://amp.pharm.mssm.edu/l1000cds2/
.. _`GEO2Enrichr`: http://amp.pharm.mssm.edu/g2e/
.. _`Harmonizome`: http://amp.pharm.mssm.edu/Harmonizome/
.. _`Iris flower dataset`: http://nbviewer.jupyter.org/github/MaayanLab/iris_clustergrammer_visualization/blob/master/Iris%20Dataset.ipynb
.. _`MNIST Handwritten Digit Dataset`: https://maayanlab.github.io/MNIST_heatmaps/
.. _`Cancer Cell Line Encyclopedia Gene Expression Data`: http://amp.pharm.mssm.edu/clustergrammer/CCLE/
