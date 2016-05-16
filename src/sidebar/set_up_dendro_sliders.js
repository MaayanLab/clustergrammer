module.exports = function set_up_dendro_sliders(sidebar, params){

  var dendro_sliders = sidebar
    .append('div')
    .classed('dendro_sliders', true)
    .style('padding-left', '15px')
    .style('padding-right', '15px');

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
      .append('div')
      .classed('sidebar_text', true)
      .classed('slider_description', true)
      .style('margin-top', '5px')
      .style('margin-bottom', '3px')
      .text(dendro_text[inst_rc]);

    dendro_sliders
      .append('div')
      .classed('slider_'+inst_rc, true)
      .classed('slider', true);

  });

};
