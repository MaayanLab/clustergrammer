module.exports = function highlight_sidebar_element(params, highlight_class){
  d3.select(params.root+' .'+highlight_class)
      .style('background','#007f00')
      .style('box-shadow','0px 0px 10px 5px #007f00')
      .transition().duration(1).delay(4000)
      .style('background','#FFFFFF')
      .style('box-shadow','none');
}
