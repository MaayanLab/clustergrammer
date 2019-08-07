<!-- # clustergrammer -->
<!-- # ![clustergrammer_logo](img/clustergrammer_logo.png | width=100) -->

<img src='img/clustergrammer_logo.png' alt="Clustergramer" width="300px" >

[![NPM](https://img.shields.io/npm/v/clustergrammer.svg)](https://www.npmjs.com/package/clustergrammer)
[![NPM](https://img.shields.io/npm/l/clustergrammer.svg)](https://github.com/MaayanLab/clustergrammer/blob/master/LICENSES/LICENSE)

Clustergrammer is a web-based tool for visualizing high-dimensional data (e.g. a matrix) as an interactive and shareable hierarchically clustered heatmap. Clustergrammer's front end ([Clustergrammer-JS](http://clustergrammer.readthedocs.io/clustergrammer_js.html#clustergrammer-js)) is built using [D3.js](https://d3js.org/) and its back-end ([Clustergrammer-PY](http://clustergrammer.readthedocs.io/clustergrammer_py.html#clustergrammer-py)) is built using Python. Clustergrammer produces highly interactive visualizations that enable intuitive exploration of high-dimensional data and has several biology-specific features (e.g. enrichment analysis, see [Biology-Specific Features](http://clustergrammer.readthedocs.io/biology_specific_features.html#biology-specific-features)) to facilitate the exploration of gene-level biological data. Click the screenshot below to view an interactive tutorial:

[![demo_screenshot](img/demo_high-fr.gif "demo_high-fr.gif")](http://maayanlab.github.io/clustergrammer/scrolling_tour)

Clustergrammer's interacive features include:
- [Zooming and Panning](http://clustergrammer.readthedocs.io/interacting_with_viz.html#zooming-and-panning)
- [Row and Column Reordering](http://clustergrammer.readthedocs.io/interacting_with_viz.html#row-col-reordering)
- [Interactive Dendrogram](http://clustergrammer.readthedocs.io/interacting_with_viz.html#interactive-dendrogram)
- [Interactive Dimensionality Reduction](http://clustergrammer.readthedocs.io/interacting_with_viz.html#interactive-dim-reduction)
- [Interactive Categories](http://clustergrammer.readthedocs.io/interacting_with_viz.html#interactive-categories)
- [Cropping](http://clustergrammer.readthedocs.io/interacting_with_viz.html#crop)
- [Row Searching](http://clustergrammer.readthedocs.io/interacting_with_viz.html#search)
- [Biology-Specific Features](http://clustergrammer.readthedocs.io/biology_specific_features.html)

Clustergrammer can be used in three main ways (this repo contains the source code for [Clustergrammer-JS](http://clustergrammer.readthedocs.io/clustergrammer_js.html#clustergrammer-js)):

- [Clustergrammer Web App](http://clustergrammer.readthedocs.io/clustergrammer_web.html#clustergrammer-web) ([http://amp.pharm.mssm.edu/clustergrammer/](http://amp.pharm.mssm.edu/clustergrammer/))
- [Clustergrammer Jupyter Widget](http://clustergrammer.readthedocs.io/clustergrammer_widget.html#clustergrammer-widget)
- [Clustergrammer-JS](http://clustergrammer.readthedocs.io/clustergrammer_js.html#clustergrammer-js) and [Clustergrammer-PY](http://clustergrammer.readthedocs.io/clustergrammer_py.html#clustergrammer-py) libraries

For information about building a webpage or app using Clustergrammer see: [Web-Development with Clustergrammer](http://clustergrammer.readthedocs.io/building_webpage.html)

# What's New

## Clustergrammer2

[![badge](https://img.shields.io/badge/launch-1.0_Running_Clustergrammer2-579ACA.svg?logo=data:image/png;base64,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)](https://mybinder.org/v2/gh/ismms-himc/clustergrammer2-notebooks/master?filepath=notebooks%2F1.0_Running_Clustergrammer2.ipynb) [![Nbviewer](https://github.com/jupyter/design/blob/master/logos/Badges/nbviewer_badge.svg)](https://nbviewer.jupyter.org/github/ismms-himc/clustergrammer2-notebooks/blob/master/notebooks/1.0_Running_Clustergrammer2.ipynb)

[![Running Clustergrammer2](http://img.youtube.com/vi/UgO5LLvcfB0/0.jpg)](http://www.youtube.com/watch?v=UgO5LLvcfB0)

Clustergrammer is being re-built using the WebGL library [regl](http://regl.party/). The new in-development front-end is [Clustergrammer-GL](https://github.com/ismms-himc/clustergrammer-gl) and the new in-development Jupyter widget is [Clustergrammer2](https://github.com/ismms-himc/clustergrammer2). The above notebook shows how Clustergrammer2 can be used to load a small dataset and visualize a large random DataFrame. By running the notebook on MyBinder using [Jupyter Lab](https://mybinder.org/v2/gh/ismms-himc/clustergrammer2_examples/master?urlpath=lab) it can also be used to visualize a user uploaded dataset. Please see the video tutorial above for more information.

For additional examples and tutorials please see:

* [Case Studies and Tutorials](https://clustergrammer.readthedocs.io/case_studies.html)
* [Clustergrammer2-Notebooks](https://github.com/ismms-himc/clustergrammer2-notebooks) GitHub repository

## JupyterCon 2018 Presentation
[![Clustergrammer JupyterCon 2018](http://img.youtube.com/vi/82epZkmfkrE/0.jpg)](http://www.youtube.com/watch?v=82epZkmfkrE)

Clustergrammer was recently presented at JupyterCon 2018 (see [slides](http://bit.ly/clustergrammer-jupytercon)).

# Using Clustergrammer

Pleae see Clustergramer's [documentation](http://clustergrammer.readthedocs.io/) for detailed information or select a specific topic below:

- [Getting Started](http://clustergrammer.readthedocs.io/getting_started.html)
- [Interacting with the Visualization](http://clustergrammer.readthedocs.io/interacting_with_viz.html)
- [Web-Development with Clustergrammer](http://clustergrammer.readthedocs.io/building_webpage.html) ([example pages](http://clustergrammer.readthedocs.io/clustergrammer_js.html#example-pages))
- [Clustergrammer Web App](http://clustergrammer.readthedocs.io/clustergrammer_web.html#clustergrammer-web) and [Clustergrammer Jupyter Widget](http://clustergrammer.readthedocs.io/clustergrammer_widget.html#clustergrammer-widget)
- [Matrix Formats and Input/Output](http://clustergrammer.readthedocs.io/matrix_format_io.html)
- Core libraries: [Clustergrammer-JS](http://clustergrammer.readthedocs.io/clustergrammer_js.html) and [Clustergrammer-PY](http://clustergrammer.readthedocs.io/clustergrammer_py.html)
- [App Integration Examples](http://clustergrammer.readthedocs.io/app_integration.html)
- [Case Studies and Examples](https://clustergrammer.readthedocs.io/case_studies.html)
- [Biology-Specific Features](https://clustergrammer.readthedocs.io/biology_specific_features.html)
- [Developing Clustergrammer](https://clustergrammer.readthedocs.io/developing_with_clustergrammer.html)

## Citing Clustergrammer
Please consider supporting Clustergrammer by citing our publication:

Fernandez, N. F. et al. Clustergrammer, a web-based heatmap visualization and analysis tool for high-dimensional biological data. Sci. Data 4:170151 doi: [10.1038/sdata.2017.151](https://www.nature.com/articles/sdata2017151 ) (2017).

## Licensing
Clustergrammer was developed by the [Ma'ayan lab](http://labs.icahn.mssm.edu/maayanlab/) at the [Icahn School of Medicine at Mount Sinai](http://icahn.mssm.edu/) for the [BD2K-LINCS DCIC](http://lincs-dcic.org/#/) and the [KMC-IDG](http://commonfund.nih.gov/idg/overview). Clustergrammer's license and third-party licenses are in the LICENSES directory and more information can be found at [Clustergrammer License](https://clustergrammer.readthedocs.io/license.html).

Please [contact us](http://clustergrammer.readthedocs.io/#funding-and-contact) for support, licensing questions, comments, and suggestions.
