var change_groups = require('../dendrogram/change_groups');
var search = require('../search');
var all_reorder = require('../reorder/all_reorder');

module.exports = function ini_sidebar(params){

  // initializes sidebar buttons and sliders, used by update_network 

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
  $( params.root+' .slider_row' ).slider({
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

  _.each(['row','col'], function(inst_rc){

    $(params.root+' .toggle_'+inst_rc+'_order .btn').off().click(function(evt) {

      var order_id = $(evt.target)
        .attr('name')
        .replace('_row','')
        .replace('_col','');

      d3.selectAll(params.root+' .toggle_'+inst_rc+'_order .btn')
        .classed('active',false);

      d3.select(this)
        .classed('active',true);

      all_reorder( params, order_id, inst_rc);

    });

  });



};
