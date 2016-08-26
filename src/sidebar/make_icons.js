var save_svg_png = require('../screenshot/save_svg_png');
var file_saver = require('../screenshot/file_saver');

module.exports = function make_icons(params, sidebar){

  // <a href="help" target="_blank"  id="help_link">
  //   <i class="fa fa-question-circle icon_buttons"></i>
  // </a>

  var saveSvgAsPng = save_svg_png();
  var saveAs = file_saver();

  var row = sidebar
    .select('.icons_section')
    .style('margin-top','7px');

  row
    .append('div')
    .classed('col-xs-4',true)
    .append('a')
    .attr('href','http://amp.pharm.mssm.edu/clustergrammer/help')
    .attr('target','_blank')
    .append('i')
    .classed('fa',true)
    .classed('fa-question-circle',true)
    .classed('icon_buttons',true)
    .style('font-size','25px');

  row
    .append('div')
    .classed('col-xs-4',true)
    .append('i')
    .classed('fa',true)
    .classed('fa-share-alt',true)
    .classed('icon_buttons',true)
    .style('font-size','25px')
    .on('click',function(){

      $(params.root+' .share_info').modal('toggle');
      $('.share_url').val(window.location.href);

    });

  row
    .append('div')
    .classed('col-xs-4',true)
    .append('i')
    .classed('fa',true)
    .classed('fa-camera',true)
    .classed('icon_buttons',true)
    .style('font-size','25px')
    .on('click', function() {

      $(params.root+' .picture_info').modal('toggle');

    });

    // save svg: example from: http://bl.ocks.org/pgiraud/8955139#profile.json
    ////////////////////////////////////////////////////////////////////////////
    function save_clust_svg(){

      d3.select(params.root+' .expand_button').style('opacity',0);

      var html = d3.select(params.root+" svg")
            .attr("title", "test2")
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().parentNode.innerHTML;

      var blob = new Blob([html], {type: "image/svg+xml"});

      saveAs(blob, "clustergrammer.svg");

      d3.select(params.root+' .expand_button').style('opacity',0.4);
    }

    d3.select(params.root+' .download_buttons')
      .append('p')
      .append('a')
      .html('Download SVG')
      .on('click',function(){
        save_clust_svg();
      });


    var svg_id = 'svg_'+params.root.replace('#','');

    // save as PNG
    /////////////////////////////////////////
    d3.select(params.root+' .download_buttons')
      .append('p')
      .append('a')
      .html('Download PNG')
      .on('click',function(){
        d3.select(params.root+' .expand_button').style('opacity',0);
        saveSvgAsPng(document.getElementById(svg_id), "clustergrammer.png");
        d3.select(params.root+' .expand_button').style('opacity',0.4);
      });

};
