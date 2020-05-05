/*
 * Javacript for the parent class for a table of art
 */

/* jshint browser: true */
/* jshint -W097 */
/* globals  buildTableTextCell */
/* exported artTable */

'use strict'

var artTable = function() {

  return {
    settings: {},

    options: function(opts) {
      this.settings = Object.assign(this.settings, opts);
    },

    debugmsg: function(message) {
      if (this.settings.debugElement) {
        var target = document.getElementById(this.settings.debugElement);
        if (target) {
          target.classList.add('UI-show');
          target.innerHTML = message;
        }
      }
    },

    buildTableHeader: function(config) {
      var obj = this;
      var row = document.createElement('DIV');
      row.classList.add('UI-table-row');
      this.settings.columns.forEach(function(data, index) {
        var title;
        var value;
        if (typeof data === 'object') {
          title = data.title;
          value = data.value;
        } else {
          title = data;
          value = data;
        }
        if (value == 'Prices')
        {
          if (obj.settings.columns[index] == 'Prices') {
            for (var price in config.pricetype) {
              if (config.pricetype[price].artist_set == '1') {
                row.appendChild(buildTableTextCell(config.pricetype[price].price));
              }
            }
          } else {
            row.appendChild(buildTableTextCell(obj.settings.columns[index]));
          }
        } else {
          row.appendChild(buildTableTextCell(title));
        }
      });
      return row;
    },

    buildTable: function() {
      this.clear();
      var root = document.getElementById(this.settings.element);
      var div = document.createElement('DIV');
      div.classList.add('UI-padding');
      var table = document.createElement('DIV');
      table.classList.add('UI-table-all');
      table.id = this.settings.element + '_table';
      div.appendChild(table);
      root.appendChild(div);
      table.innerHTML = '';
      return table;
    },

    buildPieceEntry: function(configuration, data, index) {
      var row = document.createElement('DIV');
      if (this.settings.onclick) {
        row.setAttribute('onclick', this.settings.onclick + '(' + index + ');');
      }
      row.classList.add('UI-table-row');
      var v;
      this.settings.columns.forEach(function(column) {
        var value;
        if (typeof column === 'object') {
          value = column.value;
        } else {
          value = column;
        }
        switch (value)
        {
          case 'id':
            v = index + 1;
            break;
          case 'not_for_sale':
            v = (data.not_for_sale == '1' ? 'Yes' : 'No');
            break;
          case 'charity':
            v = (data.charity == '1' ? 'Yes' : 'No');
            break;
          case 'non_tax':
            v = (data.non_tax == '1' ? 'Yes' : 'No');
            break;
          case 'Prices':
            if (data.not_for_sale == '1') {
              for (var price in configuration.pricetype) {
                if (configuration.pricetype[price].artist_set == '1') {
                  row.appendChild(buildTableTextCell('nfs'));
                }
              }
            } else {
              for (price in configuration.pricetype) {
                if (configuration.pricetype[price].artist_set == '1') {
                  row.appendChild(buildTableTextCell(data[configuration.pricetype[price].price]));
                }
              }
            }
            v = null;
            break;
          case 'Fee':
            if (data.not_for_sale == '1') {
              v = configuration['Artshow_NFSHangingFee'].value;
            } else {
              v = configuration['Artshow_HangingFee'].value;
            }
            break;
          case 'status':
            if (data.status) {
              v = data.status;
            } else {
              if (data.location) {
                v = 'Hung';
              }
              else if (parseInt(data.tag_print_count)) {
                v = 'Printed';
              } else {
                v = 'New';
              }
            }
            break;
          case 'notes':
          case 'location':
            if (data[value.toLowerCase()] == null) {
              v = '';
            } else {
              v = data[value.toLowerCase()];
            }
            break;
          default:
            v = data[value.toLowerCase()];
            break;
        }
        if (v !== null) {
          row.appendChild(buildTableTextCell(v));
        }
      });
      return row;
    },

    clear: function() {
      document.getElementById(this.settings.element).innerHTML = '';
    },

    count: function() {
      var c = 0;
      if (this.pieces && 'data' in this.pieces) {c += this.pieces.data.length;}
      return c;
    },

    piece: function(index) {
      return this.pieces.data[index];
    },
  };
}
