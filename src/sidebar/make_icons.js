var file_saver = require('../screenshot/file_saver');
var two_translate_zoom = require('../zoom/two_translate_zoom');
var deactivate_cropping = require('../matrix/deactivate_cropping');
var save_svg_png = require('save-svg-as-png');

module.exports = function make_icons(cgm, sidebar){

  var params = cgm.params;
  // var saveSvgAsPng = save_svg_png();
  var saveAs = file_saver();

  var row = sidebar
    .select('.icons_section')
    .style('margin-top','7px')
    .style('margin-left', '5%');

  var width_pct = '22%';
  var padding_left = '0px';
  var padding_right = '0px';

  row
    .append('div')
    .classed('clust_icon',true)
    .style('float','left')
    .style('width', width_pct)
    .style('padding-left', padding_left)
    .style('padding-right', padding_right)
    .append('i')
    .classed('fa',true)
    .classed('fa-share-alt',true)
    .classed('icon_buttons',true)
    .style('font-size','25px')
    .on('click',function(){
      $(params.root+' .share_info').modal('toggle');
      $('.share_url').val(window.location.href);
    })
    .classed('sidebar_tooltip', true)
    .append('span')
    .classed('sidebar_tooltip_text', true)
    .html('Share')
    .style('left','0%');

  row
    .append('div')
    .classed('clust_icon',true)
    .style('float','left')
    .style('width', width_pct)
    .style('padding-left', padding_left)
    .style('padding-right', padding_right)
    .append('i')
    .classed('fa',true)
    .classed('fa-camera',true)
    .classed('icon_buttons',true)
    .style('font-size','25px')
    .on('click', function() {

      $(params.root+' .picture_info').modal('toggle');

    })
    .classed('sidebar_tooltip', true)
    .append('span')
    .classed('sidebar_tooltip_text', true)
    .html('Take snapshot')
    .style('left','-100%');

  row
    .append('div')
    .classed('clust_icon',true)
    .style('float','left')
    .style('width', width_pct)
    .style('padding-left', padding_left)
    .style('padding-right', padding_right)
    .append('i')
    .classed('fa',true)
    .classed('fa fa-cloud-download',true)
    .classed('icon_buttons',true)
    .style('font-size','25px')
    .on('click', function() {

      cgm.save_matrix();

    })
    .classed('sidebar_tooltip', true)
    .append('span')
    .classed('sidebar_tooltip_text', true)
    .html('Download matrix')
    .style('left','-200%');

  row
    .append('div')
    .classed('clust_icon',true)
    .style('float','left')
    .style('width', width_pct)
    .style('padding-left', padding_left)
    .style('padding-right', '-5px')
    .append('i')
    .classed('fa', true)
    .classed('fa-crop', true)
    .classed('crop_button', true)
    .classed('icon_buttons',true)
    .style('font-size','25px')
    .on('click', function(){

      // do nothing if dendro filtering has been done
      if(cgm.params.dendro_filter.row === false && cgm.params.dendro_filter.col === false){

        var is_crop = d3.select(this)
          .classed('fa-crop');

        var is_undo = d3.select(this)
          .classed('fa-undo');

        // press crop button (can be active/incative)
        if (is_crop){

          // keep list of names to return to state
          cgm.params.crop_filter_nodes = {};
          cgm.params.crop_filter_nodes.row_nodes = cgm.params.network_data.row_nodes;
          cgm.params.crop_filter_nodes.col_nodes = cgm.params.network_data.col_nodes;

          cgm.brush_crop_matrix();

          if (d3.select(this).classed('active_cropping') === false){

            // set active_cropping (button turns red)
            d3.select(this)
              .classed('active_cropping', true)
              .style('color', 'red');

          } else {
            // deactivate cropping (button turns blue)
            d3.select(this)
              .classed('active_cropping', false)
              .style('color', '#337ab7');

            deactivate_cropping(cgm);
          }


        }

        // press undo button
        if (is_undo){

          d3.select(params.root+' .crop_button')
            .style('color', '#337ab7')
            .classed('fa-crop', true)
            .classed('fa-undo', false);

          // cgm.filter_viz_using_names(cgm.params.crop_filter_nodes);
          cgm.filter_viz_using_nodes(cgm.params.crop_filter_nodes);

          // show dendro crop buttons after brush-cropping has been undone
          d3.select(cgm.params.root+' .col_dendro_icons_container')
            .style('display', 'block');
          d3.select(cgm.params.root+' .row_dendro_icons_container')
            .style('display', 'block');


        }

        two_translate_zoom(cgm, 0, 0, 1);
      }

    })
    .classed('sidebar_tooltip', true)
    .append('span')
    .classed('sidebar_tooltip_text', true)
    .html('Crop matrix')
    .style('left','-400%');

    // save svg: example from: http://bl.ocks.org/pgiraud/8955139#profile.json
    ////////////////////////////////////////////////////////////////////////////
    function save_clust_svg(){

      d3.select(params.root+' .expand_button').style('opacity',0);

      var html = d3.select(params.root+" .viz_svg")
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
        // saveSvgAsPng(document.getElementById(svg_id), "clustergrammer.png");
        save_svg_png.saveSvgAsPng(document.getElementById(svg_id), "clustergrammer.png");
        d3.select(params.root+' .expand_button').style('opacity',0.4);
      });

};
