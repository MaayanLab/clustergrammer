
/* API
 * ----------------------------------------------------------------------- */
 
// reorder is defined here for the API
var reorder = Reorder();

return {
    reorder: reorder,
    find_gene: gene_search.find_entities,
    get_genes: gene_search.get_entities,
    change_groups: viz.change_group,
    reorder: reorder.all_reorder
};
	
}
