module.exports = function num_visible_labels(params, inst_rc){

var group_name;
if (inst_rc === 'row'){
  group_name = 'group';
} else if (inst_rc === 'col') {
  group_name = 'text';
}

var num_visible = d3.selectAll(params.root+' .'+inst_rc+'_label_'+group_name)
  .filter(function(){
    return d3.select(this).style('display')!='none';
  })[0].length;

  return num_visible;
};