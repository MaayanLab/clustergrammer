
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


function make_clust(inst_network){

    // load json
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

      var cgm = Clustergrammer(arguments_obj);
      g_cgm = cgm;

      d3.select(g_cgm.params.root+' .wait_message').remove();

      // !! tmp set up for initializing sliders
      // !! tmp set up filters in load clustergram using cgm
      cgm.ini_sliders(cgm);
      cgm.set_up_N_filters('N_row_sum');

  });

}
