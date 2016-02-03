
function set_up_N_filters(filter_type){

  // filter 
  ////////////////////
  var views = this.params.network_data.views;
  var all_views = _.filter(views, function(d){return _.has(d,filter_type);});

  var cgm = this;

  // // filter for column category if necessary 
  // if ( _.has(all_views[0],'col_cat') ) {

  //   // get views with current_col_cat 
  //   all_views = _.filter(all_views, function(d){
  //     if (d.col_cat == this.params.current_col_cat){
  //       return d;
  //     } 
  //   })
  // }

  console.log( 'found ' + String(all_views.length) +' views for ' + filter_type )

  var inst_max = all_views.length - 1;

  // make dictionary 
  var N_dict = {};

  // filters
  var all_filt = _.pluck( this.params.network_data.views,'N_row_sum')

  _.each(all_filt, function(d){
    var tmp_index = _.indexOf(all_filt, d)

    N_dict[tmp_index] = d;

  });

  update_network = this.update_network;


  $( '#slider_'+filter_type ).slider({
    value:0,
    min: 0,
    max: inst_max,
    step: 1,
    stop: function( event, ui ) {

      console.log('ui.value '+ String(ui.value))

      // change value 
      $( "#amount" ).val( "$" + ui.value );

      // get value 
      var inst_index = $( '#slider_'+filter_type ).slider( "value" ); 

      console.log(N_dict)

      var inst_top = N_dict[inst_index];

      console.log(inst_index)

      var change_view = {'N_row_sum':inst_top};
      var filter_name = 'N_row_sum';

      d3.select('#main_svg').style('opacity',0.70);

      d3.select('#'+filter_type).text('Top rows: '+inst_top+' rows'); 

      // $('.slider_filter').slider('disable');
      d3.selectAll('.btn').attr('disabled',true);
      d3.selectAll('.category_section')
        .on('click', '')
        .select('text')
        .style('opacity',0.5);


      cgm.update_network(change_view);

      ini_sliders(cgm);

      function enable_slider(){
        // $('.slider_filter').slider('enable');  
        d3.selectAll('.btn').attr('disabled',null);
        // d3.selectAll('.category_section')
        //   .on('click', category_key_click)
        //   .select('text')
        //   .style('opacity',1);
      }
      setTimeout(enable_slider, 2500);

    }
  });
  $( "#amount" ).val( "$" + $( '#slider_'+filter_type ).slider( "value" ) );







} 

function set_up_filters(filter_type){

  // filter 
  ////////////////////
  var views = network_data.views;

  // get views with filter type: e.g. fliter_row_sum
  var all_views = _.filter(views, function(d){return _.has(d,filter_type);});

  // filter for column category if necessary 
  if ( _.has(all_views[0],'col_cat') ) {

    // get views with current_col_cat 
    all_views = _.filter(all_views, function(d){
      if (d.col_cat==cgm.params.current_col_cat){
        return d;
      } 
    })
  }

  console.log( 'found ' + String(all_views.length) +' views for ' + filter_type )

  var inst_max = all_views.length - 1;
  $( '#slider_'+filter_type ).slider({
    value:0,
    min: 0,
    max: inst_max,
    step: 1,
    stop: function( event, ui ) {

      $( "#amount" ).val( "$" + ui.value );
      var inst_filt = $( '#slider_'+filter_type ).slider( "value" ); 

      if (filter_type==='filter_row_value'){

        change_view = {'filter_row_value':inst_filt/10};
        filter_name = 'Value';
        $('#slider_filter_row_sum').slider( "value", 0);
        $('#slider_filter_row_num').slider( "value", 0);

        d3.select('#filter_row_sum').text('Filter Sum: 0%');          
        d3.select('#filter_row_num').text('Filter Number Non-zero: 0%');          

      } else if (filter_type === 'filter_row_num'){

        change_view = {'filter_row_num':inst_filt/10};
        filter_name = 'Number Non-zero';
        $('#slider_filter_row_value').slider( "value", 0);
        $('#slider_filter_row_sum').slider( "value", 0);

        d3.select('#filter_row_sum').text('Filter Sum: 0%');          
        d3.select('#filter_row_value').text('Filter Value: 0%');          

      } else if (filter_type === 'filter_row_sum'){

        change_view = {'filter_row_sum':inst_filt/10};
        filter_name = 'Sum';
        $('#slider_filter_row_value').slider( "value", 0);
        $('#slider_filter_row_num').slider( "value", 0);

        d3.select('#filter_row_value').text('Filter Value: 0%');          
        d3.select('#filter_row_num').text('Filter Number Non-zero: 0%'); 

      }

      d3.select('#main_svg')
        .style('opacity',0.70);

      d3.select('#'+filter_type).text('Filter '+filter_name+': '+10*inst_filt+'%');          

      $('.slider_filter').slider('disable');
      d3.selectAll('.btn').attr('disabled',true);
      d3.selectAll('.category_section')
        .on('click', '')
        .select('text')
        .style('opacity',0.5);

      cgm.update_network(change_view);

      ini_sliders();

      function enable_slider(){
        $('.slider_filter').slider('enable');  
        d3.selectAll('.btn').attr('disabled',null);
        d3.selectAll('.category_section')
          .on('click', category_key_click)
          .select('text')
          .style('opacity',1);
      }
      setTimeout(enable_slider, 2500);

    }
  });
  $( "#amount" ).val( "$" + $( '#slider_'+filter_type ).slider( "value" ) );

}     



  // reused functions 
  function ini_sliders(cgm){

    // col groups
    $( "#slider_col" ).slider({
      value:0.5,
      min: 0,
      max: 1,
      step: 0.1,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.value );
        var inst_index = ui.value*10;
        cgm.change_groups('col',inst_index)
      }
    });
    $( "#amount" ).val( "$" + $( "#slider_col" ).slider( "value" ) );

    // row groups
    $( "#slider_row" ).slider({
      value:0.5,
      min: 0,
      max: 1,
      step: 0.1,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.value );
        var inst_index = ui.value*10;
        cgm.change_groups('row',inst_index)
      }
    });
    $( "#amount" ).val( "$" + $( "#slider_row" ).slider( "value" ) );

    // opacity scale
    $( "#slider_opacity" ).slider({
      value:0.2,
      min: 0.0,
      max: 1.0,
      step: 0.1,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.value );
        var inst_index = ui.value;
        cgm.opacity_slider(inst_index)
      }
    });
    $( "#amount" ).val( "$" + $( "#slider_opacity" ).slider( "value" ) );

    $('#gene_search_box').autocomplete({
      source: cgm.get_genes()
    });

    // submit genes button
    $('#gene_search_box').keyup(function(e) {
      if (e.keyCode === 13) {
        var search_gene = $('#gene_search_box').val();
        cgm.find_gene(search_gene);
      }
    });

    $('#submit_gene_button').off().click(function() {
      var gene = $('#gene_search_box').val();
      cgm.find_gene(gene);
    });

    $('#toggle_row_order .btn').off().click(function(evt) {
      var order_id = $(evt.target).attr('id').split('_')[0];
      cgm.reorder(order_id,'row');
    });

    $('#toggle_col_order .btn').off().click(function(evt) {
      var order_id = $(evt.target).attr('id').split('_')[0];
      cgm.reorder(order_id,'col');
    });

  }  