module.exports = function set_defaults(){

  var defaults = {
    // Label options
    row_label_scale: 1,
    col_label_scale: 1,
    super_labels: false,
    super: {},
    show_label_tooltips: true,
    show_tile_tooltips: true,
    // matrix options
    transpose: false,
    tile_colors: ['#FF0000', '#1C86EE'],
    bar_colors: ['#FF0000', '#1C86EE'],
    // value-cat colors
    // cat_value_colors: ['#2F4F4F', '#8A2BE2'],
    cat_value_colors: ['#2F4F4F', '#9370DB'],
    outline_colors: ['orange','black'],
    highlight_color: '#FFFF00',
    tile_title: false,
    // Default domain is set to 0: the domain will be set automatically
    input_domain: 0,
    opacity_scale: 'linear',
    do_zoom: true,
    is_zoom:0,
    is_slider_drag:false,
    is_cropping:false,
    background_color: '#FFFFFF',
    super_border_color: '#F5F5F5',
    outer_margins: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    },
    ini_expand: false,
    grey_border_width: 2,
    tile_click_hlight: false,
    super_label_scale: 1,
    make_tile_tooltip: function(d) { return d.info; },
    // initialize view, e.g. initialize with row filtering
    ini_view: null,
    // record of requested views
    requested_view: null,
    use_sidebar: true,
    title:null,
    about:null,
    sidebar_width:160,
    sidebar_icons:true,
    row_search_placeholder:'Row',
    buffer_width:10,
    show_sim_mat:false,
    cat_colors:null,
    resize:true,
    clamp_opacity:0.85,
    expand_button:true,
    max_allow_fs: 20,
    dendro_filter:{'row':false, 'col':false},
    cat_filter:{'row':false, 'col':false},
    crop_filter_nodes:{'row':false, 'col':false},
    row_tip_callback:null,
    col_tip_callback:null,
    tile_tip_callback:null,
    matrix_update_callback:null,
    cat_update_callback: null,
    dendro_callback:null,
    dendro_click_callback:null,
    new_row_cats:null,
    make_modals:true,
    show_viz_border:false,
  };

  return defaults;
};