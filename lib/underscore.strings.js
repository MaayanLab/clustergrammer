//     Underscore Strings v0.1
//     Enhances the _ object with a series of useful methods
//     extracted from Protorype's js String module
//     Source code available at:
//     http://github.com/aganov/underscore-strings

// [Run test suite](../spec/runner.html) |
// [Download .tar.gz](http://github.com/aganov/underscore-strings/tarball/master) |
// [Download .zip](http://github.com/aganov/underscore-strings/zipball/master)

// TODO
//
// - port [String#gsub](http://api.prototypejs.org/language/String/prototype/gsub/) method
// - port [String#sub](http://api.prototypejs.org/language/String/prototype/sub/) method
(function(){
  
  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;
    
  var strip = function(string) {
    if (String.prototype.trim) {
      return string.trim();
    }
    
    return string.replace(/^\s+/, '').replace(/\s+$/, '');
  }
  
  var str = {
    // ## blank
    // [String#blank](http://api.prototypejs.org/language/String/prototype/blank/)
    // Check if the string is "blank" - either empty (length of `0`) or
    // containing only whitespace.
    // ##### Example
    //     _("").blank()
    //     » true
    blank: function(string) {
      return /^\s*$/.test(string);
    },
    
    // ## camelize
    // [String#camelize](http://api.prototypejs.org/language/String/prototype/camelize/)
    // Converts a string separated by dashes into a camelCase equivalent.
    // For instance, `foo-bar` would be converted to `fooBar`.
    // ##### Example
    //     _("background-color").camelize()
    //     » "backgroundColor"
    camelize: function(string) {
      return string.replace(/-+(.)?/g, function(match, chr) {
        return chr ? chr.toUpperCase() : '';
      });
    },
    
    // ## capitalize
    // [String#capitalize](http://api.prototypejs.org/language/String/prototype/capitalize/)
    // Capitalizes the first letter of a string and downcases all the others.
    // ##### Examples
    //     _("hello").capitalize()
    //     » "Hello"
    capitalize: function(string) {
      return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
    },
    
    // ## dasherize
    // [String#dasherize](http://api.prototypejs.org/language/String/prototype/dasherize/)
    // Replaces every instance of the underscore character `_` by a dash `-`.
    // ##### Examples
    //     _("border_bottom_width").dasherize()
    //     » "border-bottom-width"
    dasherize: function(string) {
      return string.replace(/_/g, '-');
    },
    
    // ## empty
    // [String#empty](http://api.prototypejs.org/language/String/prototype/empty/)
    // Checks if the string is empty.
    // ##### Examples
    //     _("").empty()
    //     » true
    empty: function(string) {
      return string == ''
    },
    
    // ## endsWith
    // [String#endsWith](http://api.prototypejs.org/language/String/prototype/endsWith/)
    // Checks if the string ends with substring.
    // ##### Example
    //     _("slaughter").endsWith("laughter")
    //     » true
    endsWith: function (string, pattern) {
      var d = string.length - pattern.length;
      // We use `indexOf` instead of `lastIndexOf` to avoid tying execution
      // time to string length when string doesn't end with pattern.
      return d >= 0 && string.indexOf(pattern, d) === d;
    },
    
    // ## escapeHTML
    // [String#escapeHTML](http://api.prototypejs.org/language/String/prototype/escapeHTML/)
    // Converts HTML special characters to their entity equivalents.
    // ##### Examples
    //     _("<div class="article">This is an article</div>").escapeHTML()
    //     » "&lt;div class="article"&gt;This is an article&lt;/div&gt;"
    escapeHTML: function(string) {
      return string.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    },
    
    // ## include
    // [String#include](http://api.prototypejs.org/language/String/prototype/include/)
    // Check if the string contains a substring.
    // ##### Examples
    //     _("Underscore").include("score")
    //     » true
    include: function(string, pattern) {
      return string.indexOf(pattern) > -1;
    },
    
    // ## toQueryParams
    // [String#toQueryParams](http://api.prototypejs.org/language/String/prototype/toQueryParams/)
    // Parses a URI-like query string and returns an object composed of parameter/value pairs.
    // ##### Example
    //     _("section=blog&id=45").toQueryParams()
    //     » {section: 'blog', id: '45'}
    //
    //     _("http://www.example.com?section=blog&id=45#comments").toQueryParams()
    //     » {section: 'blog', id: '45'}
    toQueryParams: function(string, separator) {
      var match = _(string).strip().match(/([^?#]*)(#.*)?$/);
      if (!match) return { };
      
      return _(match[1].split(separator || '&')).reduce(function(hash, pair) {
        if ((pair = pair.split('='))[0]) {
          var key = decodeURIComponent(pair.shift()),
              value = pair.length > 1 ? pair.join('=') : pair[0];
              
          if (value != undefined) value = decodeURIComponent(value);
          
          if (key in hash) {
            if (!_.isArray(hash[key])) hash[key] = [hash[key]];
            hash[key].push(value);
          }
          else hash[key] = value;
        }
        return hash;
      }, {});
    },
    
    // ## startsWith
    // [String#startsWith](http://api.prototypejs.org/language/String/prototype/startsWith/)
    // Checks if the string starts with `substring`
    // ##### Example
    //     _("Underscore").include("Under")
    //     » true
    startsWith: function(string, pattern) {
      return string.lastIndexOf(pattern, 0) === 0;
    },
    
    // ## strip
    // [String#strip](http://api.prototypejs.org/language/String/prototype/strip/)
    // Strips all leading and trailing whitespace from a string.
    // ##### Example
    //     _('    hello world!    ').strip()
    //     » "hello world!"
    strip: strip,
    
    // ## truncate
    // [String#truncate](http://api.prototypejs.org/language/String/prototype/truncate/)
    // Truncates a string to the given length and appends a suffix
    // to it (indicating that it is only an excerpt).
    // ##### Example
    //     _('A random sentence whose length exceeds 30 characters.').truncate()
    //     » "A random sentence whose len..."
    //
    //     _('Some random text').truncate(10)
    //     » "Some ra..."
    truncate: function(string, length, truncation) {
      length = length || 30;
      truncation = _.isUndefined(truncation) ? '...' : truncation;
      return string.length > length ?
        string.slice(0, length - truncation.length) + truncation : String(string);
    },
    
    // ## underscore
    // [String#underscore](http://api.prototypejs.org/language/String/prototype/underscore/)
    // Converts a camelized string into a series of words separated by an
    // underscore `_`.
    // ##### Example
    //     _('borderBottomWidth').underscore()
    //     » "border_bottom_width"
    underscore: function(string) {
      return string.replace(/::/g, '/')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        .replace(/-/g, '_')
        .toLowerCase();
    },
    
    // ## unescapeHTML
    // [String#unescapeHTML](http://api.prototypejs.org/language/String/prototype/unescapeHTML/)
    // Converts the entity forms of special HTML characters
    // to their normal form.
    // ##### Examples
    //     _("x &gt; 10").unescapeHTML()
    //     » "x > 10"
    unescapeHTML: function(string) {
      return string.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
    }
  };
  
  // ### aliases
  // `parseQuery` = `toQueryParams`
  str.parseQuery = str.toQueryParams;
  
  root._.mixin(str);
}());