var utils = require('../utils');
var filter_using_new_nodes = require('./filter_using_new_nodes');

module.exports = function(params, orig_network_data, change_view) {
  console.log('change_network_view');
  var views = orig_network_data.views;


  // Get Row Filtering View
  ///////////////////////////////////////////////////////////////
  // change_view has the name of the new view (e.g. {N_row_sum:20})
  // this view name is used to pull up the view information. The view consists
  // of a description of the view (e.g N_row_sum number and distance type) and
  // the nodes of the view (e.g. row_nodes and col_nodes). With the new set of
  // nodes, new_nodes, the links will be filtered in order to only keep links
  // between nodes that still exist in the view

  if (utils.has(change_view,'filter_row')){

    // failsafe if there is only row+col filtering from front-end
    var filt_views = _.filter(views, function(d){

      // failsafe from json
      if (utils.has(d, 'filter_row')){
        // filter_row_value is the same as filter_row
        return d.filter_row == change_view.filter_row;
      } else {
        return d.filt == change_view.filter_row;
      }

    });

  } else if (utils.has(change_view, 'filter_row_value')) {

    // filter row value
    var filt_views = _.filter(views, function(d){

      // failsafe from json
      return d.filter_row_value == change_view.filter_row_value;

    });

  } else if (utils.has(change_view,'filter_row_sum')) {

    var filt_views = _.filter(views, function(d){
      return d.filter_row_sum == change_view.filter_row_sum;
    });

  } else if (utils.has(change_view,'filter_row_num')) {

    var filt_views = _.filter(views, function(d){
      return d.filter_row_num == change_view.filter_row_num;
    });

  } else if (utils.has(change_view, 'N_row_sum')){

    var filt_views = _.filter(views, function(d){
      return d.N_row_sum == change_view.N_row_sum;
    });

    if(typeof filt_views === 'undefined'){
        filt_views = [views[0]];
    }

  }

  if (change_view==='default'){
    filt_views = [views[0]];
  }

  /*
  get the inst_view
  */

  // get the single view that will be used to update the network from
  // the array of filtered views
  if ( params.show_categories === false ){
    console.log('\nview defined by filter only, no category\n');
    console.log('there are '+String(filt_views.length)+' views with this N_row_sum');
    var inst_view = filt_views[0];

    if (utils.has(change_view,'enr_score_type')){

      inst_view = _.filter(filt_views, function(d){
        return d.enr_score_type == change_view.enr_score_type;
      })[0];

      console.log('\n\n final inst_view ');
      console.log(inst_view);
    }

  }

  if (params.show_categories){
    console.log('\nview defined by filter and category\n');
    // apply category filtering if necessary
    var inst_view = _.find(filt_views, function(d){
      return d.col_cat === params.current_col_cat;
    });
  }

  /*
  assign the inst_view, if it is defined
  */
  if (typeof inst_view !== 'undefined'){

    var new_nodes = inst_view.nodes;
    var links = orig_network_data.links;
    var new_network_data = filter_using_new_nodes(params, new_nodes, links, views);

  } else {
    var new_network_data = orig_network_data;
  }

  return new_network_data;
};
