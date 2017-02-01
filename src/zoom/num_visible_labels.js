module.exports = function num_visible_labels(params, inst_rc){

  // counting the number of visible labels, probably not necessary

  var num_visible;
  if (inst_rc === 'row'){

    // initialize at high number
    num_visible = 10000;

    // only count visible rows if no downsampling
    if (params.viz.ds_level === -1){
      num_visible = d3.selectAll(params.root+' .row')[0].length;
    }

  } else if (inst_rc === 'col') {

    num_visible = d3.selectAll(params.root+' .'+inst_rc+'_label_text')
      .filter(function(){
        return d3.select(this).style('display')!='none';
      })[0].length;

  }

  return num_visible;
};