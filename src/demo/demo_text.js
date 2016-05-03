module.exports = function demo_text(params, text, read_duration){

  var split_text = text.split('\n');

  if (split_text.length < 3){
    split_text.push('');
  }

  d3.select(params.root+' .demo_group')
    .style('opacity',0)
    .transition().duration(250)
    .style('opacity',1)
    .transition().duration(250).delay(read_duration)
    .style('opacity',0);
  
  var box_scale = 1.1;

  for (var i=0; i<split_text.length; i++){

    var inst_text_num = i+1;

    // make text box 
    //////////////////
    var inst_text_obj = d3.select(params.root+' .demo_group')
      .select('#text_'+inst_text_num)
      .text(split_text[i]);
    var bbox = inst_text_obj[0][0].getBBox();

    var box_opacity = 0.85;

    d3.select(params.root+' .demo_group')
      .select('#rect_'+inst_text_num)
      .style('fill','white')
      .attr('width', bbox.width+20)
      .attr('height',bbox.height)
      .attr('x',-10)
      .attr('y',bbox.y+i*50)
      .style('opacity',box_opacity);
  }
     
};