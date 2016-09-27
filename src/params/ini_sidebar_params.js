module.exports = function ini_sidebar_params(params){
  var sidebar = {};

  sidebar.wrapper = {};
  // sidebar.wrapper.width = 170;

  sidebar.row_search = {};
  sidebar.row_search.box = {};
  sidebar.row_search.box.height = 34;
  sidebar.row_search.box.width = 95;
  sidebar.row_search.placeholder = params.row_search_placeholder;
  sidebar.row_search.margin_left = 7;

  sidebar.slider = {};
  sidebar.slider.width = params.sidebar_width - 30;
  sidebar.slider.margin_left = 15;


  sidebar.key_cat = {};
  sidebar.key_cat.width = params.sidebar_width - 15;
  sidebar.key_cat.margin_left = 5;
  sidebar.key_cat.max_height = 100;

  sidebar.title = params.title;
  sidebar.title_margin_left = 7;
  sidebar.about = params.about;
  sidebar.width = params.sidebar_width;

  sidebar.buttons = {};
  sidebar.buttons.width = params.sidebar_width - 15;

  sidebar.text = {};

  sidebar.icons = params.sidebar_icons;
  sidebar.icon_margin_left = -5;

  return sidebar;
};