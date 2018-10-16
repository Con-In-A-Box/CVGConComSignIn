/*
 * Javacript for the Dropdown sections
 */

/* jshint browser: true */
/* jshint -W097 */

function expandSection(id) {
  var x = document.getElementById(id);
  var y = document.getElementById(id + '_arrow');
  if (x.className.indexOf('w3-show') == -1) {
    x.className += ' w3-show';
    y.className = 'fa fa-caret-up';
  } else {
    x.className = x.className.replace(' w3-show', '');
    y.className = 'fa fa-caret-down';
  }

}