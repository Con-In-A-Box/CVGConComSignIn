/*
 * Javacript for the Announcements page
 */

/* jshint browser: true */
/* jshint -W097 */
/* globals apiRequest, showSpinner, hideSpinner, confirmbox, settingsTable
 */

var artshowAdminPage = (function(options) {
  'use strict';

  var settings = Object.assign(
    {
      'debug': true
    }, options);

  var configuration;

  return {
    options: function(opts) {
      settings = Object.assign(settings, opts);
    },

    debugmsg: function(message) {
      if (settings.debug) {
        var target = document.getElementById('headline_section');
        target.classList.add('UI-show');
        target.innerHTML = message;
      }
    },

    load: function() {

      new settingsTable({api: 'artshow/configuration'}).createElement();

      showSpinner();
      apiRequest('GET',
        'artshow',
        'maxResults=all')
        .then(function(response) {
          artshowAdminPage.debugmsg(response.responseText);
          var result = JSON.parse(response.responseText);
          configuration = result;

          var option = null;
          var PaymentType = document.getElementById('PaymentType');
          for (var type in configuration.paymenttype) {
            if (type != 'type') {
              option = document.createElement('option');
              option.text = configuration.paymenttype[type].payment;
              PaymentType.add(option);
            }
          }
          PaymentType.size = configuration.paymenttype.length + 1;

          var PieceType = document.getElementById('PieceType');
          for (type in configuration.piecetype) {
            if (type != 'type') {
              option = document.createElement('option');
              option.text = configuration.piecetype[type].piece;
              PieceType.add(option);
            }
          }
          PieceType.size = configuration.piecetype.length + 1;

          var ReturnMethod = document.getElementById('ReturnMethod');
          for (type in configuration.returnmethod) {
            if (type != 'type') {
              option = document.createElement('option');
              option.text = configuration.returnmethod[type].method;
              ReturnMethod.add(option);
            }
          }
          ReturnMethod.size = configuration.returnmethod.length + 1;

          var data = [];
          for (type in configuration.pricetype) {
            data[configuration.pricetype[type].position] = configuration.pricetype[type];
          }

          var PriceType = document.getElementById('PriceType');
          data.forEach(function(type) {
            option = document.createElement('option');
            option.text = type.price;
            option.value = JSON.stringify(type);
            PriceType.add(option);
          });
          PriceType.size = data.length;

          var RegQuestion = document.getElementById('RegistrationQuestion');
          for (type in configuration.registrationquestion) {
            if (type != 'type') {
              option = document.createElement('option');
              option.text = configuration.registrationquestion[type].text;
              option.value = JSON.stringify(configuration.registrationquestion[type]);
              RegQuestion.add(option);
            }
          }
          RegQuestion.size = configuration.registrationquestion.length +
             1;
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }
          artshowAdminPage.debugmsg(response.responseText);
        })
        .finally(function() {
          hideSpinner();
        });
    },

    updateSetting: function(element) {
      console.log('here');
      var id = element.id.replace(/_/g,' ');
      var type = element.type;
      var value;
      if (type == 'checkbox') {
        value = (element.checked ? '1' : '0');
      } else {
        value = element.value;
      }
      apiRequest('PUT',
        'artshow/configuration',
        'Field=' + id + '&Value=' + value)
        .then(function(response) {
          artshowAdminPage.debugmsg(response.responseText);
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }
          artshowAdminPage.debugmsg(response.responseText);
        });
    },

    updateList: function(uri, original, updated, msgFragment, targetParam) {
      var method = 'PUT';
      var type = document.getElementById(original).value;
      var target = document.getElementById(updated).value;
      var title = 'Update ' + msgFragment;
      var msg = 'Are you sure you want to change the ' + msgFragment + ' "';
      if (type == null || type == '') {
        method = 'POST';
        title = 'Add ' + msgFragment;
        msg = 'Are you sure you want to add the ' + msgFragment + ' "';
      } else {
        msg += type + '" to "';
        uri += '/' + encodeURI(type);
      }
      var param = targetParam + '=' + encodeURI(target);
      msg += target + '"?';
      confirmbox(title, msg)
        .then(function() {
          apiRequest(method, uri, param)
            .then(function(response) {
              artshowAdminPage.debugmsg(response.responseText);
              var OriginalValue = document.getElementById(original);

              if (method == 'POST') {
                var option = document.createElement('option');
                option.text = target;
                OriginalValue.add(option);
                OriginalValue.size = OriginalValue.size + 1;
              } else {
                for (var i = 0; i < OriginalValue.options.length; i++)
                {
                  if (OriginalValue.options[i].innerHTML == type) {
                    OriginalValue.options[i].innerHTML = target;
                    break;
                  }
                }
                document.getElementById(updated).value = target;
              }
            })
            .catch(function(response) {
              if (response instanceof Error) { throw response; }
              artshowAdminPage.debugmsg(response.responseText);
            });
        });
    },

    removeList: function(uri, original, updated, msgFragment) {
      var sel = document.getElementById(original);
      var type = sel.options[sel.selectedIndex].text;
      if (type != null && type != '') {
        confirmbox(
          'Remove ' + msgFragment,
          'Are you sure you want to permenantly delete the ' +
             msgFragment + ' "' + type + '"?')
          .then(function() {
            apiRequest('DELETE',
              uri + '/' + encodeURI(type),
              null)
              .then(function(response) {
                artshowAdminPage.debugmsg(response.responseText);
                var element = document.getElementById(original);
                for (var i = 0; i < element.options.length; i++)
                {
                  if (element.options[i].innerHTML == type) {
                    element.remove(i);
                    break;
                  }
                }
                document.getElementById(updated).value = null;
              })
              .catch(function(response) {
                if (response instanceof Error) { throw response; }
                artshowAdminPage.debugmsg(response.responseText);
              });
          });
      }
    },

    updatePayment: function() {
      artshowAdminPage.updateList('artshow/configuration/paymenttype',
        'PaymentType', 'new_PaymentType', 'Payment Type', 'payment');
    },

    removePayment: function() {
      artshowAdminPage.removeList('artshow/configuration/paymenttype',
        'PaymentType', 'new_PaymentType', 'Payment Type');
    },

    paymentChange: function() {
      document.getElementById('new_PaymentType').value =
        document.getElementById('PaymentType').value;
    },

    updatePiece: function() {
      artshowAdminPage.updateList('artshow/configuration/piecetype',
        'PieceType', 'new_PieceType', 'Piece Type', 'piece');
    },

    removePiece: function() {
      artshowAdminPage.removeList('artshow/configuration/piecetype',
        'PieceType', 'new_PieceType', 'Piece Type');
    },

    pieceChange: function() {
      document.getElementById('new_PieceType').value =
        document.getElementById('PieceType').value;
    },

    updateReturn: function() {
      artshowAdminPage.updateList('artshow/configuration/returnmethod',
        'ReturnMethod', 'new_ReturnMethod', 'Return Method', 'method');
    },

    removeReturn: function() {
      artshowAdminPage.removeList('artshow/configuration/returnmethod',
        'ReturnMethod', 'new_ReturnMethod', 'Return Method');
    },

    returnChange: function() {
      document.getElementById('new_ReturnMethod').value =
        document.getElementById('ReturnMethod').value;
    },

    updatePrice: function() {
      var uri = 'artshow/configuration/pricetype';
      var original = 'PriceType';
      var updated = 'new_PriceType';
      var msgFragment = 'Price Type';

      var method = 'PUT';
      var sel = document.getElementById(original);
      var type = sel.options[sel.selectedIndex].text;
      var target = document.getElementById(updated).value;
      var visible = (document.getElementById('PriceUser').checked ? '1' : '0');
      var value = '{"price":"' + target + '","artist_set":"' + visible + '"}';
      var title = 'Update ' + msgFragment;
      var msg = 'Are you sure you want to change the ' + msgFragment + ' "';
      if (type == '<New>') {
        method = 'POST';
        title = 'Add ' + msgFragment;
        msg = 'Are you sure you want to add the ' + msgFragment + ' "';
      } else {
        msg += type + '" to "';
        uri += '/' + encodeURI(type);
      }
      var param = 'price=' + encodeURI(target) + '&artist_set=' + visible;
      msg += target + '"?';
      confirmbox(title, msg)
        .then(function() {
          apiRequest(method, uri, param)
            .then(function(response) {
              artshowAdminPage.debugmsg(response.responseText);
              var OriginalValue = document.getElementById(original);

              if (method == 'POST') {
                var option = document.createElement('option');
                option.value = value;
                option.text = target;
                OriginalValue.add(option);
                OriginalValue.size = OriginalValue.size + 1;
              } else {
                for (var i = 0; i < OriginalValue.options.length; i++)
                {
                  if (OriginalValue.options[i].text == type) {
                    OriginalValue.options[i].innerHTML = target;
                    OriginalValue.options[i].value = value;
                    break;
                  }
                }
                document.getElementById(updated).value = target;
              }
            })
            .catch(function(response) {
              if (response instanceof Error) { throw response; }
              artshowAdminPage.debugmsg(response.responseText);
            });
        });
    },

    removePrice: function() {
      artshowAdminPage.removeList('artshow/configuration/pricetype',
        'PriceType', 'new_PriceType', 'Price');
    },

    priceChange: function() {
      if (document.getElementById('PriceType').value) {
        var data = JSON.parse(document.getElementById('PriceType').value);
        document.getElementById('new_PriceType').value = data.price;
        document.getElementById('PriceUser').checked = (data.artist_set == '1');
      } else {
        document.getElementById('new_PriceType').value = '';
        document.getElementById('PriceUser').checked = true;
      }
    },

    updateRegistrationQuestion: function() {
      var uri = 'artshow/configuration/registrationquestion';
      var original = 'RegistrationQuestion';
      var updated = 'new_RegistrationQuestion';
      var msgFragment = 'Registration Question';

      var method = 'PUT';
      var sel = document.getElementById(original);
      var type = sel.options[sel.selectedIndex].text;
      var target = document.getElementById(updated).value;
      var isBool = (document.getElementById('QuestionIsBoolean').checked ? '1' :
        '0');
      var value = '{"text":"' + target + '","boolean":"' + isBool +
         '"}';
      var title = 'Update ' + msgFragment;
      var msg = 'Are you sure you want to change the ' + msgFragment + ' "';

      if (type == '<New>') {
        method = 'POST';
        title = 'Add ' + msgFragment;
        msg = 'Are you sure you want to add the ' + msgFragment + ' "';
      } else {
        var data = JSON.parse(sel.value);
        msg += type + '" to "';
        uri += '/' + data.id;
      }
      var param = 'text=' + encodeURI(target) + '&boolean=' + isBool;
      msg += target + '"?';
      confirmbox(title, msg)
        .then(function() {
          apiRequest(method, uri, param)
            .then(function(response) {
              artshowAdminPage.debugmsg(response.responseText);
              var OriginalValue = document.getElementById(original);

              if (method == 'POST') {
                var option = document.createElement('option');
                option.value = value;
                option.text = target;
                OriginalValue.add(option);
                OriginalValue.size = OriginalValue.size + 1;
              } else {
                for (var i = 0; i < OriginalValue.options.length; i++)
                {
                  if (OriginalValue.options[i].text == type) {
                    OriginalValue.options[i].innerHTML = target;
                    break;
                  }
                }
                document.getElementById(updated).value = target;
              }
            })
            .catch(function(response) {
              if (response instanceof Error) { throw response; }
              artshowAdminPage.debugmsg(response.responseText);
            });
        });
    },

    removeRegistrationQuestion: function() {
      var uri = 'artshow/configuration/registrationquestion';
      var original = 'RegistrationQuestion';
      var updated = 'new_RegistrationQuestion';
      var msgFragment = 'Registration Question';

      var sel = document.getElementById(original);
      var type = sel.options[sel.selectedIndex].text;
      var data = JSON.parse(sel.value);
      if (type != null && type != '') {
        confirmbox(
          'Remove ' + msgFragment,
          'Are you sure you want to permenantly delete the ' +
             msgFragment + ' "' + type + '"?')
          .then(function() {
            apiRequest('DELETE',
              uri + '/' + data.id,
              null)
              .then(function(response) {
                artshowAdminPage.debugmsg(response.responseText);
                var element = document.getElementById(original);
                for (var i = 0; i < element.options.length; i++)
                {
                  if (element.options[i].innerHTML == type) {
                    element.remove(i);
                    break;
                  }
                }
                document.getElementById(updated).value = null;
              })
              .catch(function(response) {
                if (response instanceof Error) { throw response; }
                artshowAdminPage.debugmsg(response.responseText);
              });
          });
      }
    },

    questionChange: function() {
      if (document.getElementById('RegistrationQuestion').value) {
        var data = JSON.parse(document.getElementById(
          'RegistrationQuestion').value);
        document.getElementById('new_RegistrationQuestion').value = data.text;
        document.getElementById('QuestionIsBoolean').checked =
            (data.boolean == '1');
      } else {
        document.getElementById('new_RegistrationQuestion').value = '';
        document.getElementById('QuestionIsBoolean').checked = true;
      }
    },

    demoBidTag: function() {
      apiRequest('GET',
        'artshow/art/tag/demo',
        '', true)
        .then(function(response) {
          var file = new Blob([ response.response ],
            { type: 'application/pdf' });
          var fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        });
    }
  };
})();

if (window.addEventListener) {
  window.addEventListener('load', artshowAdminPage.load);
} else {
  window.attachEvent('onload', artshowAdminPage.load);
}
