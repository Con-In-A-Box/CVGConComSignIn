/*
 * Javacript for the Artist page
 */

/* jshint browser: true */
/* jshint -W097 */
/* globals apiRequest, showSpinner, hideSpinner, userProfile, userLookup */

var artistPage = (function(options) {
  'use strict';

  var artists;
  var configuration;

  var settings = Object.assign(
    {
      debug: true
    }, options);

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
      apiRequest('GET',
        'artshow',
        'maxResults=all')
        .then(function(response) {
          var params = new URLSearchParams(window.location.search);
          if (params.has('accountId')) {
            var accountId = params.get('accountId');
          }
          configuration = JSON.parse(response.responseText);
          artistPage.debugmsg(response.responseText);
          artistPage.initializePage();
          artistPage.loadData(null, accountId);
        });
    },

    loadData: function(selectedIndex, accountId) {
      showSpinner();
      document.getElementById('artist_list').options.length = 0;

      apiRequest('GET',
        'artshow/artists',
        'maxResults=all')
        .then(function(response) {
          hideSpinner();
          artists = JSON.parse(response.responseText).data;
          var select = document.getElementById('artist_list');
          select.selectedIndex = -1;
          artists.forEach(function(data, index) {
            if (data !== null) {
              var name;
              if (data.company_name &&
                  data.company_name_on_sheet == '1') {
                name = data.company_name;
              } else {
                name = data.member.first_name + ' ' +
                    data.member.last_name;
              }
              var option = document.createElement('OPTION');
              option.text = name;
              option.value = index;
              select.add(option);
              if (typeof accountId !== 'undefined' &&
                  data.member.id == accountId) {
                select.selectedIndex =  index;
                artistPage.selectArtist(artists[index]);
              }
            }
          });
          if (typeof selectedIndex !== 'undefined' &&
              selectedIndex !== null) {
            select.selectedIndex =  selectedIndex;
          }
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }
          hideSpinner();
          artistPage.debugmsg(response.responseText);
        });
    },

    initializePage: function() {
      var mailReturn = document.getElementById('reg-return-type');
      for (var i in configuration.returnmethod) {
        var x = configuration.returnmethod[i];
        var option = document.createElement('option');
        option.text = x.method;
        mailReturn.add(option);
      }
      mailReturn.selectIndex = 0;
      var questionSection = document.getElementById('artist_event_questions');
      for (i in configuration.registrationquestion) {
        if (i !== 'type') {
          x = configuration.registrationquestion[i];
          var id = 'custom_question_' + x.id;
          var label = document.createElement('LABEL');
          label.classList.add('UI-label');
          label.setAttribute('for', id);
          label.innerHTML = x.text;

          var input = document.createElement('INPUT');
          input.classList.add('UI-margin');
          input.id = id;
          if (x.boolean == '1') {
            input.setAttribute('type', 'checkbox');
            input.classList.add('UI-checkbox');
            label.classList.add('UI-padding');
            input.setAttribute('onchange', 'artistPage.artistDataChange();');
            questionSection.appendChild(input);
            questionSection.appendChild(label);
            questionSection.appendChild(document.createElement('BR'));
          } else {
            input.setAttribute('onchange', 'artistPage.artistDataChange();');
            input.classList.add('UI-input');
            input.classList.add('UI-margin');
            questionSection.appendChild(label);
            questionSection.appendChild(input);
          }
        }
      }
    },

    selectArtist: function(artist) {
      if (typeof artist == 'undefined') {
        var select = document.getElementById('artist_list');
        artist = artists[select.options[select.selectedIndex].value];
      }

      artistPage.newArtist(false);

      userProfile.populate(artist.member);

      document.getElementById('company').value = artist.company_name;
      if (artist.company_name_on_payment == '1')
      {document.getElementById('use_company_check').checked = true;}
      else
      {document.getElementById('use_company_check').checked = false;}
      if (artist.company_name_on_sheet == '1')
      {document.getElementById('use_company').checked = true;}
      else
      {document.getElementById('use_company').checked = false;}
      document.getElementById('website').value = artist.website;
      if (artist.professional == '1')
      {document.getElementById('professional').checked = true;}
      else
      {document.getElementById('amateur').checked = true;}

      showSpinner();
      apiRequest('GET', 'artshow/artist/' + artist.id + '/show',
        null)
        .then(function(response) {
          document.getElementById('event_details_present').value = '1';
          artistPage.debugmsg(response.responseText);

          var data = JSON.parse(response.responseText);
          document.getElementById('reg_mailin').checked = (data.mail_in == '1');
          document.getElementById('reg-return-type').value = data.return_method;

          for (var i in configuration.registrationquestion) {
            if (i !== 'type') {
              var x = configuration.registrationquestion[i];
              var id = 'custom_question_' + x.id;
              if (id in data) {
                if (x.boolean == '1') {
                  document.getElementById(id).checked = (data[id] == '1');
                } else {
                  document.getElementById(id).value = data[id];
                }
              }
            }
          }
          hideSpinner();
          document.getElementById('artist_art').disabled = false;
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }
          artistPage.debugmsg(response.responseText);
          document.getElementById('event_details_present').value = '0';
          hideSpinner();
        });

    },

    newArtist: function(clearIndex) {
      document.getElementById('artist_art').disabled = true;
      userProfile.clear();
      if (clearIndex) {
        document.getElementById('artist_list').selectedIndex = -1;
      }
      document.getElementById('company').value = '';
      document.getElementById('use_company_check').checked = false;
      document.getElementById('use_company').checked = false;
      document.getElementById('website').value = '';
      document.getElementById('amateur').checked = true;
      document.getElementById('reg_mailin').checked = false;
      document.getElementById('reg-return-type').selectedIndex = 0;
      document.getElementById('event_details_present').value = '0';
      for (var i in configuration.registrationquestion) {
        if (i !== 'type') {
          var x = configuration.registrationquestion[i];
          var id = 'custom_question_' + x.id;
          if (x.boolean == '1') {
            document.getElementById(id).checked = false;
          } else {
            document.getElementById(id).value = '';
          }
        }
      }
      document.getElementById('save_artist_button').disabled = true;
    },

    artistDataChange: function() {
      if (userProfile.getElementById('email1').value != '' &&
            (userProfile.getElementById('firstName').value  !== '' ||
             userProfile.getElementById('lastName').value !== ''))
      {
        document.getElementById('save_artist_button').disabled = false;
      } else {
        document.getElementById('save_artist_button').disabled = true;
      }
    },

    saveArtistDetails: function(i, aid) {
      var method = 'POST';
      var uri = 'artshow/artist';
      var body = [ 'id=' + aid ];
      if (i >= 0) {
        method = 'PUT';
        uri = 'artshow/artist/' + artists[i].id;
        body = [];
      }
      var bid = (document.getElementById('use_company').checked ? 1 : 0);
      var pay =
        (document.getElementById('use_company_check').checked ? 1 : 0);
      var prof = (document.getElementById('professional').checked ? 1 : 0);
      if (document.getElementById('company').value.length > 0) {
        body.push('company_name=' +
          document.getElementById('company').value);
      }
      if (document.getElementById('website').value.length > 0) {
        body.push('website=' + document.getElementById('website').value);
      }
      body.push('website=' + document.getElementById('website').value);
      body.push('company_name_on_sheet=' + bid);
      body.push('company_name_onp_ayment=' + pay);
      body.push('professional=' + prof);
      apiRequest(method, uri, body.join('&'))
        .then(function(response) {
          body = [];
          var artist = JSON.parse(response.responseText);
          body.push('mail_in=' +
            (document.getElementById('reg_mailin').checked ? 1 : 0));
          var mailtype  = document.getElementById('reg-return-type').value;
          if (mailtype) {
            body.push('return_method=' + mailtype);
          }

          var custom = '';
          for (var i in configuration.registrationquestion) {
            if (i !== 'type') {
              var x = configuration.registrationquestion[i];
              var id = 'custom_question_' + x.id;
              var answer = '';
              if (x.boolean == '1') {
                answer = (document.getElementById(id).checked ? 1 : 0);
              } else {
                answer = document.getElementById(id).value;
                if (answer == null) {
                  answer = '';
                }
              }
              custom = custom + '&' + id + '=' + answer;
            }
          }

          if (document.getElementById('event_details_present').value == '1')
          {
            method = 'PUT';
          } else {
            method = 'POST';
          }

          apiRequest(method, 'artshow/artist/' + artist.id +
            '/show',
          body.join('&') + '&' + custom)
            .then(function() {
              artistPage.loadData(i);
            })
            .catch(function(response) {
              if (response instanceof Error) { throw response; }
            })
            .finally(function() {
              hideSpinner();
            });
        })
        .catch(function(response) {
          if (response instanceof Error) { throw response; }
          hideSpinner();
        });
    },

    saveArtist: function() {
      var i = document.getElementById('artist_list').selectedIndex;
      showSpinner();
      var data = userProfile.serializeUpdate();
      if (data.length !== 0) {
        userProfile.updateAccount()
          .then(function(response) {
            var data = JSON.parse(response.responseText);
            var aid = data.id;
            this.saveArtistDetails(i, aid);
          })
          .catch(function(response) {
            if (response instanceof Error) { throw response; }
            hideSpinner();
          });
      } else if (i >= 0) {
        this.saveArtistDetails(i, null);
      } else {
        hideSpinner();
      }
    },

    lookup: function(origin, item) {
      document.getElementById('userLookup_dropdown').classList.add('UI-hide');
      artistPage.newArtist(true);
      setTimeout(function() {
        userLookup.clear();
      }, 3000);
      var found = null;
      artists.forEach(function(artist, index) {
        if (found == null &&
            parseInt(artist.member.id) == parseInt(item.Id)) {
          document.getElementById('artist_list').selectedIndex = index;
          found = index;
        }
      });
      if (found !== null) {
        artistPage.selectArtist(artists[found]);
      } else {
        showSpinner();
        apiRequest('GET', 'member/' + item.Id, null)
          .then(function(response) {
            hideSpinner();
            var data = JSON.parse(response.responseText);
            userProfile.populate(data);
            document.getElementById('save_artist_button').disabled = false;
          })
          .catch(function(response) {
            if (response instanceof Error) { throw response; }
            artistPage.debugmsg(response.responseText);
            hideSpinner();
          });
      }
    },

    artistArt: function() {
      var i = document.getElementById('artist_list').selectedIndex;
      window.location = 'index.php?Function=artshow/art&artistId=' +
        artists[i].id;
    }

  };
})();

if (window.addEventListener) {
  window.addEventListener('load', artistPage.load);
} else {
  window.attachEvent('onload', artistPage.load);
}
