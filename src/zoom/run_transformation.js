var constrain_font_size = require('./constrain_font_size');
var zooming_has_stopped = require('./zooming_has_stopped');
var show_visible_area = require('./show_visible_area');
var resize_label_val_bars = require('./resize_label_val_bars');
var num_visible_labels = require('./num_visible_labels');

module.exports = function run_transformation(params){

  var zoom_info = params.zoom_info;

  // apply transformation and reset translate vector
  // translate clustergram
  d3.select(params.root+' .clust_group')
    .attr('transform', 'translate(' + [zoom_info.trans_x, zoom_info.trans_y] + ') scale(' +
    zoom_info.zoom_x + ',' + zoom_info.zoom_y + ')');


  // labels
  /////////////////////////////
  d3.select(params.root+' .row_label_zoom_container')
    .attr('transform', 'translate(' + [0, zoom_info.trans_y] + ') scale(' + zoom_info.zoom_y +
    ')');

  // move down col labels as zooming occurs, subtract trans_x - 20 almost works
  d3.select(params.root+' .col_zoom_container')
    .attr('transform', 'translate(' + [zoom_info.trans_x, 0] + ') scale(' + zoom_info.zoom_x +
    ')');


  d3.select(params.root+' .row_cat_container')
    .attr('transform', 'translate(' + [0, zoom_info.trans_y] + ') scale( 1,' +
    zoom_info.zoom_y + ')');

  d3.select(params.root+' .row_dendro_container')
    .attr('transform', 'translate(' + [params.viz.uni_margin/2, zoom_info.trans_y] + ') '+
      'scale( 1,' + zoom_info.zoom_y + ')');

  // dendrogram icons
  d3.select(params.root+' .row_dendro_icons_container')
    .attr('transform', function(){
      var inst_y = zoom_info.trans_y + params.viz.clust.margin.top;
      var inst_translate = 'translate(' + [0, inst_y] + ') ' ;
      var inst_zoom = 'scale(1, ' + zoom_info.zoom_y + ')';
      var transform_string = inst_translate + inst_zoom;
      return transform_string;
    });

  d3.select(params.root+' .row_dendro_icons_container')
    .selectAll('path')
    .attr('d', function(d) {

      var tri_height = 10;

      var tmp_height = d.pos_bot - d.pos_top;
      if (tmp_height < 45){
        tri_height = tmp_height * 0.20;
      }

      tri_height = tri_height / zoom_info.zoom_y;

      // up triangle
      var start_x = 12 ;
      var start_y = -tri_height;

      var mid_x = 0;
      var mid_y = 0;

      var final_x = 12;
      var final_y = tri_height;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L'
      + final_x + ','+ final_y +' Z';

      return output_string;
    })

  // transform col_class
  d3.select(params.root+' .col_cat_container')
    .attr('transform', 'translate('+[zoom_info.trans_x, 0]+') scale(' +zoom_info.zoom_x+ ',1)');

  d3.select(params.root+' .col_dendro_container')
    .attr('transform', 'translate('+[zoom_info.trans_x, params.viz.uni_margin/2]+') scale(' +zoom_info.zoom_x+ ',1)');

  constrain_font_size(params);

  resize_label_val_bars(params, zoom_info);


  d3.select(params.root+' .viz_svg')
    .attr('is_zoom', function(){
      var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));
      d3.select(params.root+' .viz_svg').attr('stopped_zoom',1);
      return inst_zoom + 1;
    });

  var not_zooming = function(){

    d3.select(params.root+' .viz_svg')
      .attr('is_zoom',function(){
        var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));
        return inst_zoom - 1;
      });

  };

  setTimeout(not_zooming, 100);

  setTimeout(zooming_has_stopped, 1000, params);

  _.each(['row','col'], function(inst_rc){

    var inst_num_visible = num_visible_labels(params, inst_rc);

    if (inst_num_visible > 250){

      d3.selectAll(params.root+' .'+inst_rc+'_label_group')
        .select('text')
        .style('display','none');

      d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
        .select('path')
        .style('display','none');

      d3.selectAll('.horz_lines').select('line').style('display','none');
      d3.selectAll('.vert_lines').select('line').style('display','none');
    } else {

      if (inst_num_visible > 40){

        var calc_show_char = d3
          .scale.linear()
          .domain([1,500])
          .range([3,1])
          .clamp(true);

        var num_show_char = Math.floor(calc_show_char(inst_num_visible));

        d3.selectAll(params.root+' .'+inst_rc+'_label_group')
          .select('text')
          .style('opacity',0.5)
          .text(function(d){
            return d.name.substring(0,num_show_char)+'..';
          });

      }

    }

  });


  // // experimental tile display toggling
  // var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));

  // if (inst_zoom == 1){
  //   d3.selectAll(params.root+' .hide_tile')
  //     .style('display', 'none');
  // }

  show_visible_area(params, zoom_info);

};