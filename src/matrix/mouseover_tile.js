module.exports = function mouseover_tile(params, inst_selection, tip, inst_arguments){

  var inst_data = inst_arguments[0];

  var args = [].slice.call(inst_arguments);
  var timeout;
  var delay = 1000;

  d3.select(inst_selection)
    .classed('hovering', true);

  d3.selectAll(params.root+' .row_label_group text')
    .classed('active', function(d) {
      return inst_data.row_name.replace(/_/g, ' ') === d.name;
    });

  d3.selectAll(params.root+' .col_label_text text')
    .classed('active', function(d) {
      return inst_data.col_name === d.name;
    });


  args.push(inst_selection);
  clearTimeout(timeout);
  timeout = setTimeout(check_if_hovering, delay, inst_selection); 

  function check_if_hovering() {
    if ( d3.select(inst_selection).classed('hovering') ){
      if (params.matrix.show_tile_tooltips){
        d3.selectAll('.d3-tip')
          .style('display','block');
        tip.show.apply(inst_selection, args);
        
      }
    }
  }

};