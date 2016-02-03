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

        // define arguments object
        var arguments_obj = {
          root: '#container-id-1',
          'network_data': network_data,
          'row_label':'Input Genes',
          'col_label':'Enriched Terms',
          'outer_margins': outer_margins,
          'outer_margins_expand': outer_margins_expand,
          // 'outline_colors':['black','yellow'],
          // 'tile_click_hlight':true,
          'show_label_tooltips':true,
          // 'show_tile_tooltips':true,
          // 'make_tile_tooltip':make_tile_tooltip,
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
          // 'click_group': click_group_callback,
          // 'resize':false
          // 'order':'rank'
          // 'col_order':'rank',
          // 'row_order':'clust'
          // 'ini_view':{'N_row_sum':'55'}
          // 'current_col_cat':'category-one'
        };

        d3.select('#wait_message').remove();

        // make clustergram: pass network_data and the div name where the svg should be made
        // tmp make cgm a global variable so that it can be updated with new data 
        var cgm = clustergrammer(arguments_obj);

        // global verison of cgm 
        g_cgm = cgm;

        global_params = cgm.params;

        ini_sliders();

        // set_up_filters('filter_row_sum');
        // set_up_filters('filter_row_value');
        // set_up_filters('filter_row_num');

        // !! tmp set up filters in load clustergram using cgm 
        cgm.set_up_N_filters('N_row_sum'); 

        if (cgm.params.show_categories){

          // set up column category key 
          var key_cat_col = d3.select('#key_cat_col')
            // .style('background-color','red')
            .style('margin-top','10px')
            .style('padding','5px')
            .style('border','1px solid #DEDEDE')
            .style('margin-bottom','10px')
            .style('overflow','scroll')
            .style('max-height','200px');

          key_cat_col
            .append('p')
            .text('Column Categories')
            .style('margin-bottom','2px');

          for (var inst_cat in cgm.params.class_colors.col){

            var inst_group = key_cat_col
              .append('g')
              .attr('class','category_section')
              .on('click', category_key_click);

            inst_group
              .append('div')
              .attr('class','category_color')
              .style('width','15px')
              .style('height','15px')
              .style('float','left')
              .style('margin-right','5px')
              .style('margin-top','2px')
              .style('background-color',function(){
                var inst_color = cgm.params.class_colors.col[inst_cat];
                return inst_color;
              });


            inst_group
              .append('p')
              .style('margin-bottom','2px')
              .append('text')
              .text(inst_cat)
              .attr('class','noselect')
              .style('cursor','pointer');

          }
        }

        function category_key_click(){
          
          var inst_cat = d3.select(this).select('text').text();

          // update the category 
          if (cgm.params.current_col_cat === inst_cat){

            // show all categories 
            cgm.change_category('all_category'); 

            // show selection in key 
            d3.selectAll('.category_section')
              .select('.category_color')
              .style('opacity',1);

            d3.selectAll('.category_section')
              .select('p')
              .style('opacity',1);

            ini_sliders();

          } else {

            // show one category 
            cgm.change_category(inst_cat); 

            // show selection in key 
            d3.selectAll('.category_section')
              .select('.category_color')
              .style('opacity',0.35);

            d3.selectAll('.category_section')
              .select('p')
              .style('opacity',0.35);

            d3.select(this)
              .select('.category_color')
              .style('opacity',1);

            d3.select(this)
              .select('p')
              .style('opacity',1);

            ini_sliders();
          }

          // disable controls while updating
          $('.slider_filter').slider('disable');
          d3.selectAll('.btn').attr('disabled',true);
          d3.selectAll('.category_section')
            .on('click', '')
            .select('text')
            .style('opacity',0.5);

          // update the network after changing the category - default to no filtering 
          cgm.update_network({'N_row_sum':'all'});

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

        // save svg: example from: http://bl.ocks.org/pgiraud/8955139#profile.json
        ////////////////////////////////////////////////////////////////////////////
        function save_clust_svg(){

          d3.select('#expand_button').style('opacity',0);

          var html = d3.select("svg")
                .attr("title", "test2")
                .attr("version", 1.1)
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .node().parentNode.innerHTML;        

          var blob = new Blob([html], {type: "image/svg+xml"});              

          saveAs(blob, "clustergrammer.svg");

          d3.select('#expand_button').style('opacity',0.4);
        }

        d3.select('#download_buttons')
          .append('p')
          .append('a')
          .html('download-svg')
          .on('click',function(){
            save_clust_svg();
          });


        // save as PNG 
        /////////////////////////////////////////
        d3.select('#download_buttons')
          .append('p')
          .append('a')
          .html('download-png')
          .on('click',function(){
            d3.select('#expand_button').style('opacity',0);
            saveSvgAsPng(document.getElementById("main_svg"), "clustergrammer.png");
            d3.select('#expand_button').style('opacity',0.4);
          })


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
// make_clust('vect_post_example.json');
// make_clust('large_example.json');
// make_clust('default_example.json');
// make_clust('ccle.json');
// make_clust('enr_clust_example.json');
// make_clust('updn_example.json');
// make_clust('narrow_example.json');
// make_clust('narrow_long_name.json');
// make_clust('bar_example.json');
// make_clust('kin_sub_example.json');
// make_clust('harmonogram_example.json');

