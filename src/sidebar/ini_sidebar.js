require('jquery-ui/slider');
var change_groups = require('../dendrogram/change_groups');
var search = require('../search');
var all_reorder = require('../reorder/all_reorder');
var ini_cat_reorder = require('../reorder/ini_cat_reorder');

module.exports = function ini_sidebar(params){

  // initializes sidebar buttons and sliders
  // this function is also used by update_network

  var search_obj = search(params, params.network_data.row_nodes, 'name');

  $(params.root+' .gene_search_box').autocomplete({
    source: search_obj.get_entities
  });

  // submit genes button
  $(params.root+' .gene_search_box').keyup(function(e) {
    if (e.keyCode === 13) {
      var search_gene = $(params.root+' .gene_search_box').val();
      search_obj.find_entity(search_gene);
    }
  });

  $(params.root+' .submit_gene_button').off().click(function() {
    var gene = $(params.root+' .gene_search_box').val();
    search_obj.find_entity(gene);
  });

  var reorder_types;
  if (params.sim_mat){
    reorder_types = ['both'];
  } else {
    reorder_types = ['row','col'];
  }

  _.each( reorder_types, function(inst_rc){

    // dendrogram
    $( params.root+' .slider_'+inst_rc ).slider({
      value:0.5,
      min: 0,
      max: 1,
      step: 0.1,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.value );
        var inst_index = ui.value*10;
        if (inst_rc != 'both'){
          change_groups(params, inst_rc, inst_index);
        } else {
          change_groups(params, 'row', inst_index);
          change_groups(params, 'col', inst_index);
        }
      }
    });

    // reorder buttons
    $(params.root+' .toggle_'+inst_rc+'_order .btn')
      .off()
      .click(function(evt) {

        var order_id = $(evt.target)
          .attr('name')
          .replace('_row','')
          .replace('_col','');

        d3.selectAll(params.root+' .toggle_'+inst_rc+'_order .btn')
          .classed('active',false);

        d3.select(this)
          .classed('active',true);

        if (inst_rc != 'both'){
          all_reorder( params, order_id, inst_rc);
        } else{
          all_reorder( params, order_id, 'row');
          all_reorder( params, order_id, 'col');
        }

      });

  });

  ini_cat_reorder(params);

  $( params.root+' .opacity_slider' ).slider({
    // value:0.5,
    min: 0.1,
    max: 2.0,
    step: 0.1,
    slide: function( event, ui ) {

      $( "#amount" ).val( "$" + ui.value );
      var inst_index = 2 - ui.value;

      var scaled_max = params.matrix.abs_max_val * inst_index;

      params.matrix.opacity_scale.domain([0, scaled_max]);

      d3.selectAll(params.root+' .tile')
        .style('fill-opacity', function(d) {
          // calculate output opacity using the opacity scale
          var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
          return output_opacity;
        });


    }
  });

};
