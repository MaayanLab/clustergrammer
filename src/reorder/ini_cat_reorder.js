var all_reorder = require('./all_reorder');
var underscore = require('underscore');

module.exports = function ini_cat_reorder(cgm){
/* eslint-disable */

  var params = cgm.params;

  underscore.each(['row','col'], function(inst_rc){

    if (params.viz.show_categories[inst_rc]){
      d3.selectAll(params.root+' .'+inst_rc+'_cat_super')
        .on('dblclick',function(){

          if (params.sim_mat){
            inst_rc = 'both';
          }

          d3.selectAll(params.root+' .toggle_'+inst_rc+'_order .btn')
            .classed('active',false);

          var order_id = this.__data__.replace('-','_') + '_index';
          if (params.viz.sim_mat){
            all_reorder( cgm, order_id, 'row');
            all_reorder( cgm, order_id, 'col');
          }
          else {
            all_reorder( cgm, order_id, inst_rc);
          }
        });
    }

  });
};