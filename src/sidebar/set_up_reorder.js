module.exports = function set_up_reorder(params, sidebar){

  var button_dict;
  var tmp_orders; 

  var rc_dict = {'row':'Row', 'col':'Column'};
  var all_cats;
  var is_active;
  var inst_reorder;
  var inst_order_label;
  var inst_cat_num;

  _.each(['row','col'], function(inst_rc){

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


    if ( params.viz.all_cats[inst_rc].length > 0 ){

      all_cats = params.viz.all_cats[inst_rc];

      _.each(all_cats, function(inst_cat){
        inst_cat_num = String(parseInt(inst_cat.split('-')[1],10) + 1);
        inst_order_label = inst_cat.replace('-','_')+'_index';
        button_dict[inst_order_label] = 'Category '+inst_cat_num;
      });
    }

    tmp_orders = Object.keys(params.matrix.orders);

    var possible_orders = [];

    _.each(tmp_orders, function(inst_name){

      if (inst_name.indexOf(other_rc) > -1){
        inst_name = inst_name.replace('_row','').replace('_col','');
        possible_orders.push(inst_name);
      }
      
    });

    possible_orders = _.uniq(possible_orders);

    possible_orders = possible_orders.sort();

    sidebar
      .append('div')
      .style('margin-left','5px')
      .html(rc_dict[inst_rc]+' Order');

    inst_reorder = sidebar
      .append('div')
      .classed('viz_medium_text',true)
      .append('div')
      .classed('btn-group-vertical',true)
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
      .classed('active', function(d){
        is_active = false;
        if (d == 'clust'){
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