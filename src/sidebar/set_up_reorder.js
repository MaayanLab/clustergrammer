module.exports = function set_up_search(sidebar){

  var button_data = [
      {'name':'Cluster',
       'short_name':'clust'},
      {'name':'Rank by Sum',
      'short_name':'rank'}
    ];

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
      .data(button_data)
      .enter()
      .append('button')
      .attr('type','button')
      .classed('btn',true)
      .classed('btn-primary',true)
      .classed('active', function(d){
        is_active = false;
        if (d.name == 'Cluster'){
          is_active = true;
        }
        return is_active;
      })
      .attr('name', function(d){
        return d.short_name;
      })
      .html(function(d){return d.name;});
    
  });


};