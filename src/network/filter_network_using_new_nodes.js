var utils = require('../Utils_clust');

module.exports = function filter_network_using_new_nodes(config, new_nodes) {

  var links = config.network_data.links;

  // get new names of rows and cols
  var row_names = utils.pluck(new_nodes.row_nodes, 'name');
  var col_names = utils.pluck(new_nodes.col_nodes, 'name');

  var new_links = _.filter(links, function(d){
    var inst_row = d.name.split('_')[0];
    var inst_col = d.name.split('_')[1];

    var row_index = _.indexOf(row_names, inst_row);
    var col_index = _.indexOf(col_names, inst_col);

    if ( row_index >-1 & col_index >-1 ){
      // redefine source and target
      d.source = row_index;
      d.target = col_index;
      return d;
    }
  });

  // set up new_network_data
  var new_network_data = {};
  // rows
  new_network_data.row_nodes = new_nodes.row_nodes;
  new_network_data.row_nodes_names = row_names;
  // cols
  new_network_data.col_nodes = new_nodes.col_nodes;
  new_network_data.col_nodes_names = col_names;
  // links
  new_network_data.links = new_links;
  // save all links
  new_network_data.all_links = links;
  // add back all views
  new_network_data.views = config.network_data.views;

  // add cat_colors if necessary
  if (_.has(config.network_data, 'cat_colors')){
    new_network_data.cat_colors = config.network_data.cat_colors;
  }

  return new_network_data;
};
