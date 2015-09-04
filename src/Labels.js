function Labels(){

  // var row_dendrogram;

  function make_rows(params, row_nodes, reorder){

    // Row Labels 
    //////////////////////////////////
    // make container to pre-position zoomable elements
    var container_all_row = d3.select('#main_svg')
      .append('g')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.clust.margin.top + ')');

    // white background rect for row labels
    container_all_row
      .append('rect')
      .attr('fill', params.background_color)
      .attr('width', params.norm_label.background.row)
      .attr('height', 30 * params.clust.dim.height + 'px')
      .attr('class', 'white_bars');

    // row_labels
    container_all_row
      .append('g')
      // position the outer row label group
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)')
      .append('g')
      .attr('id', 'row_labels');

    // generate and position the row labels
    var row_labels = d3.select('#row_labels')
      .selectAll('.row_label_text')
      .data(row_nodes)
      .enter()
      .append('g')
      .attr('class', 'row_label_text')
      .attr('transform', function(d, index) {
      return 'translate(0,' + params.y_scale(index) + ')';
      })
      .on('dblclick', reorder.row_reorder )
      .on('mouseover', function() {

      // highlight text
      d3.select(this)
        .select('text')
        .classed('active',true);
      })
      .on('mouseout', function mouseout() {
      d3.select(this)
        .select('text')
        .classed('active',false)
      });

    // append row label text
    row_labels
      .append('text')
      .attr('y', params.y_scale.rangeBand() * 0.75)
      // .attr('dy', params.y_scale.rangeBand()/4)
      .attr('text-anchor', 'end')
      .style('font-size', params.default_fs_row + 'px')
      .text(function(d) {
      return d.name;
      });

    // append rectangle behind text
    row_labels
      .insert('rect', 'text')
      .attr('x', -10)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', 10)
      .style('opacity', 0);

    // change the size of the highlighting rects
    row_labels
      .each(function() {
      // get the bounding box of the row label text
      var bbox = d3.select(this)
        .select('text')[0][0]
        .getBBox();
      // use the bounding box to set the size of the rect
      d3.select(this)
        .select('rect')
        .attr('x', bbox.x * 0.5)
        .attr('y', 0)
        .attr('width', bbox.width * 0.5)
        .attr('height', params.y_scale.rangeBand())
        .style('fill', function() {
        var inst_hl = 'yellow';
        return inst_hl;
        })
        .style('opacity', function(d) {
        var inst_opacity = 0;
        // highlight target genes
        if (d.target === 1) {
          inst_opacity = 1;
        }
        return inst_opacity;
        });
      });

      return container_all_row;
   }   

  return {
    make_rows: make_rows
  };

}

// var tmp = Labels();
// console.log('running make rows')
// console.log(tmp.make_rows)
// tmp.make_rows();