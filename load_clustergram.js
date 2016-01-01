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
        function click_group_callback(inst_rc, group_nodes_list){
          console.log('running user defined click group callback');

          $('#dendro_info').modal('toggle');
          d3.select('#dendro_info').select('.modal-body').select('p')
            .text(group_nodes_list.join('\t'));

          if (inst_rc==='row'){
            var type_title = 'Row';
          } else if (inst_rc==='col'){
            var type_title = 'Column';
          }

            
          d3.select('#dendro_info').select('.modal-title')
            .text(function(){
              return 'Selected '+type_title + ' Group';
            });


          options = {
            description:'some-description',
            list: group_nodes_list.join('\n')
          }

          console.log(options)

          // // send genes to Enrichr 
          // send_genes_to_enrichr(options);

        }

        function send_genes_to_enrichr(options) {
          var defaultOptions = {
            description: "",
            popup: false
          };

          if (typeof options.description == 'undefined')
            options.description = defaultOptions.description;
          if (typeof options.list == 'undefined')
            alert('No genes defined.');

          var form = document.createElement('form');
          form.setAttribute('method', 'post');
          form.setAttribute('action', 'http://amp.pharm.mssm.edu/Enrichr/enrich');
          form.setAttribute('target', '_blank');
          form.setAttribute('enctype', 'multipart/form-data');

          var listField = document.createElement('input');
          listField.setAttribute('type', 'hidden');
          listField.setAttribute('name', 'list');
          listField.setAttribute('value', options.list);
          form.appendChild(listField);

          var descField = document.createElement('input');
          descField.setAttribute('type', 'hidden');
          descField.setAttribute('name', 'description');
          descField.setAttribute('value', options.description);
          form.appendChild(descField);

          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
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
          // 'col_label_scale':1.5,
          // 'row_label_scale':0.8
          // 'force_square':1
          // 'opacity_scale':'log',
          // 'input_domain':2,
          // 'do_zoom':false,
          // 'tile_colors':['#ED9124','#1C86EE'],
          // 'background_color':'orange',
          // 'tile_title': true,
          'click_group': click_group_callback,
          // 'resize':false
          // 'order':'rank'
          // 'col_order':'rank',
          // 'row_order':'clust'
          // 'ini_view':{'filter_row_sum':0.9}
        };

        d3.select('#wait_message').style('display','none');

        // make clustergram: pass network_data and the div name where the svg should be made
        // tmp make cgm a global variable so that it can be updated with new data 
        var cgm = clustergrammer(arguments_obj);

        // global verison of cgm 
        g_cgm = cgm;

        global_params = cgm.params;

        ini_sliders();
         
        // // play demo   
        // ini_play_button(cgm);

        // set_up_filters('filter_row_value');
        // set_up_filters('filter_row_sum');
        // set_up_filters('filter_row_num');

        set_up_N_filters('N_row_sum'); 

        function set_up_N_filters(filter_type){

          // filter 
          ////////////////////
          var views = network_data.views;
          var all_views = _.filter(views, function(d){return _.has(d,filter_type);});
          var inst_max = all_views.length - 1;
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
              var inst_N = $( '#slider_'+filter_type ).slider( "value" ); 

              // change_view = {'N_row_sum':inst_N};
              // filter_name = 'N_row_sum';

              // d3.select('#filter_row_value').text('Filter Value: 0%');          
              // d3.select('#filter_row_num').text('Filter Number Non-zero: 0%'); 

              // d3.select('#main_svg').style('opacity',0.70);

              // d3.select('#'+filter_type).text('Filter '+filter_name+': '+inst_N+'%');          

              // $('.slider_filter').slider('disable');
              // d3.selectAll('.btn').attr('disabled',true);

              // cgm.update_network(change_view);

              // ini_sliders();

              // function enable_slider(){
              //   $('.slider_filter').slider('enable');  
              //   d3.selectAll('.btn').attr('disabled',null);
              // }
              // setTimeout(enable_slider, 2500);

            }
          });
          $( "#amount" ).val( "$" + $( '#slider_'+filter_type ).slider( "value" ) );

        }     

        function set_up_filters(filter_type){

          // filter 
          ////////////////////
          var views = network_data.views;
          var all_views = _.filter(views, function(d){return _.has(d,filter_type);});
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

              cgm.update_network(change_view);

              ini_sliders();

              function enable_slider(){
                $('.slider_filter').slider('enable');  
                d3.selectAll('.btn').attr('disabled',null);
              }
              setTimeout(enable_slider, 2500);

            }
          });
          $( "#amount" ).val( "$" + $( '#slider_'+filter_type ).slider( "value" ) );

        }     

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
make_clust('mult_view.json');
// make_clust('default_example.json');
// make_clust('ccle.json');
// make_clust('enr_clust_example.json');
// make_clust('updn_example.json');
// make_clust('narrow_example.json');
// make_clust('narrow_long_name.json');
// make_clust('bar_example.json');
// make_clust('kin_sub_example.json');
// make_clust('harmonogram_example.json');

