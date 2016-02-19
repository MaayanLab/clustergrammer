var change_groups = require('../dendrogram/change_groups');
var search = require('../search');
var reorder = require('../reorder/all_reorder');

module.exports = function ini_sidebar(params){

  var search_obj = search(params, params.network_data.row_nodes, 'name');

  // col groups
  $( params.root+' .slider_col' ).slider({
    value:0.5,
    min: 0,
    max: 1,
    step: 0.1,
    slide: function( event, ui ) {
      $( "#amount" ).val( "$" + ui.value );
      var inst_index = ui.value*10;
      change_groups(params, 'col',inst_index);
    }
  });

  // row groups
  $( ".slider_row" ).slider({
    value:0.5,
    min: 0,
    max: 1,
    step: 0.1,
    slide: function( event, ui ) {
      $( "#amount" ).val( "$" + ui.value );
      var inst_index = ui.value*10;
      change_groups(params, 'row',inst_index);
    }
  });

  $(params.root+' .gene_search_box').autocomplete({
    source: search_obj.get_entities
  });

  // submit genes button
  $(params.root+' .gene_search_box').keyup(function(e) {
    if (e.keyCode === 13) {
      var search_gene = $('.gene_search_box').val();
      search_obj.find_entity(search_gene);
    }
  });

  $(params.root+' .submit_gene_button').off().click(function() {
    var gene = $('.gene_search_box').val();
    search_obj.find_entity(gene);
  });

  $(params.root+' .toggle_row_order .btn').off().click(function(evt) {
    var order_id = $(evt.target).attr('name').split('_')[0];
    d3.selectAll(params.root+' .toggle_row_order .btn').classed('active',false);
    d3.select(this).classed('active',true);
    reorder(params, order_id,'row');
  });

  $(params.root+' .toggle_col_order .btn').off().click(function(evt) {
    var order_id = $(evt.target).attr('name').split('_')[0];
    d3.selectAll(params.root+' .toggle_col_order .btn').classed('active',false);
    d3.select(this).classed('active',true);
    reorder(params, order_id,'col');
  });

};
