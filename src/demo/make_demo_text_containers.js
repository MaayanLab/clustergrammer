module.exports = function make_demo_text_containers(params, demo_text_size){

  if (d3.select(params.root+' .demo_group').empty()){

    var clust_transform = d3.select(params.root+' .clust_container')
      .attr('transform');
    var clust_x = Number(clust_transform.split('(')[1].split(',')[0]);
    var clust_y = Number(clust_transform.split(',')[1].replace(')',''));

    // demo text container 
    var demo_group = d3.select(params.root+' .viz_svg')
      .append('g')
      .classed('demo_group', true)
      .attr('transform', function(){
          var pos_x = clust_x+20;
          var pos_y = clust_y+40;
          return 'translate('+pos_x+','+pos_y+')';
        });

    demo_group
      .append('rect')
      .classed('rect_1', true);

    demo_group
      .append('rect')
      .classed('rect_2', true);

    demo_group
      .append('rect')
      .classed('rect_3', true);

    var shift_height = 1.3*demo_text_size;

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
        return 'translate(0,'+String(shift_height)+')';
      });

    demo_group
      .append('text')
      .attr('id','text_3')
      .attr('font-size',demo_text_size+'px')
      .attr('font-weight',1000)
      .attr('font-family','"Helvetica Neue", Helvetica, Arial, sans-serif')
      .attr('transform', function(){
        return 'translate(0,'+String(2*shift_height)+')';
      });

  }

};