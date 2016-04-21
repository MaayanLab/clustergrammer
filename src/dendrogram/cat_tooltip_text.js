var get_cat_title = require('../categories/get_cat_title');

module.exports = function cat_tooltip_text(params, inst_data, inst_selection, inst_rc){

  // category index 
  var inst_cat = d3.select(inst_selection).attr('cat');
  var cat_title = get_cat_title(params.viz, inst_cat, inst_rc);
  var cat_name = inst_data[inst_cat];

  if (cat_name.indexOf(': ') >=0){
    cat_name = cat_name.split(': ')[1];
  }

  d3.select(inst_selection)
    .classed('hovering',true);

  setTimeout(highlight_categories, 700);

  return cat_title + ': '+ cat_name;


  function highlight_categories(){

    if (d3.select(inst_selection).classed('hovering')){

      if (cat_name.indexOf('Not ') < 0){
        d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
          .selectAll('rect')
          .style('opacity', function(d){
            var inst_opacity;
            var tmp_cat = d3.select(this).attr('cat');

            if (d[tmp_cat].indexOf(': ')>=0){
              var tmp_name = d[tmp_cat].split(': ')[1];
            } else {
              var tmp_name = d[tmp_cat];
            }

            if (tmp_cat === inst_cat && tmp_name === cat_name){
              inst_opacity = params.viz.cat_colors.active_opacity;
            } else {
              inst_opacity = params.viz.cat_colors.opacity/2;
            }

            return inst_opacity;
          })
      }
    } 

  };

};