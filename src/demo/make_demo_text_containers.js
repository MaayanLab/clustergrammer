module.exports = function make_demo_text_containers(params, demo_text_size){

  // demo text container 
  var demo_group = d3.select(params.root+' .viz_svg')
    .append('g')
    .classed('demo_group', true)
    .attr('transform', function(){
        var pos_x = 200;
        var pos_y = 200;
        return 'translate('+pos_x+','+pos_y+')';
      });

  demo_group
    .append('rect')
    .attr('id','rect_1');

  demo_group
    .append('rect')
    .attr('id','rect_2');

  demo_group
    .append('rect')
    .attr('id','rect_3');

  demo_group
    .append('text')
    .attr('id','text_1')
    .attr('font-size',demo_text_size+'px')
    .attr('font-weight',1000)
    .attr('font-family','"Helvetica Neue", Helvetica, Arial, sans-serif');

  demo_group
    .append('text')
    .attr('id','text_2')
    .attr('font-size',demo_text_size+'px')
    .attr('font-weight',1000)
    .attr('font-family','"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('transform', function(){
      return 'translate(0,50)';
    });

  demo_group
    .append('text')
    .attr('id','text_3')
    .attr('font-size',demo_text_size+'px')
    .attr('font-weight',1000)
    .attr('font-family','"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('transform', function(){
      return 'translate(0,100)';
    });

};