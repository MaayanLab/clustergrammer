

module.exports = function ini_sliders(cgm){

    // col groups
    $( ".slider_col" ).slider({
      value:0.5,
      min: 0,
      max: 1,
      step: 0.1,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.value );
        var inst_index = ui.value*10;
        cgm.change_groups(cgm.params, 'col',inst_index);
      }
    });
    $( "#amount" ).val( "$" + $( ".slider_col" ).slider( "value" ) );

    // row groups
    $( ".slider_row" ).slider({
      value:0.5,
      min: 0,
      max: 1,
      step: 0.1,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.value );
        var inst_index = ui.value*10;
        cgm.change_groups(cgm.params, 'row',inst_index);
      }
    });
    $( "#amount" ).val( "$" + $( ".slider_row" ).slider( "value" ) );

    // opacity scale
    $( "#slider_opacity" ).slider({
      value:0.2,
      min: 0.0,
      max: 1.0,
      step: 0.1,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.value );
        var inst_index = ui.value;
        cgm.opacity_slider(inst_index);
      }
    });
    $( "#amount" ).val( "$" + $( "#slider_opacity" ).slider( "value" ) );

    $('.gene_search_box').autocomplete({
      source: cgm.get_genes()
    });

    // submit genes button
    $('.gene_search_box').keyup(function(e) {
      if (e.keyCode === 13) {
        var search_gene = $('.gene_search_box').val();
        cgm.find_gene(search_gene);
      }
    });

    $('.submit_gene_button').off().click(function() {
      var gene = $('.gene_search_box').val();
      cgm.find_gene(gene);
    });

    $('.toggle_row_order .btn').off().click(function(evt) {
      var order_id = $(evt.target).attr('name').split('_')[0];
      d3.selectAll('.toggle_row_order .btn').classed('active',false);
      d3.select(this).classed('active',true);
      cgm.reorder(cgm.params, order_id,'row');
    });

    $('.toggle_col_order .btn').off().click(function(evt) {
      var order_id = $(evt.target).attr('name').split('_')[0];
      d3.selectAll('.toggle_col_order .btn').classed('active',false);
      d3.select(this).classed('active',true);
      cgm.reorder(cgm.params, order_id,'col');
    });


};
