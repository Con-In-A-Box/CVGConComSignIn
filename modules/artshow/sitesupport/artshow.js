/*
 * Javacript for the Announcements page
 */

/* jshint browser: true */
/* jshint -W097 */
/* globals apiRequest, showSpinner, hideSpinner, showSidebar, hideSidebar,
           confirmbox, hungArtTable, printArtTable, artshowPiece,
           artshowPrint, printArtEntryTable, hungArtEntryTable */

var artshowPage = (function(options) {
  'use strict';

  var settings = Object.assign(
    {
      'debug': true,
      printArtEntryCount: 10
    }, options);

  var configuration;
  var artist;

  var editPieceID;

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
      showSpinner();
      apiRequest('GET',
        'artshow/',
        'maxResults=all')
        .then(function(response) {
          configuration = JSON.parse(response.responseText);

          artshowPage.initializePage();

          artshowPage.debugmsg(response.responseText);

          apiRequest('GET', 'artshow/artist', null)
            .then(function(response) {

              artshowPage.debugmsg(response.responseText);

              artist = JSON.parse(response.responseText);
              document.getElementById('company').value = artist.company_name;
              artshowPage.updateCompanyName();

              document.getElementById('use_company').checked =
                (artist.company_name_on_sheet == '1');
              document.getElementById('use_company_check').checked =
                (artist.company_name_on_payment == '1');
              document.getElementById('professional').checked =
                (artist.professional == '1');
              document.getElementById('amateur').checked =
                (artist.professional != '1');
              document.getElementById('website').value = artist.website;
              document.getElementById('artist_info_div').classList.add(
                'UI-show');
              document.getElementById('update_button').classList.add(
                'UI-show');

              apiRequest('GET', 'artshow/artist/' + artist.id + '/show',
                null)
                .then(function(response) {
                  artshowPage.debugmsg(response.responseText);

                  var data = JSON.parse(response.responseText);
                  document.getElementById('reg_mailin').checked =
                    (data.mail_in == '1');
                  artshowPage.clickMailIn();
                  document.getElementById('reg-return-type').value =
                    data.return_method;

                  for (var x in configuration.registrationquestion) {
                    if (x == 'type') {
                      continue;
                    }
                    var id = 'custom_question_' + configuration.registrationquestion[x].id;
                    if (id in data) {
                      if (configuration.registrationquestion[x].boolean == '1') {
                        document.getElementById(id).checked = (data[id] == '1');
                      } else {
                        document.getElementById(id).value = data[id];
                      }
                    }
                  }

                  if (parseInt(configuration['Artshow_SelfRegistration'].value) > 0) {
                    document.getElementById(
                      'event_register_info_div').classList.add('UI-show');
                    document.getElementById(
                      'event_register_button').classList.remove('UI-show');
                    document.getElementById(
                      'event_update_button').classList.add('UI-show');
                  } else {
                    document.getElementById('add_hung_art').classList.add(
                      'UI-hide');
                    document.getElementById('artist_tags').classList.add(
                      'UI-hide');
                    document.getElementById('add_print_art').classList.add(
                      'UI-hide');

                    artshowPiece.options({readonly:true});
                    artshowPrint.options({readonly:true});

                    var ev = document.getElementsByClassName('edit_enabled');
                    for (var i = 0, len = ev.length | 0; i < len; i = i + 1 | 0) {
                      ev[i].classList.add('UI-hide');
                    }
                  }
                  document.getElementById('art_in_show').classList.add(
                    'UI-show');
                  artshowPage.buildHungArtTables();
                  artshowPage.buildPrintArtTables();
                  artshowPiece.buildForm(configuration, 'hung_art_form');
                  artshowPrint.buildForm(configuration, 'shop_art_form');

                  hideSpinner();
                })
                .catch(function(response) {
                  if (response instanceof Error) { throw response; }
                  artshowPage.debugmsg(response.responseText);
                  if (parseInt(configuration['Artshow_SelfRegistration'].value) > 0) {
                    document.getElementById('event_register_div').classList.add(
                      'UI-show');
                  } else {
                    document.getElementById('add_hung_art').classList.add(
                      'UI-hide');
                    document.getElementById('artist_tags').classList.add(
                      'UI-hide');
                    document.getElementById('add_print_art').classList.add(
                      'UI-hide');
                  }
                  hideSpinner();
                });

            })
            .catch(function(response) {
              if (response instanceof Error) { throw response; }
              artshowPage.debugmsg(response.responseText);

              document.getElementById('register_div').classList.add('UI-show');
              hideSpinner();
            });
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }

          artshowPage.debugmsg(response.responseText);

          hideSpinner();
        });
    },

    initializePage: function() {
      var ev = document.getElementsByClassName('current_event');
      for (var i = 0, len = ev.length | 0; i < len; i = i + 1 | 0) {
        ev[i].innerHTML =  configuration['event']['name'];
      }

      if (parseInt(configuration['Artshow_SelfRegistration'].value) > 0) {
        var date = new Date(Date.parse(configuration['Artshow_OnlineCloses'].value));
        document.getElementById('close_date').innerHTML = date.toDateString();
      } else {
        document.getElementById('online_closed').classList.remove('UI-hide');
        document.getElementById('online_open').classList.add('UI-hide');
      }

      if (configuration['Artshow_PrintShop'].value == '1') {
        document.getElementById('print_shop_div').classList.add('UI-show');
      } else {
        document.getElementById('print_shop_div').classList.remove('UI-show');
      }
      var mailReturn = document.getElementById('reg-return-type');
      for (var x in configuration.returnmethod) {
        if (x == 'type') {
          continue;
        }
        var option = document.createElement('option');
        option.text = configuration.returnmethod[x].method;
        mailReturn.add(option);
      }
      var questionSection = document.getElementById('artist_event_questions');
      for (x in configuration.registrationquestion) {
        if (x == 'type') {
          continue;
        }
        var id = 'custom_question_' + configuration.registrationquestion[x].id;
        var label = document.createElement('LABEL');
        label.classList.add('UI-label');
        label.setAttribute('for', id);
        label.innerHTML = configuration.registrationquestion[x].text;

        var input = document.createElement('INPUT');
        input.classList.add('UI-margin');
        input.id = id;
        if (configuration.registrationquestion[x].boolean == '1') {
          input.setAttribute('type', 'checkbox');
          input.classList.add('UI-checkbox');
          label.classList.add('UI-padding');
          questionSection.appendChild(input);
          questionSection.appendChild(label);
          questionSection.appendChild(document.createElement('BR'));
        } else {
          input.classList.add('UI-input');
          questionSection.appendChild(label);
          questionSection.appendChild(input);
        }
      }
    },

    populateArtTypeSelect: function(element) {
      var i = 0;
      for (var x in configuration.piecetype) {
        if (configuration.piecetype[x] == 'type') {
          continue;
        }
        var option = document.createElement('option');
        option.text = configuration.piecetype[x].piece;
        element.add(option);
        if (configuration.piecetype[x].piece  == configuration['Artshow_DefaultType'].value) {
          element.selectedIndex = i;
        }
        i = i + 1;
      }
    },

    nfsClick: function(prefix) {
      var nfs = document.getElementById(prefix + '_not_for_sale');
      if (nfs.checked) {
        for (var data in configuration.pricetype) {
          if (data == 'type') {
            continue;
          }
          if (configuration.pricetype[data].artist_set == '1') {
            var id = prefix + '_price_' + configuration.pricetype[data].price.replace(' ','_');
            var element = document.getElementById(id);
            element.disabled = true;
            element.classList.add('UI-disabled');
          }
        }
      } else {
        for (data in configuration.pricetype) {
          if (data == 'type') {
            continue;
          }
          if (configuration.pricetype[data].artist_set == '1') {
            id = prefix + '_price_' + configuration.pricetype[data].price.replace(' ','_');
            element = document.getElementById(id);
            element.disabled = false;
            element.classList.remove('UI-disabled');
          }
        }
      }
    },

    addHungArt: function() {
      var max = parseInt(configuration['Artshow_DisplayLimit'].value);
      if (max < 1 || max > 20) {max = 20;}
      if (hungArtTable.artCount()) {
        max -= hungArtTable.artCount();
      }
      hungArtEntryTable.load(configuration, artist.id, max);
      document.getElementById('enter_hung').style.display = 'block';
    },

    closeHungArt: function() {
      document.getElementById('enter_hung').style.display = 'none';
    },

    addPrintArt: function() {
      printArtEntryTable.load(configuration, artist.id);
      document.getElementById('enter_printshop').style.display = 'block';
    },

    closePrintArt: function() {
      document.getElementById('enter_printshop').style.display = 'none';
    },

    clickMailIn: function() {
      if (document.getElementById('reg_mailin').checked) {
        document.getElementById('mailing_info').classList.add('UI-show');
      } else {
        document.getElementById('mailing_info').classList.remove('UI-show');
      }
    },

    updateCompanyName: function() {
      var value = document.getElementById('company').value;
      if (value == '' || value == null) {
        document.getElementById('artist_company').classList.remove('UI-show');
      } else {
        document.getElementById('artist_company').classList.add('UI-show');
      }
    },

    artistShowRegister: function() {
      document.getElementById('artist_info_div').classList.add('UI-show');
      document.getElementById('register_button').classList.add('UI-show');
      document.getElementById('register_div').classList.remove('UI-show');
    },

    artistRegister: function() {
      showSpinner();
      apiRequest('POST', 'artshow/artist')
        .then(function(response) {
          artshowPage.debugmsg(response.responseText);
          artist = JSON.parse(response.responseText);
          document.getElementById('register_button').classList.remove(
            'UI-show');
          document.getElementById('update_button').classList.add('UI-show');
          if (parseInt(configuration['Artshow_SelfRegistration'].value) > 0) {
            document.getElementById('event_register_div').classList.add(
              'UI-show');
          } else {
            document.getElementById('add_hung_art').classList.add(
              'UI-hide');
            document.getElementById('artist_tags').classList.add(
              'UI-hide');
            document.getElementById('add_print_art').classList.add(
              'UI-hide');
          }
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }
          artshowPage.debugmsg(response.responseText);
        })
        .finally(function() {
          hideSpinner();
        });
    },

    artistUpdateRegister: function() {
      showSpinner();
      var company = document.getElementById('company').value;
      var bid = (document.getElementById('use_company').checked ? 1 : 0);
      var pay = (document.getElementById('use_company_check').checked ? 1 : 0);
      var web = document.getElementById('website').value;
      var prof = (document.getElementById('professional').checked ? 1 : 0);
      apiRequest('PUT', 'artshow/artist/' + artist.id,
        'company_name=' + company +
       '&company_name_on_sheet=' + bid +
       '&company_name_on_payment=' + pay +
       '&website=' + web +
       '&professional=' + prof
      )
        .then(function(response) {
          hideSpinner();
          artshowPage.debugmsg(response.responseText);
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }
          hideSpinner();
          artshowPage.debugmsg(response.responseText);
        });
    },

    eventShowRegister: function() {
      document.getElementById('event_register_info_div').classList.add(
        'UI-show');
      document.getElementById('event_register_button').classList.add('UI-show');
      document.getElementById('event_register_div').classList.remove('UI-show');
    },

    eventRegister: function(method) {
      showSpinner();
      var mailin = (document.getElementById('reg_mailin').checked ? 1 : 0);
      var mailtype  = document.getElementById('reg-return-type').value;

      var custom = '';
      for (var x in configuration.registrationquestion) {
        if (x == 'type') {
          continue;
        }
        var id = 'custom_question_' + configuration.registrationquestion[x].id;
        var answer = '';
        if (configuration.registrationquestion[x].boolean == '1') {
          answer = (document.getElementById(id).checked ? 1 : 0);
        } else {
          answer = document.getElementById(id).value;
          if (answer == null) {
            answer = '';
          }
        }
        custom = custom + '&' + id + '=' + answer;
      }

      apiRequest(method, 'artshow/artist/' + artist.id + '/show',
        'return_method=' + mailtype +
        '&mail_in=' + mailin +
        custom)
        .then(function(response) {
          artshowPage.debugmsg(response.responseText);

          document.getElementById('art_in_show').classList.add('UI-show');
          document.getElementById('event_register_button').classList.remove(
            'UI-show');
          document.getElementById('event_update_button').classList.add(
            'UI-show');

          artshowPage.buildHungArtTables();
          artshowPage.buildPrintArtTables();
          hideSpinner();
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }
          hideSpinner();
          artshowPage.debugmsg(response.responseText);
        });
    },

    artCount: function() {
      var c = 0;
      c += hungArtTable.artCount();
      c += printArtTable.artCount();
      document.getElementById('art_count').innerHTML = c;
    },

    clearHungArtTables: function() {
      hungArtTable.clear();
      document.getElementById('art_count').innerHTML = 0;
      document.getElementById('pieces_hung').innerHTML = 0;
      document.getElementById('fee_span').classList.remove('UI-red');
      document.getElementById('fees').innerHTML = 0;
    },

    buildHungArtTables: function() {
      showSpinner();
      hungArtTable.load(configuration, artist.id)
        .then(function() {
          artshowPage.artCount();
          document.getElementById('pieces_hung').innerHTML =
            hungArtTable.artCount();
          var hangingFees = hungArtTable.hangingFees();
          document.getElementById('fees').innerHTML = hangingFees;
          if (hangingFees > 0) {
            document.getElementById('fee_span').classList.add('UI-red');
          }
        })
        .finally(function() {
          hideSpinner();
        });
    },

    submitHungArt: function() {
      showSpinner();
      hungArtEntryTable.submitArt()
        .then(function() {
          artshowPage.buildHungArtTables();
          artshowPage.closeHungArt();
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }
          artshowPage.debugmsg(response.responseText);
        })
        .finally(function() {
          hideSpinner();
        });
    },

    submitPrintArt: function() {
      showSpinner();
      printArtEntryTable.submitArt()
        .then(function() {
          artshowPage.buildPrintArtTables();
          artshowPage.closePrintArt();
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }
          artshowPage.debugmsg(response.responseText);
        })
        .finally(function() {
          hideSpinner();
        });
    },

    editPiece: function(index) {
      var data = hungArtTable.hungPiece(index);
      editPieceID = data.id;
      artshowPiece.displayArt(data);
      showSidebar('hung_art');
      artshowPiece.scale();
    },

    deletePiece: function() {
      confirmbox(
        'Confirm Removal of Piece',
        'Are you sure you want to permenantly delete this Piece?')
        .then(function() {
          showSpinner();
          apiRequest('DELETE', 'artshow/art/' + editPieceID, null)
            .finally(function() {
              artshowPage.buildHungArtTables();
              hideSidebar();
              hideSpinner();
            });
        });
    },

    savePiece: function() {
      confirmbox(
        'Confirm Update of Piece',
        'Are you sure you want to save these changes?')
        .then(function() {
          showSpinner();
          artshowPiece.savePiece()
            .then(function(response) {
              artshowPage.debugmsg(response.responseText);
              artshowPage.buildHungArtTables();
            })
            .catch(function(response) {
              if (response instanceof Error) { throw response; }
              artshowPage.debugmsg(response.responseText);
            })
            .finally(function() {
              hideSidebar();
              hideSpinner();
            });
        });
    },

    pieceBidTag: function() {
      apiRequest('GET',
        'artshow/art/tag/' + editPieceID,
        '', true)
        .then(function(response) {
          var file = new Blob([ response.response ],
            { type: 'application/pdf' });
          var fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        });
    },

    closeBidSheet: function() {
      document.getElementById('bidsheet').style.display = 'none';
    },

    editPrint: function(index) {
      var data = printArtTable.printPiece(index);

      editPieceID = data.id;
      artshowPrint.displayArt(data);
      showSidebar('shop_art');
      artshowPiece.scale();
    },

    buildPrintArtTables: function() {
      showSpinner();
      printArtTable.load(configuration, artist.id)
        .then(function() {
          artshowPage.artCount();
          document.getElementById('pieces_printshop').innerHTML =
            printArtTable.artCount();
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }
          artshowPage.debugmsg(response.responseText);
          artshowPage.artCount();
          document.getElementById('pieces_printshop').innerHTML = '0';
        });
    },

    savePrint: function() {
      confirmbox(
        'Confirm Update of Print Art Lot',
        'Are you sure you want to save these changes?')
        .then(function() {
          showSpinner();
          artshowPrint.savePiece()
            .then(function(response) {
              artshowPage.debugmsg(response.responseText);
              artshowPage.buildPrintArtTables();
            })
            .catch(function(response) {
              if (response instanceof Error) { throw response; }
              artshowPage.debugmsg(response.responseText);
            })
            .finally(function() {
              hideSidebar();
              hideSpinner();
            });
        });
    },

    deletePrint: function() {
      confirmbox(
        'Confirm Removal of Print Art Lot',
        'Are you sure you want to permenantly delete this Lot of Print Art?')
        .then(function() {
          showSpinner();
          apiRequest('DELETE', 'artshow/print/' + editPieceID, null)
            .finally(function() {
              artshowPage.buildPrintArtTables();
              hideSidebar();
              hideSpinner();
            });
        });
    },

    artistHungTags: function() {
      apiRequest('GET',
        'artshow/artist/' + artist.id + '/tags',
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
  window.addEventListener('load', artshowPage.load);
} else {
  window.attachEvent('onload', artshowPage.load);
}
