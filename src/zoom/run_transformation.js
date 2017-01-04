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

  // rows
  ///////////
  // transform icon group (contains all icons)
  d3.select(params.root+' .row_dendro_icons_group')
    .attr('transform', function(){
      var inst_y = zoom_info.trans_y;
      var inst_translate = 'translate(' + [0, inst_y] + ') ';
      var inst_zoom = 'scale(1, ' + zoom_info.zoom_y + ')';
      var transform_string = inst_translate + inst_zoom;
      return transform_string;
    });

  // transform icons (undo zoom on triangles)
  d3.select(params.root+' .row_dendro_icons_group')
    .selectAll('path')
    .attr('transform', function(d){
      var inst_x = params.viz.uni_margin;
      var inst_y = d.pos_mid;
      return 'translate('+ inst_x +',' + inst_y + ') ' + 'scale(1, '+ 1/zoom_info.zoom_y +')';
    });

  // cols
  ///////////
  // transform icon group (contains all icons)
  d3.select(params.root+' .col_dendro_icons_group')
    .attr('transform', function(){
      var inst_x = zoom_info.trans_x;
      var inst_translate = 'translate('+ [inst_x, 0] + ')';
      var inst_zoom = 'scale('+ zoom_info.zoom_x + ', 1)';
      var transform_string = inst_translate + inst_zoom;
      return transform_string;
    });

  // transform icons (undo zoom on triangles)
  d3.select(params.root+' .col_dendro_icons_group')
    .selectAll('path')
    .attr('transform', function(d){
      var inst_x = d.pos_mid;
      var inst_y = params.viz.uni_margin;
      return 'translate('+ inst_x +',' + inst_y + ') ' + 'scale('+ 1/zoom_info.zoom_x +', 1)';
    });



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

  show_visible_area(params, zoom_info);

};