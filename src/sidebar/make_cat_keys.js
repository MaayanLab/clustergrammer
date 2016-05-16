module.exports = function make_cat_keys(params){
  
  var long_name;

  var reorder_types;
  if (params.sim_mat){
    reorder_types = ['both'];
  } else {
    reorder_types = ['row','col'];
  }

  _.each( reorder_types, function(inst_rc){  

    if (params.show_categories[inst_rc]){

      var num_cats = params.viz.all_cats[inst_rc].length;

      _.each( d3.range(num_cats).reverse(), function(i){

        var inst_cat = params.viz.all_cats[inst_rc][i];

        var key_cat = d3.select(params.root+' .sidebar_wrapper')
          .append('div')
          .classed('key_cat_'+inst_rc,true)
          .style('margin-top','10px')
          .style('padding','5px')
          .style('border','1px solid #DEDEDE')
          .style('margin-bottom','10px')
          .style('overflow','scroll')
          .style('max-height',params.sidebar.key_cat.max_height+'px')
          .style('width', params.sidebar.key_cat.width+'px')
          .style('margin-left', params.sidebar.key_cat.margin_left+'px');

        var inst_num = parseInt(inst_cat.split('-')[1],10)+1;

        if (inst_rc === 'row'){
          long_name = 'Row';
        } else {
          long_name = 'Column';
        }

        key_cat
          .append('p')
          .text(long_name+' Category ' + String(inst_num))
          .style('margin-bottom','2px');

        var all_cats = _.keys(params.viz.cat_colors[inst_rc][inst_cat]);

        all_cats = all_cats.sort();

        _.each(all_cats, function(inst_name){

          var inst_group = key_cat
            .append('g')
            .attr('class','category_section');

          inst_group
            .append('div')
            .attr('class','category_color')
            .style('width','15px')
            .style('height','15px')
            .style('float','left')
            .style('margin-right','5px')
            .style('margin-top','2px')
            .style('background-color',function(){
              var inst_color = params.viz.cat_colors[inst_rc][inst_cat][inst_name];
              return inst_color;
            })
            .style('opacity', params.viz.cat_colors.opacity);

          inst_group
            .append('p')
            .style('margin-bottom','2px')
            .append('text')
            .text(inst_name)
            .attr('class','noselect')
            .style('cursor','pointer');

        });

      });

    }

  });  
};