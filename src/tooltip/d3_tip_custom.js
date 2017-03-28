module.exports = function d3_tip_custom(){
/* eslint-disable */
// Copyright (c) 2013 Justin Palmer
//
// Tooltips for d3.js SVG visualizations

// Public - contructs a new tooltip
//
// Returns a tip
// ******************
// Nick Fernandez modified version 4-19-2016
// improved multiple svg, scrolling+zooming support
// made syntax fixes
//////////////////////////////////////////////
  var direction = d3_tip_direction,
      offset    = d3_tip_offset,
      html      = d3_tip_html,
      node      = initNode(),
      svg       = null,
      point     = null,
      target    = null;

  function tip(vis) {
    svg = getSVGNode(vis);
    point = svg.createSVGPoint();
    document.body.appendChild(node);
  }

  // Public - show the tooltip on the screen
  //
  // Returns a tip
  tip.show = function() {

    var args = Array.prototype.slice.call(arguments);
    if (args[args.length - 1] instanceof SVGElement) {
      target = args.pop();
    }

    var content = html.apply(this, args);
    var poffset = offset.apply(this, args);
    var dir     = direction.apply(this, args);
    var nodel   = d3.select(node);
    var i = 0;
    var coords;

    // add z-index to make sure tooltips appear on top
    nodel.html(content)
      .style({opacity: 1, 'pointer-events': 'all'})
      .style('z-index', 99);

    while(i--) {
      nodel.classed(directions[i], false);
    }
    coords = direction_callbacks.get(dir).apply(this);
    nodel.classed(dir, true).style({
      top: (coords.top +  poffset[0]) + 'px',
      left: (coords.left + poffset[1]) + 'px'
    });

    // quick fix for fading tile tooltips
    if (isFunction(this) === false){

      var inst_class = d3.select(this).attr('class');

      if (inst_class.indexOf('tile') >= 0){
        setTimeout(fade_tips, 5000, this);
      }

    }

    return tip;
  };

  // Public - hide the tooltip
  //
  // Returns a tip
  tip.hide = function() {

    // // hide all d3-tip tooltips
    // d3.selectAll('.d3-tip')
    //   .style('display', 'none');

    var nodel = d3.select(node);
    nodel.style({opacity: 0, 'pointer-events': 'none'});
    return tip;
  };

  // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
  //
  // n - name of the attribute
  // v - value of the attribute
  //
  // Returns tip or attribute value
  tip.attr = function(n) {
    if (arguments.length < 2 && typeof n === 'string') {
      return d3.select(node).attr(n);
    } else {
      var args =  Array.prototype.slice.call(arguments);
      d3.selection.prototype.attr.apply(d3.select(node), args);
    }

    return tip;
  };

  // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
  //
  // n - name of the property
  // v - value of the property
  //
  // Returns tip or style property value
  tip.style = function(n) {
    if (arguments.length < 2 && typeof n === 'string') {
      return d3.select(node).style(n);
    } else {
      var args =  Array.prototype.slice.call(arguments);
      d3.selection.prototype.style.apply(d3.select(node), args);
    }

    return tip;
  };

  // Public: Set or get the direction of the tooltip
  //
  // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
  //     sw(southwest), ne(northeast) or se(southeast)
  //
  // Returns tip or direction
  tip.direction = function(v) {
    if (!arguments.length){
      return direction;
    }
    direction = v == null ? v : d3.functor(v);

    return tip;
  };

  // Public: Sets or gets the offset of the tip
  //
  // v - Array of [x, y] offset
  //
  // Returns offset or
  tip.offset = function(v) {
    if (!arguments.length) {
      return offset;
    }
    offset = v == null ? v : d3.functor(v);

    return tip;
  };

  // Public: sets or gets the html value of the tooltip
  //
  // v - String value of the tip
  //
  // Returns html value or tip
  tip.html = function(v) {
    if (!arguments.length) {
      return html;
    }
    html = v == null ? v : d3.functor(v);

    return tip;
  };

  function d3_tip_direction() {
    return 'n';
  }
  function d3_tip_offset() {
    return [0, 0];
  }
  function d3_tip_html() {
    return ' ';
  }

  var direction_callbacks = d3.map({
    n:  direction_n,
    s:  direction_s,
    e:  direction_e,
    w:  direction_w,
    nw: direction_nw,
    ne: direction_ne,
    sw: direction_sw,
    se: direction_se,
    south_custom: direction_south_custom
  }),

  directions = direction_callbacks.keys();

  function direction_south_custom() {
    var bbox = getScreenBBox();


    return {
      top:  bbox.s.y,
      left: bbox.s.x ,
    };

  }

  function direction_n() {
    var bbox = getScreenBBox();
    return {
      top:  bbox.n.y - node.offsetHeight,
      left: bbox.n.x - node.offsetWidth / 2
    };
  }

  function direction_s() {
    var bbox = getScreenBBox();
    return {
      top:  bbox.s.y,
      left: bbox.s.x - node.offsetWidth / 2
    };
  }

  function direction_e() {
    var bbox = getScreenBBox();
    return {
      top:  bbox.e.y - node.offsetHeight / 2,
      left: bbox.e.x
    };
  }

  function direction_w() {
    var bbox = getScreenBBox();
    return {
      top:  bbox.w.y - node.offsetHeight / 2,
      left: bbox.w.x - node.offsetWidth
    };
  }

  function direction_nw() {
    var bbox = getScreenBBox();
    return {
      top:  bbox.nw.y - node.offsetHeight,
      left: bbox.nw.x - node.offsetWidth
    };
  }

  function direction_ne() {
    var bbox = getScreenBBox();
    return {
      top:  bbox.ne.y - node.offsetHeight,
      left: bbox.ne.x
    };
  }

  function direction_sw() {
    var bbox = getScreenBBox();
    return {
      top:  bbox.sw.y,
      left: bbox.sw.x - node.offsetWidth
    };
  }

  function direction_se() {
    var bbox = getScreenBBox();
    return {
      top:  bbox.se.y,
      left: bbox.e.x
    };
  }

  function initNode() {
    var node = d3.select(document.createElement('div'));
    node.style({
      position: 'absolute',
      opacity: 0,
      pointerEvents: 'none',
      boxSizing: 'border-box'
    });

    return node.node();
  }

  function getSVGNode(el) {
    el = el.node();
    if(el.tagName.toLowerCase() == 'svg'){
      return el;
    }

    return el.ownerSVGElement;
  }

  // Private - gets the screen coordinates of a shape
  //
  // Given a shape on the screen, will return an SVGPoint for the directions
  // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
  // sw(southwest).
  //
  //    +-+-+
  //    |   |
  //    +   +
  //    |   |
  //    +-+-+
  //
  // Returns an Object {n, s, e, w, nw, sw, ne, se}
  function getScreenBBox() {
    var targetel   = target || d3.event.target;
    var bbox       = {};
    var matrix     = targetel.getScreenCTM();
    var tbbox      = targetel.getBBox();
    var width      = tbbox.width;
    var height     = tbbox.height;
    var x          = tbbox.x;
    var y          = tbbox.y;
    var scrollTop  = document.documentElement.scrollTop || document.body.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

    // Nick - prevents bugs with scrolling and zooming on the same object
    matrix.a = 1;
    matrix.d = 1;
    // changing order of adding scrolling,
    // original ordering was causing problems with pre-translated or rotated
    // elements.
    matrix.e = matrix.e + scrollLeft;
    matrix.f = matrix.f + scrollTop;
    point.x = x; //+ scrollLeft
    point.y = y; //+ scrollTop

    bbox.nw = point.matrixTransform(matrix);
    point.x = point.x + width;
    bbox.ne = point.matrixTransform(matrix);
    point.y = point.y + height;
    bbox.se = point.matrixTransform(matrix);
    point.x = point.x - width;
    bbox.sw = point.matrixTransform(matrix);
    point.y = point.y - height / 2;
    bbox.w  = point.matrixTransform(matrix);
    point.x = point.x + width;
    bbox.e = point.matrixTransform(matrix);
    point.x = point.x - width / 2;
    point.y = point.y - height / 2;
    bbox.n = point.matrixTransform(matrix);
    point.y = point.y + height;
    bbox.s = point.matrixTransform(matrix);

    return bbox;
  }

  // only fade tips if you are still hovering on the current tip
  function fade_tips(inst_selection){

    var is_hovering = d3.select(inst_selection)
      .classed('hovering');

    if (is_hovering){
      d3.selectAll('.d3-tip')
        .transition()
        .duration(250)
        .style('opacity',0)
        .style('display', 'none');
    }
  }

  function isFunction(functionToCheck) {
   var getType = {};
   return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }

  return tip;
};