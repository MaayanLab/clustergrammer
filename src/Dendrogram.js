
/* Dendrogram color bar.
 */
function Dendrogram() {

    var group_colors = [];

    // generate random colors for the groups
    for (var i = 0; i < 200; i++) {
        // grab colors from the list
        if (i === 1) {
            group_colors[i] = Colors.get_default_color();
        } else {
            group_colors[i] = Colors.get_random_color(i);
        }
    }

    /* Changes the groupings (x- and y-axis color bars).
     */
    function change_groups(inst_rc, inst_index) {
        if (inst_rc === 'row') {
            d3.selectAll('.row_class_rect')
                .style('fill', function(d) {
                    return group_colors[d.group[inst_index]];
                });
        } else {
            d3.selectAll('.col_class_rect')
                .style('fill', function(d) {
                    return group_colors[d.group[inst_index]];
                });
        }
    }

    function color_group(i) {
        group_colors[i];
    }

    function get_group_color(i) {
        return group_colors[i];
    }

    return {
        color_group: color_group,
        get_group_color: get_group_color,
        change_groups: change_groups
    };
}
