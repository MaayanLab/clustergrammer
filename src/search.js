
/* Handles searching rows or columns.
 * ----------------------------------------------------------------------- */
function Search(nodes, prop) {

    /* Collect entities from row or columns.
     */
    var entities = [],
        i;

    for (i = 0; i < nodes.length; i++) {
        entities.push(nodes[i][prop]);
    }

    /* Find a gene (row) in the clustergram.
     */
    function find_entities(search_term) {
        if (entities.indexOf(search_term) !== -1) {
            un_hightlight_entities();
            zoom_and_highlight_found_entity(search_term);
            higlight_entity(search_term);
        }
    }

    /* Zoom into and highlight the found the gene
     */
    function zoom_and_highlight_found_entity(search_term) {
        var idx = _.indexOf(entities, search_term),
            inst_y_pos = globals.params.y_scale(idx),
            pan_dy = globals.params.clust.dim.height / 2 - inst_y_pos;

        two_translate_zoom(0, pan_dy, globals.params.zoom_switch);
    }

    function un_hightlight_entities() {
        d3.selectAll('.row_label_text').select('text').style('font-weight', 'normal');
        d3.selectAll('.row_label_text').select('rect').style('opacity', 0);
    }

    function higlight_entity(search_term) {
        // highlight row name
        d3.selectAll('.row_label_text')
            .filter(function(d) {
                return d[prop] === search_term;
            })
            .select('rect')
            .style('opacity', 1);
    }

    /* Returns all the genes in the clustergram.
     */
    function get_entities() {
        return entities;
    }

    return {
        find_entities: find_entities,
        get_entities: get_entities
    }
}