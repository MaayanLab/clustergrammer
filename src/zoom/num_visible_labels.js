module.exports = function num_visible_labels(params, inst_rc){

  var num_visible = d3.selectAll('.'+inst_rc+'_label_group')
    .filter(function(){
      return d3.select(this).style('display')!='none';
    })[0].length;

  return num_visible;
};