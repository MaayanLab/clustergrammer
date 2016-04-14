module.exports = function set_up_dendro_sliders(sidebar, params){

  var dendro_sliders = sidebar
    .append('div')
    .classed('dendro_sliders',true);

  var dendro_types;
  if (params.sim_mat){
    dendro_types = ['both'];
  } else {
    dendro_types = ['row','col'];
  }

  var dendro_text = {};
  dendro_text.row = 'Row Group Size';
  dendro_text.col = 'Column Group Size';
  dendro_text.both = 'Group Size';

  _.each( dendro_types, function(inst_rc){

    dendro_sliders
      .append('p')
      .classed('viz_medium_text',true)
      .text(dendro_text[inst_rc]);

    dendro_sliders
      .append('div')
      .classed('slider_'+inst_rc,true)
      .classed('slider',true)
      .style('width', params.sidebar.slider.width+'px')
      .style('margin-left', params.sidebar.slider.margin_left+'px');

  });

};