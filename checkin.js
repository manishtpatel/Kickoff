// set remote API URL
// if dev mode 
if(window.location.href.indexOf('localhost') > -1)
	remoteURL = "http://localhost:1000" //dev
else
	remoteURL = "http://weyummy.azurewebsites.net" //prod

waitlistHTML = function() {
    // strap hammer
    var hammer = function() {
        var myElement = document.getElementById('admin');

        // create a simple instance
        // by default, it only adds horizontal recognizers
        var mc = new Hammer(myElement);

        var showAdmin = false;

        // listen to events...
        mc.on("press", function(ev) {
            showAdmin = true;
            $('.admin').toggle();
        });
    }()

    // update stylists count dom event hadler
    updateStylistCount = function() {
        $.get(remoteURL + '/api/ko/stylists', function(data) {
            var stylistsCount = prompt("# of stylists", data.stylists);

            if (stylistsCount) {
                $.post(remoteURL + '/api/ko/stylists', {
                    stylists: stylistsCount
                }, function(data) {
                    // remove admin mode
                    $('.admin').toggle();
                    refreshWaitList();
                });
            }
        })
    };

    // bind remove button click
    $("body").on("click", ".remove", function() {
        console.log($(this).attr('dId'));
        $.post(remoteURL + '/api/ko/takeRemove', {
            remove: true,
            take: false,
            id: $(this).attr('dId')
        }, function(data) {
            // remove admin mode
            $('.admin').toggle();
            // refresh wait list
            refreshWaitList();
        })
    });

    // bind take button click
    $("body").on("click", ".take", function() {
        console.log($(this).attr('dId'));
        $.post(remoteURL + '/api/ko/takeRemove', {
            remove: false,
            take: true,
            id: $(this).attr('dId')
        }, function(data) {
            // remove admin mode
            $('.admin').toggle();
            // refresh wait list
            refreshWaitList();
        })
    });

    // refresh wait list handler
    var refreshWaitList = function() {
        $.get(remoteURL + '/api/ko/waitlist', function(data) {
            console.log('waitlist', data);
            $('#waitlist').empty();
            if (data.wait == null) {
                data.wait = "Closed Now"
            } else if (data.wait == 0) {
                data.wait = "No Wait"
            } else {
                data.wait = data.wait + " minutes wait"
            }
            $('#wait').html(data.wait);
            data.list.forEach(function(element) {
                var canRemove = '';
                if (element.canRemove) {
                    canRemove = '<a dId="' + element._id + '" class="btn btn-danger btn-lg admin remove">Remove</a>';
                }
                $('#waitlist').append('<h1>' + element.fName + ' ' + element.lName + ' <a dId="' + element._id + '" class="btn btn-info btn-lg admin take">Take</a>&nbsp;' +
                    canRemove + '<h1/>');
            });
        });
    }

    refreshWaitList();

    // refresh waitlist every 10 seconds
    setInterval(function() {
        refreshWaitList();
    }, 10000);

    // reload page after 10 minutes, if in case of issue
    setTimeout(function() {
        location.reload();
    }, 600000);
}

checkinaddHTML = function(){
    $("form").submit(function(event) {
        $.post(remoteURL + "/api/ko/checkin_terminal", $(this).serialize(), function(data) {
            console.log('data received', data);
            if (data.success) {
                alert('Thank you for checking in');
                window.location.replace("/waitlist.html");
            } else {
                alert('You already exists in the system, please try using return customer')
                window.location.replace("/checkin.html");
            }
        });
        event.preventDefault();
    });
}

checkinselectHTML = function(){
    $("form").submit(function(event) {
        $.post(remoteURL + "/api/ko/checkin_terminal_return", $(this).serialize(), function(data) {
            console.log('data received', data);
            if (data.success) {
                alert('Thank you for checking in');
                window.location.replace("/waitlist.html");
            } else {
                alert('We can not find you in the system')
                    // window.location.replace("/checkin.html");
            }
        });
        event.preventDefault();
    });
}