
/* Dendrogram color bar.
 */
function Dendrogram(type, params, elem) {

    var group_colors = [],
        dom_class,
        i;

    build_color_groups();
    if (type === 'row') {
        dom_class = 'row_class_rect';
        build_row_dendro();
    } else {
        dom_class = 'col_class_rect';
        build_col_dendro();
    }

    function build_color_groups() {
        for (i = 0; i < Colors.get_num_colors(); i++) {
            // grab colors from the list
            if (i === 1) {
                group_colors[i] = Colors.get_default_color();
            } else {
                group_colors[i] = Colors.get_random_color(i);
            }
        }
    }

    /* Changes the groupings (x- and y-axis color bars).
     */
    function change_groups(inst_index) {
        d3.selectAll('.' + dom_class)
            .style('fill', function(d) {
                return group_colors[d.group[inst_index]];
            });
    }

    function color_group(j) {
        group_colors[j];
    }

    function get_group_color(j) {
        return group_colors[j];
    }

    function build_row_dendro() {
        elem
            .append('rect')
            .attr('class', dom_class)
            .attr('width', function() {
                var inst_width = params.class_room.symbol_width - 1;
                return inst_width + 'px';
            })
            .attr('height', params.y_scale.rangeBand())
            .style('fill', function(d) {
                var inst_level = params.group_level.row;
                return get_group_color(d.group[inst_level]);
            })
            .attr('x', function() {
                var inst_offset = params.class_room.symbol_width + 1;
                return inst_offset + 'px';
            });
    }

    function build_col_dendro() {
        elem
            .append('rect')
            .attr('class', dom_class)
            .attr('width', params.x_scale.rangeBand())
            .attr('height', function() {
                var inst_height = params.class_room.col - 1;
                return inst_height;
            })
            .style('fill', function(d) {
                var inst_level = params.group_level.col;
                return get_group_color(d.group[inst_level]);
            });
    }

    return {
        color_group: color_group,
        get_group_color: get_group_color,
        change_groups: change_groups
    };
}
