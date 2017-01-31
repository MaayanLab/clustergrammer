var utils = require('../Utils_clust');
var trim_text = require('../zoom/trim_text');
var constrain_font_size = require('../zoom/constrain_font_size');

module.exports = function label_constrain_and_trim(params){

  // console.log('label_constrain_and_trim');

  // reset text in rows and columns
  d3.selectAll(params.root+' .row_label_group')
    .select('text')
    .text(function(d){ return utils.normal_name(d); });

  d3.selectAll(params.root+' .col_label_text')
    .select('text')
    .text(function(d){ return utils.normal_name(d); });

  constrain_font_size(params);

  d3.selectAll(params.root+' .row_label_group' )
    .each(function() { trim_text(params, this, 'row'); });

  d3.selectAll(params.root+' .col_label_group')
    .each(function() { trim_text(params, this, 'col'); });

};