function updateStatus() {
    // check login status, load in here so FB is created
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response, function() {
            // user is logged in get checkinstatus
            FB.api('/me', function(response) {
                getCheckinStatus(response, false);
            });
        }, function() {
            // if not logged in then show wait time
            showWaitTime();
        });
    });
};

// checkin clicked
function checkin() {
    // is user logged in
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response, function() {
            // user is logged in get checkinstatus
            FB.api('/me', function(response) {
                getCheckinStatus(response, true);
            });
        }, function() {
            // if not logged in then login
            alert('To Check-in, select Okay to Log in with Facebook');

            FB.login(function(response) {
                statusChangeCallback(response, function() {
                    // user logged in now checkin
                    FB.api('/me', function(response) {
                        getCheckinStatus(response, true);
                    });
                }, function() {
                    $.post(remoteURL + '/api/facebook_backedout', {});
                    // user backed out of login
                    alert("Select Okay to Log in with Facebook. Try again.");
                });
            }, {
                scope: 'public_profile, email',
                return_scopes: true
            });
        });
    });
};

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response, loggedIn, notLoggedin) {
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        if (loggedIn) loggedIn();
    } else if (response.status === 'not_authorized') {
        if (notLoggedin) notLoggedin();
        // The person is logged into Facebook, but not your app.
    } else {
        if (notLoggedin) notLoggedin();
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
    }
}

function getCheckinStatus(response, checkin) {
    // get checkedin status
    $.get(remoteURL + '/api/mecheckedin_online', response, function(data) {
        // user is already checked in?
        if (data.found) {
            // draw button as checked in
            $('#checkin').addClass('btn-danger').attr('disabled', 'disabled').html(
                "<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span> You are checked in for next " + data.till + " minutes")

            return;
        }

        // checkin needed
        if (checkin) {
            // Checkin now
            $.post(remoteURL + '/api/checkin_online', response, function(data) {
                alert('Thank you, you have been checked in')
                    // redraw checkin and repeat every minute
                getCheckinStatus(response, false);
            });

            return;
        }

        // uer is not checked in back to wait time
        showWaitTime();
    });
}

function showWaitTime() {
    $.get(remoteURL + '/api/wait', function(data) {
        if (data.wait == 0) {
            data.wait = "No Wait"
        } else if (data.wait == null) {
            data.wait = "Closed Now"
            $('#checkin').attr('disabled', 'disabled');
        } else {
            data.wait = data.wait + " Min Wait"
        }

        $('#checkin').removeClass('btn-danger').removeAttr('disabled').html("<span class='glyphicon glyphicon-map-marker' aria-hidden='true'></span> Check-in : " + data.wait)
    });
};

// load everything after jqeury and facebook init
$(function() {
    window.fbAsyncInit = function() {
        FB.init({
            appId: fbAppID,
            xfbml: true,
            version: 'v2.3'
        });

        //init at start
        updateStatus();
        // redraw checkin every 1 minute, to update wait time, change status and checkin till time
        setInterval(updateStatus, 60000);
    };
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
});
// checkin process
//  load page
//      is id logged in?
//          YES has user checked in?
//          NO, show wait
//      user click checkin
//          if user not logged in then login
//          checkin and show page and update checkin
//      TODO LATER: login to see your checkin status
