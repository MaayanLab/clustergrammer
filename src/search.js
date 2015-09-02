/* Functions for handling row entities, in this case genes.
 * TODO: Refactor into module that tracks the entities in both cols and rows.
 * ----------------------------------------------------------------------- */

/* Collect all gene symbols from rows.
 */
function collect_genes_from_network(row_nodes) {
    var all_genes = [],
        i;
    for (i = 0; i < row_nodes.length; i++) {
        all_genes.push(row_nodes[i].name);
    }
    return all_genes;
}

/* Find a gene (row) in the clustergram.
 */
function find_gene(search_gene) {
    if (globals.params.all_genes.indexOf(search_gene) !== -1) {
        zoom_and_highlight_found_gene(search_gene);
    }
}

/* Zoom into and highlight the found the gene
 */
function zoom_and_highlight_found_gene(search_gene) {

    // get parameters
    var params = globals.params;

    // unhighlight and unbold all genes
    d3.selectAll('.row_label_text')
        .select('text')
        .style('font-weight', 'normal');
    d3.selectAll('.row_label_text')
        .select('rect')
        .style('opacity', 0);

    // find the index of the gene
    var inst_gene_index = _.indexOf(params.all_genes, search_gene);

    // get y position
    var inst_y_pos = params.y_scale(inst_gene_index);

    // highlight row name
    d3.selectAll('.row_label_text')
        .filter(function(d) {
            return d.name === search_gene;
        })
        .select('rect')
        .style('opacity', 1);

    // calculate the y panning required to center the found gene
    var pan_dy = params.clust.dim.height / 2 - inst_y_pos;

    // use two translate method to control zooming
    // pan_x, pan_y, zoom
    two_translate_zoom(0, pan_dy, params.zoom_switch);
}

/* Returns all the genes in the clustergram.
 */
function get_genes() {
    return globals.params.all_genes;
}