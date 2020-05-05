/*
 * Javacript for the Artshow Piece Details
 */

/* jshint browser: true */
/* jshint -W097 */
/* globals apiRequest */

var artshowPiece = (function(options) {
  'use strict';

  var configuration;
  var data;
  var form;

  var settings = Object.assign(
    {
      debugElement: 'headline_section',
      readonly: false,
      fields: [{value: 'name', label: 'Piece Name'},
        'Artist',
        {value: 'medium', label: 'Medium'},
        {value: 'edition', label: 'Edition'},
        {value: 'art_type', label: 'Type'},
        {value: 'not_for_sale', label: 'Not for sale:'}, 'Prices'],
      additionalFields: null
    }, options);

  return {
    options: function(opts) {
      settings = Object.assign(settings, opts);
      if (settings.additionalFields) {
        settings.fields = settings.fields.concat(settings.additionalFields);
      }
    },

    debugmsg: function(message) {
      if (settings.debugElement) {
        var target = document.getElementById(settings.debugElement);
        target.classList.add('UI-show');
        target.innerHTML = message;
      }
    },

    load: function(config, id, eventId) {
      configuration = config;
      return new Promise(function(resolve, reject) {
        var uri = 'artshow/art/piece/' + id;
        if (eventId) {
          uri += '/' + eventId;
        }

        apiRequest('GET', uri, '')
          .then(function(response) {
            artshowPiece.debugmsg(response.responseText);
            var json = JSON.parse(response.responseText);
            artshowPiece.displayArt(json);
            resolve();
          })
          .catch(function(response) {
            if (response instanceof Error) { throw response; }
            artshowPiece.debugmsg(response.responseText);
            reject();
          });
      });
    },

    displayArt: function(input) {
      data = input;
      document.getElementById('piece_id').value = data.id;
      settings.fields.forEach(function(field) {
        var value;
        if (typeof field === 'object') {
          value = field.value;
        } else {
          value = field;
        }
        switch (value) {
          case 'Prices':
            for (var price in configuration.pricetype) {
              if (configuration.pricetype[price].artist_set == '1') {
                var id = configuration.pricetype[price].price.replace(' ','_');
                document.getElementById('piece_price_' + id).value =
                            data[configuration.pricetype[price].price];
              }
            }
            break;
          case 'Artist':
            if (data.artist.company_name_on_sheet != '0') {
              document.getElementById('piece_' + value).value =
                    data.artist.company_name;
            } else {
              document.getElementById('piece_' + value).value =
                    data.artist.member.first_name +
                    ' ' + data.artist.member.last_name;
            }
            break;
          case 'not_for_sale':
          case 'charity':
          case 'non_tax':
            document.getElementById('piece_' + value).checked =
              (data[value] == '1');
            break;
          default:
            document.getElementById('piece_' + value).value = data[value];
        }
      });
      if (!settings.readonly) {
        artshowPiece.nfsClick();
      }
    },

    scale: function() {
      var height = form.parentElement.offsetHeight;
      var fit = window.innerHeight - 100;
      if (height > fit) {
        var factor = fit / height;
        form.parentElement.style.transform = 'translate(0%, -' +
          (100 - (factor * 100)) / 2 + '%)';
        form.parentElement.style.transform += 'scale(' + factor + ')';
      } else {
        form.parentElement.style.transform = 'scale(1)';
        form.parentElement.style.transform += 'translate(0px, 0px)';
      }
    },

    nfsClick: function() {
      var nfs = document.getElementById('piece_not_for_sale');
      if (nfs.checked) {
        for (var data in configuration.pricetype) {
          if (configuration.pricetype[data].artist_set == '1') {
            var id = 'piece_price_' + configuration.pricetype[data].price.replace(' ','_');
            var element = document.getElementById(id);
            element.disabled = true;
            element.classList.add('UI-disabled');
          }
        }
      } else {
        for (data in configuration.pricetype) {
          if (configuration.pricetype[data].artist_set == '1') {
            id = 'piece_price_' + configuration.pricetype[data].price.replace(' ','_');
            element = document.getElementById(id);
            element.disabled = false;
            element.classList.remove('UI-disabled');
          }
        }
      }
    },

    populateArtTypeSelect: function(element) {
      var i = 0;
      for (var x in configuration.piecetype) {
        if (x != 'type') {
          var option = document.createElement('option');
          option.text = configuration.piecetype[x].piece;
          element.add(option);
          if (configuration.piecetype[x] == configuration['Artshow_DefaultType'].value) {
            element.selectedIndex = i;
          }
          i = i + 1;
        }
      }
    },


    buildForm: function(config, element) {
      configuration = config;
      form = document.getElementById(element);
      form.innerHTML = '';

      settings.fields.forEach(function(data) {
        var name;
        var value;
        if (typeof data === 'object') {
          name = data.label;
          value = data.value;
        } else {
          name = data;
          value = data;
        }
        if (value === 'Prices') {
          for (data in configuration.pricetype) {
            if (configuration.pricetype[data].artist_set == '1') {
              var id = 'piece_price_' + configuration.pricetype[data].price.replace(' ','_');
              var validate = 'artshowPiece.validatePrice(\'' + id + '\');';
              var input = document.createElement('INPUT');
              input.classList.add('UI-input');
              input.id = id;
              input.value = '';
              input.setAttribute('type', 'number');
              input.setAttribute('min', '1');
              input.setAttribute('onchange', validate);
              if (settings.readonly) {
                input.disabled = true;
              }
              var label = document.createElement('LABEL');
              label.classList.add('UI-label');
              label.setAttribute('for', id);
              label.innerHTML = configuration.pricetype[data].price + ':';
              form.appendChild(label);
              form.appendChild(input);
            }
          }
        } else {
          label = document.createElement('LABEL');
          label.classList.add('UI-label');
          if (settings.readonly) {
            label.disabled = true;
          }
          label.htmlFor = 'piece_' + value;
          label.innerHTML = name;
          form.appendChild(label);

          var field;
          switch (value) {
            case 'art_type':
              field = document.createElement('SELECT');
              field.classList.add('UI-select');
              if (settings.readonly) {
                field.disabled = true;
              }
              field.id = 'piece_' + value;
              field.value = '';
              form.appendChild(field);
              artshowPiece.populateArtTypeSelect(
                document.getElementById('piece_' + value));
              break;
            case 'not_for_sale':
            case 'Charity':
            case 'non_tax':
              field = document.createElement('INPUT');
              field.type = 'CHECKBOX';
              field.classList.add('UI-checkbox');
              field.classList.add('UI-margin');
              if (settings.readonly) {
                field.disabled = true;
              }
              field.id = 'piece_' + value;
              if (value === 'not_for_sale') {
                field.onclick = artshowPiece.nfsClick;
              }
              form.appendChild(field);
              form.appendChild(document.createElement('BR'));
              break;
            default:
              field = document.createElement('INPUT');
              field.classList.add('UI-input');
              if (settings.readonly || value == 'Artist') {
                field.disabled = true;
              }
              field.id = 'piece_' + value;
              field.value = '';
              form.appendChild(field);
          }
        }
      });

      var field = document.createElement('INPUT');
      field.classList.add('UI-input');
      field.classList.add('UI-hide');
      field.disabled = true;
      field.id = 'piece_id';
      field.value = '';
      form.appendChild(field);
      form.appendChild(document.createElement('BR'));
    },

    validatePrice: function(element) {
      var e = document.getElementById(element);
      e.value = Math.floor(e.value);
      if (e.value < 1) {
        e.value = 1;
      }
    },

    getPiece: function() {
      var output = {};
      output['id'] = document.getElementById('piece_id').value;
      output['event'] = data.event.id;
      output['artist'] = data.artist.id;
      output['tag_print_count'] = data.tag_print_count;

      ['name', 'medium', 'art_type', 'edition', 'charity',
        'non_tax', 'notes', 'location'].forEach(function(field) {
        if (document.getElementById('piece_' + field)) {
          output[field] = document.getElementById('piece_' + field).value;
        } else {
          output[field] = data[field];
        }
      });
      ['not_for_sale', 'charity', 'non_tax'].forEach(function(field) {
        output[field] = (document.getElementById('piece_' + field) ?
          (document.getElementById('piece_' + field).checked ? '1' : '0') :
          data[field]
        );
      });
      for (var type in configuration.pricetype) {
        if (configuration.pricetype[type].artist_set == '1') {
          var id = 'piece_price_' + configuration.pricetype[type].price.replace(' ','_');
          var name = configuration.pricetype[type].price.replace(' ','_');
          if (document.getElementById(id)) {
            output[name] = document.getElementById(id).value;
          }
        }
      }

      return output;
    },

    savePiece: function() {
      return new Promise(function(resolve, reject) {
        var object = artshowPiece.getPiece();
        var param = '';
        for (var key in object) {
          if (param != '') {
            param += '&';
          }
          param += key + '=' + encodeURIComponent(object[key]);
        }
        apiRequest('PUT', 'artshow/art/' + object.id, param)
          .then(function(response) {
            artshowPiece.debugmsg(response.responseText);
            resolve(response);
          })
          .catch(function(response) {
            if (response instanceof Error) { throw response; }
            artshowPiece.debugmsg(response.responseText);
            reject(response);
          })
      });
    },

  };
})();
