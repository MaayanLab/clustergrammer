module.exports = function set_up_search(sidebar, button_data){

  var is_active;

  sidebar
    .append('div')
    .html('Row Order');

  var row_reorder = sidebar
    .append('div')
    .classed('viz_medium_text',true)
    .append('div')
    .classed('btn-group-vertical',true)
    .classed('toggle_col_order',true)
    .attr('role','group');

  row_reorder
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

  sidebar
    .append('div')
    .html('Column Order');

  var col_reorder = sidebar
    .append('div')
    .classed('viz_medium_text',true)
    .append('div')
    .classed('btn-group-vertical',true)
    .classed('toggle_row_order',true)
    .attr('role','group');

  col_reorder
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

};