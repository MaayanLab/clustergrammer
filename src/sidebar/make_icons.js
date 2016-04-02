module.exports = function make_icons(params, sidebar){

  // <a href="help" target="_blank"  id="help_link">
  //   <i class="fa fa-question-circle icon_buttons"></i>
  // </a>

  var row = sidebar
    .select('.icons_section')
    .style('margin-top','7px')
    .style('margin-left','-10px')
    .style('width',params.sidebar.buttons.width+'px')
    .append('row');

  row
    .append('col')
    .classed('col-xs-4',true)
    .append('a')
    .classed('help_link',true)
    .append('i')
    .classed('fa',true)
    .classed('fa-question-circle',true)
    .classed('icon_buttons',true)
    .style('font-size','25px'); 

  row
    .append('col')
    .classed('col-xs-4',true)
    .append('a')
    .classed('help_link',true)
    .append('i')
    .classed('fa',true)
    .classed('fa-share-alt',true)
    .classed('icon_buttons',true)
    .style('font-size','25px');   

  row
    .append('col')
    .classed('col-xs-4',true)
    .append('a')
    .classed('help_link',true)
    .append('i')
    .classed('fa',true)
    .classed('fa-camera',true)
    .classed('icon_buttons',true)
    .style('font-size','25px');   

};