var recluster = require('../recluster/recluster');
var button_section = require('./make_tree_menu_button_section');

module.exports = function make_tree_menu(cgm){

  var params = cgm.params;
  var menu_width = 400;
  var menu_height = 237;
  var default_opacity = 0.35;
  var high_opacity = 0.5;
  var x_offset = 20;

  // make tree menu (state is in cgm, remade each time)
  /////////////////////////////////////////////////////
  var tree_menu = d3.select(params.root+' .viz_svg')
    .append('g')
    .attr('transform', function(){
      var shift = {};
      shift.x = params.viz.clust.dim.width + params.viz.clust.margin.left - menu_width + 30;
      shift.y = params.viz.clust.margin.top + 15;
      return 'translate(' + shift.x + ', ' + shift.y + ')';
    })
    .classed('tree_menu', true);

  tree_menu
    .attr('opacity', 0.0)
    .transition()
    .attr('opacity', 1.0);

  var menu_opacity = 0.95;

  tree_menu
    .append('rect')
    .classed('tree_menu_background', true)
    .attr('width', function(){
      var inst_width = menu_width;
      return inst_width;
    })
    .attr('height', menu_height)
    .attr('fill', 'white')
    .attr('stroke', '#A3A3A3')
    .attr('stroke-width', '3px')
    .attr('opacity', menu_opacity);

  // Clustering Parameters
  tree_menu
    .append('text')
    .classed('tree_menu_title', true)
    .attr('transform', 'translate(' + x_offset + ',30)')
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('font-size','18px')
    .attr('font-weight', 800)
    .attr('cursor', 'default')
    .text('Clustering Parameters');

  var distance_circle_fill = function(d){
    var inst_color = 'white';
    if (d === cgm.params.matrix.distance_metric){
      inst_color = 'red';
    }
    return inst_color;
  }

  var linkage_circle_fill = function(d){
    var inst_color = 'white';
    if (d === cgm.params.matrix.linkage_type){
      inst_color = 'red';
    }
    return inst_color;
  }

  var distance_click = function(button_selection, d, button_info){
    button_info.distance_metric = d;
    d3.select(button_selection)
      .select('circle')
      .attr('fill', 'red');
  }

  var linkage_click = function(button_selection, d, button_info){
    button_info.linkage_type = d;
    console.log('clicking linkage', button_info.linkage_type)
    d3.select(button_selection)
      .select('circle')
      .attr('fill', 'red');
  }


  var button_info = {};
  button_info.cgm = cgm;
  button_info.tree_menu = tree_menu;
  button_info.menu_width = menu_width;
  button_info.distance_metric = cgm.params.matrix.distance_metric;
  button_info.linkage_type = cgm.params.matrix.linkage_type;

  // linkage
  /////////////////
  var distance_names = ['cosine', 'euclidean', 'correlation'];
  button_info.name = 'Distance Metric';
  button_info.y_offset = 65;
  button_info.x_offset = 0;
  button_section('distance', button_info, distance_names, distance_circle_fill, distance_click)

  // linkage
  /////////////////
  var linkage_names = ['average', 'single', 'complete'];
  button_info.name = 'Linkage Type';
  button_info.y_offset = 65;
  button_info.x_offset = menu_width/2;
  button_section('linkage', button_info, linkage_names, linkage_circle_fill, linkage_click)

  // // Z-score
  // /////////////////
  // var zscore_names = ['row', 'col'];
  // button_info.name = 'Linkage Type';
  // button_info.y_offset = 200;
  // button_info.x_offset = 0;
  // button_section(button_info, linkage_names, distance_click)

  var update_button_width = 100;
  var update_buton_x = menu_width/2 + x_offset;
  var update_buton_y = 205;

  var update_button = tree_menu
    .append('g')
    .classed('update_button', true)
    .attr('transform', 'translate('+ update_buton_x +', ' + update_buton_y + ')')
    .on('click', function(){

      console.log('clicking update button')

      console.log(button_info.distance_metric)

      // toggle tree menu
      d3.select(params.root+' .tree_menu')
        .transition(700)
        .attr('opacity', 0);

      setTimeout(function(){
        d3.select(params.root+' .tree_menu')
          .remove();
      }, 700);

      // transfer to cgm object when update is pressed
      cgm.params.matrix.distance_metric = button_info.distance_metric;
      cgm.params.matrix.linkage_type = button_info.linkage_type;
      recluster(cgm, button_info.distance_metric, button_info.linkage_type);

    })
    .on('mouseover', function(){
      d3.select(this)
        .select('rect')
        .attr('opacity', high_opacity)
    })
    .on('mouseout', function(){
      d3.select(this)
        .select('rect')
        .attr('opacity', default_opacity)
    });

  update_button
    .append('rect')
    .attr('width', update_button_width + 'px')
    .attr('height', '35px')
    .attr('fill', 'blue')
    .attr('transform', 'translate(0, -23)')
    .attr('stroke', '#A3A3A3')
    .attr('stroke-width', '1px')
    .attr('opacity', default_opacity)

  update_button
    .append('text')
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('font-size','18px')
    .attr('font-weight', 500)
    .attr('cursor', 'default')
    .text('Update')
    .attr('transform', 'translate(18, 0)');


  ///////////////////////////////////////////////////////
};