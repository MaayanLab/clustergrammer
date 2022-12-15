/* Utility functions
 * ----------------------------------------------------------------------- */
module.exports = {
  normal_name: function (d) {
    var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
    return inst_name;
  },
  is_supported_order: function (order) {
    return (
      order === 'ini' ||
      order === 'clust' ||
      order === 'rank_var' ||
      order === 'rank' ||
      order === 'class' ||
      order == 'alpha'
    );
  },

  /* Returns whether or not an object has a certain property.
   */
  has: function (obj, key) {
    return obj && hasOwnProperty.call(obj, key);
  },

  property: function (key) {
    return function (obj) {
      return obj == null ? void 0 : obj[key];
    };
  },

  // Convenience version of a common use case of `map`: fetching a property.
  pluck: function (arr, key) {
    var self = this;
    return arr.map(self.property(key));
  },

  /* Returns true if the object is undefined.
   */
  is_undefined: function (obj) {
    return obj === void 0;
  },

  /* Mixes two objects in together, overwriting a target with a source.
   */
  extend: function (target, source) {
    target = target || {};
    for (var prop in source) {
      if (typeof source[prop] === 'object') {
        target[prop] = this.extend(target[prop], source[prop]);
      } else {
        target[prop] = source[prop];
      }
    }
    return target;
  }
};
