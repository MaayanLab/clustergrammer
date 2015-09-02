
    /* API
     * ----------------------------------------------------------------------- */
    return {
        reorder: reorder,
        find_gene: gene_search.find_entities,
        get_genes: gene_search.get_entities,
        change_groups: function(inst_rc, inst_index) {
            dendrogram.change_groups(inst_rc, inst_index);
        }
    };
}
