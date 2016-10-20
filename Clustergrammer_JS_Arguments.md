# Optional clustergrammer.js Arguments

These arguments can also be passsed to Clustergrammer as part of the args object.

```row_label``` and ```col_label```: Pass strings that will be used as 'super-labels' for the rows and columns.

```row_label_scale``` and ```col_label_scale```: A number that will be used as a scaling factor that increases or decreases the size of row and column labels (as well as the font-size of the text).

```super_label_scale```: A number that will be used a a scaling factor that increases or decreases the size of the 'super-labels'.

```ini_expand```: Initialize the visualization in 'expanded' mode so that the sidebar controls are not visible.

```opacity_scale```: This defines the function that will map values in your matrix to opacities of cells in the visualization. The default is 'linear', but 'log' is also available.

```input_domain```: This defines the maximum (absolute) value from your input matrix that corresponds to an opacity of 1. The default is defined based on the maximum absolute value of any cell in your matrix. Lowering this value will increase the opacity of the overall visualization and effectively cutoff the visualization opacity at the value you choose.

```do_zoom```: This determines whether zooming will be available in the visualization. The default is set to true.

```tile_colors```: This determines the colors that indicate positive and negative values, respectively, in the visualization. The default are red and blue. The input for this is an array of hexcode or color names, e.g. ```['#ED9124','#1C86EE']```.

```row_order``` and ```col_order```: This sets the initial ordering of rows and columns. The default is clust. The options are
  * alpha: ordering based on names of rows or columns
  * clust: ordering based on clustering (covered [here](#clustergrammer-python-library))
  * rank: ordering based on the sum of the values in row/column
  * rank_var: ordering based on the variance of the values in the row/column

```ini_view```: This defines the initial view of the clustergram. A clutergram can have many views available (discussed [here](#clustergrammer-python-library)) and these views generally consist of filtered versions of the clustergram.

```sidebar_width```: The width, in pixels, of the sidebar. The default is 150px.

```sidebar_icons```: This determines whether the sidebar will have icons for help, share, and screenshot. The default is true.

```max_allow_fs```: This sets the maximum allowed font-size. The default is set to 16px.
