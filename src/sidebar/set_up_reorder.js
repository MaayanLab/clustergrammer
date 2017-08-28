// var get_cat_title = require('../categories/get_cat_title');
var underscore = require('underscore');

module.exports = function set_up_reorder(params, sidebar){

  var button_dict;
  var tmp_orders;
  var rc_dict = {'row':'Row', 'col':'Column', 'both':''};
  var is_active;
  var inst_reorder;
  // var all_cats;
  // var inst_order_label;

  var reorder_section = sidebar
    .append('div')
    .style('padding-left', '10px')
    .style('padding-right', '10px')
    .classed('reorder_section', true);

  var reorder_types;
  if (params.sim_mat){
    reorder_types = ['both'];
  } else {
    reorder_types = ['row','col'];
  }

  underscore.each(reorder_types, function(inst_rc){

    button_dict = {
      'clust':'Cluster',
      'rank':'Rank by Sum',
      'rankvar':'Rank by Variance',
      'ini':'Initial Order',
      'alpha':'Alphabetically'
    };

    var other_rc;
    if (inst_rc === 'row'){
      other_rc = 'col';
    } else {
      other_rc = 'row';
    }

    tmp_orders = Object.keys(params.matrix.orders);

    var possible_orders = [];

    underscore.each(tmp_orders, function(inst_name){

      if (inst_name.indexOf(other_rc) > -1){
        inst_name = inst_name.replace('_row','').replace('_col','');

        if ( inst_name.indexOf('cat_') < 0 ){
          possible_orders.push(inst_name);
        }
      }

    });

    // specific to Enrichr
    if ( underscore.keys(params.viz.filter_data).indexOf('enr_score_type') > -1 ){
      possible_orders = ['clust','rank'];
    }

    possible_orders = underscore.uniq(possible_orders);

    possible_orders = possible_orders.sort();

    var reorder_text;
    if (inst_rc !='both'){
      reorder_text = ' Order';
    } else {
      reorder_text = 'Reorder Matrix';
    }

    reorder_section
      .append('div')
      .classed('sidebar_button_text',true)
      .style('clear','both')
      .style('margin-top','10px')
      .html(rc_dict[inst_rc]+reorder_text);


    inst_reorder = reorder_section
      .append('div')
      .classed('btn-group-vertical',true)
      .style('width', '100%')
      .classed('toggle_'+inst_rc+'_order',true)
      .attr('role','group');

    inst_reorder
      .selectAll('.button')
      .data(possible_orders)
      .enter()
      .append('button')
      .attr('type','button')
      .classed('btn',true)
      .classed('btn-primary',true)
      .classed('sidebar_button_text',true)
      .classed('active', function(d){
        is_active = false;
        if (d == params.viz.inst_order[other_rc]){
          is_active = true;
        }
        return is_active;
      })
      .attr('name', function(d){
        return d;
      })
      .html(function(d){
        return button_dict[d];
      });

  });

};
