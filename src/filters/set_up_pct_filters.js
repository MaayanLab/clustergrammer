// var ini_sliders = require('./ini_sliders');
// var utils = require('../utils');
//
// module.exports = function(filter_type){
//
//   // filter
//   ////////////////////
//   var views = network_data.views;
//
//   // get views with filter type: e.g. fliter_row_sum
//   var all_views = _.filter(views, function(d){return utils.has(d,filter_type);});
//
//   // filter for column category if necessary
//   if (utils.has(all_views[0],'col_cat') ) {
// 
//     // get views with current_col_cat
//     all_views = _.filter(all_views, function(d){
//       if (d.col_cat==cgm.params.current_col_cat){
//         return d;
//       }
//     });
//   }
//
//   console.log( 'found ' + String(all_views.length) +' views for ' + filter_type );
//
//   var inst_max = all_views.length - 1;
//   $( '#slider_'+filter_type ).slider({
//     value:0,
//     min: 0,
//     max: inst_max,
//     step: 1,
//     stop: function( event, ui ) {
//
//       $( "#amount" ).val( "$" + ui.value );
//       var inst_filt = $( '#slider_'+filter_type ).slider( "value" );
//
//       if (filter_type==='filter_row_value'){
//
//         change_view = {'filter_row_value':inst_filt/10};
//         filter_name = 'Value';
//         $('#slider_filter_row_sum').slider( "value", 0);
//         $('#slider_filter_row_num').slider( "value", 0);
//
//         d3.select('.filter_row_sum').text('Filter Sum: 0%');
//         d3.select('.filter_row_num').text('Filter Number Non-zero: 0%');
//
//       } else if (filter_type === 'filter_row_num'){
//
//         change_view = {'filter_row_num':inst_filt/10};
//         filter_name = 'Number Non-zero';
//         $('#slider_filter_row_value').slider( "value", 0);
//         $('#slider_filter_row_sum').slider( "value", 0);
//
//         d3.select('.filter_row_sum').text('Filter Sum: 0%');
//         d3.select('.filter_row_value').text('Filter Value: 0%');
//
//       } else if (filter_type === 'filter_row_sum'){
//
//         change_view = {'filter_row_sum':inst_filt/10};
//         filter_name = 'Sum';
//         $('#slider_filter_row_value').slider( "value", 0);
//         $('#slider_filter_row_num').slider( "value", 0);
//
//         d3.select('.filter_row_value').text('Filter Value: 0%');
//         d3.select('.filter_row_num').text('Filter Number Non-zero: 0%');
//
//       }
//
//       var viz_svg = cgm.params.viz.viz_svg;
//
//       d3.select(viz_svg)
//         .style('opacity',0.70);
//
//       d3.select('.'+filter_type).text('Filter '+filter_name+': '+10*inst_filt+'%');
//
//       $('.slider_filter').slider('disable');
//       d3.selectAll('.btn').attr('disabled',true);
//       d3.selectAll('.category_section')
//         .on('click', '')
//         .select('text')
//         .style('opacity',0.5);
//
//       cgm.update_network(change_view);
//
//       ini_sliders();
//
//       function enable_slider(){
//         $('.slider_filter').slider('enable');
//         d3.selectAll('.btn').attr('disabled',null);
//         d3.selectAll('.category_section')
//           .on('click', category_key_click)
//           .select('text')
//           .style('opacity',1);
//       }
//       setTimeout(enable_slider, 2500);
//
//     }
//   });
//   $( "#amount" ).val( "$" + $( '#slider_'+filter_type ).slider( "value" ) );
//
// };
