// load clustergram function
function make_clust(inst_network){  

  $(function() {

      // load network
      d3.json('json/'+inst_network, function(network_data){

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
          // 'show_tooltips':true,
          // 'click_tile': click_tile_callback,
          // 'click_label':click_label,
          // 'highlight_color':'yellow',
          'super_label_scale':1.25,
          // 'transpose':true,
          // 'ini_expand':true
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
        // tmp make d3c a global variable so that it can be updated with new data 
        var d3c = d3_clustergram(arguments_obj);

        ini_sliders();

        // filter scale - only initialize once 
        $( "#slider_filter" ).slider({
          value:1,
          min: 1,
          max: 9,
          step: 1,
          stop: function( event, ui ) {
            $( "#amount" ).val( "$" + ui.value );
            var inst_filt = $( "#slider_filter" ).slider( "value" ); 

            d3.select('#filter_value').text('filter row/column: value : '+inst_filt);
            var inst_name = 'default_example_f'+inst_filt+'.json';

            update_clust(inst_name);
          }
        });
        $( "#amount" ).val( "$" + $( "#slider_filter" ).slider( "value" ) );

        // // filter times_met - only initialize once 
        // $( "#slider_times_met" ).slider({
        //   value:1,
        //   min: 1,
        //   max: 3,
        //   step: 1,
        //   stop: function( event, ui ) {
        //     $( "#amount" ).val( "$" + ui.value );
        //     var inst_filt  = $( "#slider_filter" ).slider( "value" ); 
        //     var inst_times = $( "#slider_times_met" ).slider( "value" ); 

        //     d3.select('#filter_value').text('filter row/column: value : '+inst_filt);
        //     var inst_name = 'default_example_f'+inst_filt+'_n'+inst_times+'.json';

        //     update_clust(inst_name);
        //   }
        // });
        // $( "#amount" ).val( "$" + $( "#slider_filter" ).slider( "value" ) );

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
              d3c.change_groups('col',inst_index)
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
              d3c.change_groups('row',inst_index)
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
              d3c.opacity_slider(inst_index)
            }
          });
          $( "#amount" ).val( "$" + $( "#slider_opacity" ).slider( "value" ) );

          $('#gene_search_box').autocomplete({
            source: d3c.get_genes()
          });

          // submit genes button
          $('#gene_search_box').keyup(function(e) {
            if (e.keyCode === 13) {
              var search_gene = $('#gene_search_box').val();
              d3c.find_gene(search_gene);
            }
          });

          $('#submit_gene_button').off().click(function() {
            var gene = $('#gene_search_box').val();
            d3c.find_gene(gene);
          });

          $('#toggle_order .btn').off().click(function(evt) {
            var order_id = $(evt.target).find('input').attr('id').replace('_button', '');
            d3c.reorder(order_id);
          });
        }

        function update_clust(network_name) {

          function enable_slider(){
            $('#slider_filter').slider('enable');  
          }

          // disable the slider to prevent the user from making changes too
          // quickly
          $('#slider_filter').slider('disable');

          // reenable after update is finished 
          setTimeout(enable_slider, 3000);

          d3.json('json/'+network_name, function(network_data){

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

            var inst_order = d3.select('#toggle_order')
              .select('.active')
              .select('input')
              .attr('id').split('_')[0];

            // define arguments object
            var arguments_obj = {
              'network_data': network_data,
              'svg_div_id': 'svg_div',
              'row_label':'Row-Data-Name',
              'col_label':'Column-Data-Name',
              'outer_margins': outer_margins,
              'outer_margins_expand': outer_margins_expand,
              // 'outline_colors':['black','yellow'],
              // 'show_tooltips':true,
              // 'highlight_color':'red',
              'super_label_scale':1.25,
              'order':inst_order
            };


            d3c.update_network(arguments_obj);

            ini_sliders();

          })
        }

    }); // end d3.json 

  }); // end closure 

} // end make_clust


// choose example here
make_clust('default_example_f1.json');
// make_clust('bar_example.json');
// make_clust('kin_sub_example.json');

