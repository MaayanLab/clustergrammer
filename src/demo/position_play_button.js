module.exports = function position_play_button(params){

  var clust_transform = d3.select(params.root+' .clust_container')
    .attr('transform');

  var clust_x = Number(clust_transform.split('(')[1].split(',')[0]);
  var clust_y = Number(clust_transform.split(',')[1].replace(')',''));
  var trans_x = clust_x + params.viz.clust.dim.width/2;
  var trans_y = clust_y + params.viz.clust.dim.height/2;

  d3.select(params.root+' .play_button')
    .attr('transform', function(){
      return 'translate('+trans_x+','+trans_y+')';
    });

};