var trim_text = require('./trim_text');

module.exports = function zooming_has_stopped(params, zoom_info){
  
  var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));

  if (inst_zoom === 0){

    var check_stop = Number(d3.select(params.root+' .viz_svg').attr('stopped_zoom'));
    if (check_stop!=0){

    d3.selectAll('.row_label_group')
      .select('text')
      .style('display','block');


      d3.select(params.root+' .viz_svg').attr('stopped_zoom',0);

      d3.selectAll('.row_label_group').select('text').style('display','block')
      d3.selectAll('.col_label_group').select('text').style('display','block')
      
      d3.selectAll('.tile').style('display','block')

      // console.log('NOT zooming - only run once')
      // console.log('zooming has stopped and running text trim ')

      d3.selectAll(params.root+' .row_label_group' )
        .each(function() { trim_text(params, this, 'row'); });
      d3.selectAll(params.root+' .col_label_group')
        .each(function() { trim_text(params, this, 'col'); });

      // setTimeout(delay_fs, 500)
    }
  }


  function delay_fs(){
    console.log('delayFS!!!!')
    d3.selectAll('.row_label_group')
      .select('text')
      .style('font-size',function(){
        var inst_fs = d3.select(this).style('font-size').replace('px','');

        return inst_fs;
      })
  }

};