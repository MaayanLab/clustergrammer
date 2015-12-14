// load clustergram function
function make_clust(inst_network){  

  $(function() {

      // load network
      d3.json('json/'+inst_network, function(network_data){

        global_network_data = network_data;

        // define the outer margins of the visualization
        var outer_margins = {
            'top':5,
            'bottom':33,
            'left':195,
            'right':2
          };

        var outer_margins_expand = {
            'top':5,
            'bottom':33,
            'left':5,
            'right':2
          };

        // define callback function for clicking on tile
        function click_tile_callback(tile_info){
          console.log('tile callback');
          console.log('clicking on ' + tile_info.row + ' row and ' + tile_info.col + ' col with value ' + String(tile_info.value))
        }

        // define callback function for clicking on group
        function click_group_callback(group_info){
          console.log('running user defined click group callback');
          console.log(group_info.type);
          console.log(group_info.nodes);
          console.log(group_info.info);
        }

        // row/col callback function
        function click_label(label_info, label_type){
          console.log( label_type+' label callback function '+ label_info)
        }

        // show up/dn genes from enrichment 
        function make_tile_tooltip(d){
          // up and down 
          if ( d.info.up.length > 0 && d.info.dn.length > 0 ){
            var inst_up = 'Up Genes: '+ d.info.up.join('\t');
            var inst_dn = 'Down Genes: '+ d.info.dn.join('\t');
            var inst_string = "<p>"+inst_up+"</p>"+inst_dn;
            // improve
            var inst_score = Math.abs(d.value.toFixed(2));
          } else if ( d.info.up.length > 0 ){
            var inst_up = 'Up Genes: '+ d.info.up.join('\t');
            var inst_string = inst_up;
            var inst_score = d.value.toFixed(2);
          } else if ( d.info.dn.length > 0 ){
            var inst_dn = 'Down Genes: '+ d.info.dn.join('\t');
            var inst_string = inst_dn;
            var inst_score = -d.value.toFixed(2);
          }
          var inst_info = '<p>'+d.col_name+' is enriched for '+d.row_name+' with Combined Score: '+ inst_score +'</p>'
          return inst_info + inst_string; 
        }

        // define arguments object
        var arguments_obj = {
          'network_data': network_data,
          'svg_div_id': 'svg_div',
          'row_label':'Row-Data-Name',
          'col_label':'Column-Data-Name',
          'outer_margins': outer_margins,
          'outer_margins_expand': outer_margins_expand,
          // 'outline_colors':['black','yellow'],
          // 'tile_click_hlight':true,
          'show_label_tooltips':true,
          // 'show_tile_tooltips':true,
          // 'make_tile_tooltip':make_tile_tooltip,
          // 'click_tile': click_tile_callback,
          // 'click_label':click_label,
          // 'highlight_color':'yellow',
          'super_label_scale':1.25,
          // 'transpose':true,
          // 'ini_expand':true,
          // 'col_label_scale':0.8,
          // 'row_label_scale':0.8
          // 'force_square':1
          // 'opacity_scale':'log',
          // 'input_domain':2,
          // 'do_zoom':false,
          // 'tile_colors':['#ED9124','#1C86EE'],
          // 'background_color':'orange',
          // 'tile_title': true,
          // 'click_group': click_group_callback
          // 'resize':false
          // 'order':'rank'
        };

        d3.select('#wait_message').style('display','none');

        // make clustergram: pass network_data and the div name where the svg should be made
        // tmp make cgm a global variable so that it can be updated with new data 
        var cgm = clustergrammer(arguments_obj);

        // global verison of cgm 
        g_cgm = cgm;

        global_params = cgm.params;

        console.log(cgm)
        ini_sliders();
         
        // // play demo   
        // ini_play_button(cgm);

        // filter rows 
        ////////////////////
        var views = network_data.views;
        var row_views = _.filter(views, function(d){return _.has(d,'filter_row');});
        var inst_max = row_views.length - 1;
        $( "#slider_filter_row" ).slider({
          value:0,
          min: 0,
          max: inst_max,
          step: 1,
          stop: function( event, ui ) {
            $( "#amount" ).val( "$" + ui.value );
            var inst_filt = $( "#slider_filter_row" ).slider( "value" ); 

            change_view = {'filter_row':inst_filt/10, 'num_meet':1};

            d3.select('#main_svg')
              .style('opacity',0.70);
            d3.select('#filter_value_row').text('Filter Rows: '+10*inst_filt+'%');          
            d3.select('#filter_value_col').text('Filter Columns: '+0+'%');          
            $("#slider_filter_col").slider( "value", 0);

            $('#slider_filter_row').slider('disable');

            cgm.update_network(change_view);

            ini_sliders();

            function enable_slider(){
              $('#slider_filter_row').slider('enable');  
            }
            setTimeout(enable_slider, 2500);

          }
        });
        $( "#amount" ).val( "$" + $( "#slider_filter_row" ).slider( "value" ) );



        // filter cols 
        ////////////////////
        var views = network_data.views;
        var col_views = _.filter(views, function(d){return _.has(d,'filter_col');});
        var inst_max = col_views.length - 1;
        $( "#slider_filter_col" ).slider({
          value:0,
          min: 0,
          max: inst_max,
          step: 1,
          stop: function( event, ui ) {
            $( "#amount" ).val( "$" + ui.value );
            var inst_filt = $( "#slider_filter_col" ).slider( "value" ); 

            change_view = {'filter_col':inst_filt/10, 'num_meet':1};

            d3.select('#main_svg')
              .style('opacity',0.70);

            d3.select('#filter_value_col').text('Filter Columns: '+10*inst_filt+'%');          
            d3.select('#filter_value_row').text('Filter Rows: '+0+'%');          
            $("#slider_filter_row").slider( "value", 0);

            $('#slider_filter_col').slider('disable');

            cgm.update_network(change_view);

            ini_sliders();

            function enable_slider(){
              $('#slider_filter_col').slider('enable');  
            }
            setTimeout(enable_slider, 2500);

          }
        });
        $( "#amount" ).val( "$" + $( "#slider_filter_col" ).slider( "value" ) );




        // reused functions 
        function ini_sliders(){


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

    }); // end d3.json 

  }); // end closure 

} // end make_clust


// choose example here
// make_clust('default_example.json');
make_clust('mult_view.json');
// make_clust('enr_clust_example.json');
// make_clust('enr_vect_example.json');
// make_clust('updn_example.json');
// make_clust('narrow_example.json');
// make_clust('narrow_long_name.json');
// make_clust('bar_example.json');
// make_clust('kin_sub_example.json');
// make_clust('harmonogram_example.json');

