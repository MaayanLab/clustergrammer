var get_cat_title = require('../categories/get_cat_title');
var utils = require('../Utils_clust');

module.exports = function cat_tooltip_text(params, inst_data, inst_selection, inst_rc){

  // category index 
  var inst_cat = d3.select(inst_selection).attr('cat');
  var cat_title = get_cat_title(params.viz, inst_cat, inst_rc);
  var cat_name = inst_data[inst_cat];

  if (cat_name.indexOf(': ') >=0){
    cat_name = cat_name.split(': ')[1];
  }

  var cat_string = cat_title + ': '+ cat_name;

  var pval_name = inst_cat.replace('-','_')+'_pval';
  var inst_pval ;
  if (utils.has(inst_data, pval_name)){
    inst_pval = inst_data[inst_cat.replace('-','_')+'_pval'];
    // there are three significant digits in the pval
    inst_pval = inst_pval.toFixed(3);
    cat_string = cat_string + ' (pval: '+ String(inst_pval) + ')';

  }

  d3.select(inst_selection)
    .classed('hovering',true);

  setTimeout(highlight_categories, 700);

  return cat_string;


  function highlight_categories(){

    if (d3.select(inst_selection).classed('hovering')){

      var node_types = [inst_rc];

      if (params.viz.sim_mat){
        node_types = ['row','col'];
      }

      _.each(node_types, function(tmp_rc){

        if (cat_name.indexOf('Not ') < 0){
          d3.selectAll(params.root+' .'+tmp_rc+'_cat_group')
            .selectAll('rect')
            .style('opacity', function(d){
              var inst_opacity;
              var tmp_name;
              var tmp_cat = d3.select(this).attr('cat');

              if (d[tmp_cat].indexOf(': ')>=0){
                tmp_name = d[tmp_cat].split(': ')[1];
              } else {
                tmp_name = d[tmp_cat];
              }

              if (tmp_cat === inst_cat && tmp_name === cat_name){
                inst_opacity = params.viz.cat_colors.active_opacity;
              } else {
                inst_opacity = params.viz.cat_colors.opacity/4;
              }

              return inst_opacity;
            });
        }

      });

    } 

  }

};