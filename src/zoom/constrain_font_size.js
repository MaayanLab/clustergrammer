var utils = require('../utils');
var trim_text = require('./trim_text');

module.exports = function(params) {

  var tmp_font_size = params.labels.default_fs_row ;
  var real_font_size = {};
  var reduce_fs = {};

  real_font_size.row = params.labels.default_fs_row * params.zoom_behavior.scale();
  real_font_size.col = params.labels.default_fs_col * params.zoom_behavior.scale()/params.viz.zoom_switch;

  if (real_font_size.row > params.labels.max_allow_fs){

    reduce_fs.row = params.labels.max_allow_fs/ real_font_size.row;
    tmp_font_size = tmp_font_size * reduce_fs.row;

    d3.selectAll(params.root+' .row_label_text')
      .each(function(){ 
        d3.select(this).select('text')
          .style('font-size', tmp_font_size + 'px');
          // .text(function(d){ return utils.normal_name(d);});
      });
  }


  if (real_font_size.col > params.labels.max_allow_fs){

    reduce_fs.col = params.labels.max_allow_fs/ real_font_size.col;
    tmp_font_size = tmp_font_size * reduce_fs.col;

    d3.selectAll(params.root+' .row_label_text')
      .each(function(){ 
        d3.select(this).select('text')
          .style('font-size', tmp_font_size + 'px');
          // .text(function(d){ return utils.normal_name(d);});
      });
  }  

  d3.selectAll(params.root+' .row_label_text' )
    .each(function() { trim_text(params, this, 'row'); });

  d3.selectAll(params.root+' .col_label_click')
    .each(function() { trim_text(params, this, 'col'); });

};
