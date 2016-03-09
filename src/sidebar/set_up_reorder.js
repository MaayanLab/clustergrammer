module.exports = function set_up_reorder(params, sidebar){

  var button_dict = {
    'clust':'Cluster',
    'rank':'Rank by Sum',
    'rankvar':'Rank by Variance',
    'ini':'Initial Order',
    'alpha':'Alphabetically',
    'cat':'Category'
  };

  var tmp_orders = Object.keys(params.matrix.orders);

  var possible_orders = tmp_orders.map(function(x){return x.split('_')[0];});

  console.log(possible_orders)

  possible_orders = _.uniq(possible_orders);

  possible_orders = possible_orders.sort();

  var node_data = [
    {
      'name':'Row',
      'short_name':'row'
    },
    {
      'name':'Column',
      'short_name':'col'
    }
  ];

  var is_active;
  var inst_reorder; 

  _.each(node_data, function(inst_node){

    sidebar
      .append('div')
      .html(inst_node.name+' Order');

    inst_reorder = sidebar
      .append('div')
      .classed('viz_medium_text',true)
      .append('div')
      .classed('btn-group-vertical',true)
      .classed('toggle_'+inst_node.short_name+'_order',true)
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