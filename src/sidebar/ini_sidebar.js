/* eslint-disable */

var change_groups = require('../dendrogram/change_groups');
var all_reorder = require('../reorder/all_reorder');
var ini_cat_reorder = require('../reorder/ini_cat_reorder');
var run_row_search = require('../search/run_row_search');
var underscore = require('underscore');

module.exports = function ini_sidebar(cgm){

  var params = cgm.params;

  var input = d3.select(params.root+' .gene_search_box')[0][0];
  var awesomplete = new Awesomplete(input, {minChars: 1, maxItems: 15});
  var entities = cgm.params.network_data.row_nodes_names;
  awesomplete.list = entities;

  // position awesomplete list elements above other elements in the page
  d3.selectAll('.awesomplete ul').style('z-index',99);

  // submit genes button
  $(params.root+' .gene_search_box').keyup(function(e) {
    if (e.keyCode === 13) {
      var search_gene = $(params.root+' .gene_search_box').val();
      run_row_search(cgm, search_gene, entities);
    }
  });

  $(params.root+' .submit_gene_button').off().click(function() {
    var search_gene = $(params.root+' .gene_search_box').val();
      run_row_search(cgm, search_gene, entities);
  });

  var reorder_types;
  if (params.sim_mat){
    reorder_types = ['both'];
  } else {
    reorder_types = ['row','col'];
  }

  underscore.each( reorder_types, function(inst_rc){

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
          all_reorder( cgm, order_id, inst_rc);
        } else{
          all_reorder( cgm, order_id, 'row');
          all_reorder( cgm, order_id, 'col');
        }

      });

  });

  ini_cat_reorder(cgm);

  // Opacity Slider
  //////////////////////////////////////////////////////////////////////
  if (d3.select(cgm.params.root+' .opacity_slider').select('#handle-one').empty()){

    var slider_fun =  d3.slider()
                        .snap(true)
                        .value(1)
                        .min(0.1)
                        .max(1.9)
                        .step(0.1)
                        .on('slide', function(evt, value){
                          run_on_opacity_slide(evt, value);
                        });

    d3.select(cgm.params.root+' .opacity_slider')
      .call(slider_fun);

  }

  function run_on_dendro_slide(evt, value, inst_rc) {
    $( "#amount" ).val( "$" + value );
    var inst_index = value*10;
    // var inst_rc;

    if (inst_rc != 'both'){
      change_groups(cgm, inst_rc, inst_index);
    } else {
      change_groups(cgm, 'row', inst_index);
      change_groups(cgm, 'col', inst_index);
    }
  }

  function run_on_opacity_slide(evt, value){

    var inst_index = 2 - value;
    var scaled_max = cgm.params.matrix.abs_max_val * inst_index;

    cgm.params.matrix.opacity_scale.domain([0, scaled_max]);

    d3.selectAll(cgm.params.root+' .tile')
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = cgm.params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      });
  }

};