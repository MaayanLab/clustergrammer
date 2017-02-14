Input Matrix Format
-------------------
Clustergrammer.py takes as input either:

- a tab-separated matrix file with unique row and column names as input
- a Pandas DataFrame

The tab-separated matrix file can take several formats shown below, which can include row/column categories and name/category titles. Titles will be shown as a title above row/column names or a name adjacent to row/column categories.


Simple Matrix Format
====================
The simplest file format is shown here:
::

  	Col-A	Col-B	Col-C
  Row-A	0.0	-0.1	1.0
  Row-B	3.0	0.0	8.0
  Row-C	0.2	0.1	2.5

Simple Matrix-Category Format
=============================
Row and column categories can also be included in the matrix in the following way:

.. image:: _static/cat_tsv.png
	:width: 700px

This screenshot of an Excel spreadsheet shows a single row category being added as an additional column of strings (e.g. ``Type: Interesting``) and a single column category being added as an additional row of strings (e.g. ``Gender: Male``). Up to 15 categories can be added in a similar manner. Titles for row or column names or categories can be added by prefixing each string with ``'Title: '`` (note that a space after the colon). For example the title of the column names is ``Cell Line`` and the title of the row categories is ``Gender``.

Tuple Matrix-Category Format
============================
Row/column names and categories can also be encoded as Python tuples as shown below:

::

		('Cell Line: A549', 'Gender: Male')	('Cell Line: H1299', 'Gender: Female')	('Cell Line: H661', 'Gender: Female')
	('Gene: EGFR','Type: Interesting')	-3.234	5.03	0.001
	('Gene: TP53','Type: Not Interesting')	8.3	4.098	-12.2
	('Gene: IRAK','Type: Not Interesting')	7.23	3.01	0.88

This format is easier to work with in Python and can be imported/exported easily into Pandas DataFrames. Note that 'titles' have been added to row/column names and categories as discussed above.

Matrix File Examples
====================
Several example tab-separated matrix files can be found in `example matrix files`_.

Loading and Exporting into Clustergrammer.py
============================================
Clustergrammer.py can load a matrix directly from a file or from a Pandas DataFrame as well as export to a file or Pandas DataFrame:
::

	# initialize Network object
	from clustergrammer import Network
	net = Network()

	# load matrix
	##############

	# load data from file
	net.load_file('your_matrix.txt')

	# load data from Pandas DataFrame, saved as variable df
	net.load_df(df)

	# export matrix
	################

	# export to tsv
	net.export_matrix_to_tsv('filename.txt')

	# export Pandas DataFrame
	df_export = net.export_df()

For more information about Clustergrammer.py and its API see :ref:`clustergrammer_py`.

.. _`example matrix files`: https://github.com/MaayanLab/clustergrammer/tree/master/txt