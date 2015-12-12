function filter_network_data(orig_network_data, change_view){
 
  var views = orig_network_data.views;

  // failsafe if there is only row+col filtering from front-end
  var inst_view = _.find(views, function(d){

    if (_.has(change_view,'filter_row')){

      console.log('change view has filter_row')

      // failsafe from json 
      if (_.has(d, 'filter_row')){
        return d.filter_row == change_view.filter_row;
      } else {
        return d.filt == change_view.filter_row;
      }

    } else {
      return d.filt==change_view.filter;
    }

  });

  var new_nodes = inst_view.nodes;

  // get new names of rows and cols 
  var row_names = _.pluck(new_nodes.row_nodes, 'name');
  var col_names = _.pluck(new_nodes.col_nodes, 'name');

  var links = orig_network_data.links;

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
  })

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

  // pass on all views 
  new_network_data.views = views;
  
  return new_network_data;

}