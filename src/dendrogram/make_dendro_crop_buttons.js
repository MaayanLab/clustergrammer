var calc_row_dendro_triangles = require('./calc_row_dendro_triangles');

module.exports = function make_dendro_crop_buttons(cgm){

  var params = cgm.params;

  var button_opacity = params.viz.dendro_opacity * 0.70;

  // information needed to make dendro
  var dendro_info = calc_row_dendro_triangles(params);

  d3.selectAll(params.root+' .row_dendro_crop_buttons')
    .remove();

  d3.select(params.root+' .row_dendro_icons_container')
    .selectAll('path')
    .data(dendro_info, function(d){return d.name;})
    .enter()
    .append('path')
    .classed('row_dendro_crop_buttons', true)
    .attr('d', function(d) {

      var tri_height = 10;

      var tmp_height = d.pos_bot - d.pos_top;
      if (tmp_height < 30){
        tri_height = tmp_height * 0.20;
      }

      // up triangle
      var start_x = 0 ;
      var start_y = -tri_height;

      var mid_x = 10;
      var mid_y = 0;

      var final_x = 0;
      var final_y = tri_height;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L'
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    // .append('text')
    // .attr('text-anchor', 'middle')
    // .attr('dominant-baseline', 'central')
    // .attr('font-family', 'FontAwesome')
    // .attr('font-size', '20px')
    // // .attr('font-weight', 'bold')
    // .text(function () {
    //   // chevron
    //   return '\uf054'
    //   // // angle right
    //   // return '\uf105';
    //   // // dot circle
    //   // return '\uf192';
    // })
    .style('cursor', 'pointer')
    .style('opacity', button_opacity)
    .attr('transform', function(d){
      var inst_translate;
      // var inst_y = String(100 * i);
      var inst_y = d.pos_mid ;
      var inst_x = 7;
      inst_translate = 'translate('+ inst_x +',' + inst_y + ')';
      return inst_translate;
    })
    .on('mouseover', function(){
      d3.select(this)
        .style('opacity', 0.7);
    })
    .on('mouseout', function(){
      d3.select(this)
        .style('opacity', button_opacity);
    })
    // .style('display', 'none');

};