Input Matrix Format
-------------------
Clustergrammer.py takes as input:

#. a tab-separated matrix file with unique row and column names as input
#. a Pandas DataFrame

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

This screenshot of an Excel spreadsheet shows a single row category being added as an additional column of strings (e.g. ``Type: Interesting``) and a single column category being added as an additional row of strings (e.g. ``Gender: Male``). Up to 15 categories can be added in a similar manner. Titles for row or column names or categories can be added by prefixing each string with ``Title: ``` (note that a space after the colon). For example the title of the column names is ``Cell Line`` and the title of the row categories is ``Gender``.

These categories will be shown as a title above row/column names or a name adjacent to row/column categories.

Tuple Matrix-Category Format
============================