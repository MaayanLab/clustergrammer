module.exports = function make_play_button(cgm){

  var params = cgm.params;

  if (d3.select(params.root+' .play_button').empty()){

    var play_button = d3.select(params.root+' .viz_svg')
      .append('g')
      .classed('play_button', true)
      .classed('running_demo', false);

    var clust_transform = d3.select(params.root+' .clust_container')
      .attr('transform');
    var clust_x = Number(clust_transform.split('(')[1].split(',')[0]);
    var clust_y = Number(clust_transform.split(',')[1].replace(')',''));


    var trans_x = clust_x + params.viz.clust.dim.width/2;
    var trans_y = clust_y + params.viz.clust.dim.height/2;


    play_button
      .attr('transform', function(){
        return 'translate('+trans_x+','+trans_y+')';
      });

    play_button
      .append('circle')
      .style('r', 45)
      .style('fill','white')
      .style('stroke','black')
      .style('stroke-width','3px')
      .style('opacity',0.5);

    play_button
      .append('path')
      .attr('d',function(){

        var tri_w = 40;
        var tri_h = 22; 
        var tri_offset = 15;

        return 'M-'+tri_offset+',-'+tri_h+' l '+tri_w+','+tri_h+' l -'+tri_w+','+tri_h+' z ';
      })
      .style('fill','black')
      .style('opacity',0.5);

    // mouseover behavior
    play_button
      .on('mouseover', function(){
        d3.select(this)
          .select('path')
          .style('fill','red')
          .style('opacity',1);

        d3.select(this)
          .select('circle')
          .style('opacity',1);

      })
      .on('mouseout', function(){
        d3.select(this)
          .select('path')
          .style('fill','black')
          .style('opacity',0.5);
        d3.select(this)
          .select('circle')
          .style('opacity',0.5);
      })
      .on('click', function(){
        // running from anonymous function to keep this defined correctly 
        cgm.play_demo();
      });

  }

};