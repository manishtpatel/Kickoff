// DataStore for CheckinLink
// {
//    loading: true,
//    wait: 0,
//    checkedIn: false,
//    till: 10,
//    showCheckinForm: false
// }
var CheckinLink = React.createClass({
    displayName: "CheckinLink",

    getInitialState: function () {
        return checkinDataStore.initValue;
    },
    componentDidMount: function () {
        var component = this;

        // bind event for triggering state update
        $("body").on("checkinlink_setstate", function (event, data) {
            component.setState(data);
        });

        // once component mounts get status from server
        checkinDataStore.setFromServer(false);
    },
    componentWillUnmount: function () {},
    handleClick: function (event) {
        checkinDataStore.showCheckinForm(!this.state.showCheckinForm);
    },
    render: function () {
        var buttonStyle = {
            opacity: 1
        };
        var btnClass = "btn btn-info btn-lg btn-block" + (this.state.checkedIn ? " btn-danger" : " ");
        var canCheckin = false;
        var displayMessage = "Check-in : ";
        var mapMarkerClassName = "glyphicon glyphicon-map-marker";
        var showCheckinFormStyle = {
            display: this.state.showCheckinForm ? "" : "none"
        };

        if (this.state.loading) {
            return React.createElement(
                "div",
                null,
                React.createElement(
                    "button",
                    { style: buttonStyle, type: "button", disabled: true, className: "btn btn-info btn-lg btn-block" },
                    React.createElement("span", { className: "fa fa-refresh fa-spin", "aria-hidden": "true" }),
                    " "
                )
            );
        }

        // build display message and set disabled
        if (this.state.open) {
            if (this.state.checkedIn) {
                displayMessage += "You are checked in for next " + this.state.till + " minutes";
            } else {
                canCheckin = true;

                if (this.state.wait == 0) {
                    displayMessage += "No Wait";
                } else {
                    displayMessage += this.state.wait + " Min Wait";
                }
            }
        } else {
            displayMessage += "Closed Now";
        }

        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                null,
                React.createElement(
                    "button",
                    { style: buttonStyle, type: "button", disabled: !canCheckin, onClick: this.handleClick, className: btnClass },
                    React.createElement(
                        "span",
                        { style: showCheckinFormStyle },
                        React.createElement("span", { className: "fa fa-arrow-down", "aria-hidden": "true" }),
                        "  "
                    ),
                    React.createElement("span", { className: mapMarkerClassName, "aria-hidden": "true" }),
                    " ",
                    displayMessage,
                    "  ",
                    React.createElement(
                        "span",
                        { style: showCheckinFormStyle },
                        React.createElement("span", { className: "fa fa-arrow-down", "aria-hidden": "true" }),
                        " "
                    )
                )
            ),
            React.createElement(CheckinForm, { show: this.state.showCheckinForm })
        );
    }
});

var CheckinForm = React.createClass({
    displayName: "CheckinForm",

    handleSubmit: function (event) {
        event.preventDefault();

        var formData = {
            name: React.findDOMNode(this.refs.name).value.trim(),
            email: React.findDOMNode(this.refs.email).value.trim()
        };

        checkinDataStore.newCheckin(formData);
    },
    render: function () {
        var myStyle = {
            display: this.props.show ? "" : "none",
            'padding': 10
        };

        return React.createElement(
            "div",
            { style: myStyle },
            React.createElement(
                "form",
                { onSubmit: this.handleSubmit },
                React.createElement(
                    "div",
                    { className: "form-group" },
                    React.createElement("input", { type: "text", className: "form-control", required: true, placeholder: "Full Name", ref: "name" })
                ),
                React.createElement(
                    "div",
                    { className: "form-group" },
                    React.createElement("input", { type: "email", className: "form-control", placeholder: "Enter eMail", ref: "email" })
                ),
                React.createElement(
                    "button",
                    { type: "submit", className: "btn btn-danger btn-lg" },
                    "Check-in"
                )
            )
        );
    }
});

checkinDataStore = function () {
    // initial value
    var nowValue = {
        loading: true,
        open: false,
        wait: 0,
        checkedIn: false,
        till: 0,
        showCheckinForm: false
    };

    // do update manipulation based on state and setstate
    var triggerSetState = function (loadingStill) {
        // apply rules here first
        if (!nowValue.open) {
            nowValue.showCheckinForm = false;
        }

        if (nowValue.checkedIn) {
            nowValue.showCheckinForm = false;
        }

        nowValue.loading = !!loadingStill;

        // now trigger setState with new Value
        $('body').trigger('checkinlink_setstate', nowValue);
    };

    // get value from server and setstate, optional setloading as multiple ajax may want to update it at the end only
    var setFromServer = function (laodingStill) {
        var checkinID = document.cookie.replace(/(?:(?:^|.*;\s*)checkinID\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        // load state from server here
        $.get(remoteURL + '/api/myStatus', {
            checkinID: checkinID
        }, function (data) {
            nowValue.open = data.open;
            nowValue.wait = data.wait;
            nowValue.checkedIn = data.checkedIn;
            nowValue.till = data.till;

            triggerSetState(laodingStill);
        });
    };

    // show checkin form
    var showCheckinForm = function (show) {
        nowValue.showCheckinForm = show;

        triggerSetState();
    };

    // newcheckin process
    var newCheckin = function (formData) {
        triggerSetState(true);

        $.post(remoteURL + '/api/checkin_online', formData, function (data) {
            alert('Thank you, you have been checked in');

            // add cookie so we remember him, ajax is making request to another domain so set cookie in js
            document.cookie = 'checkinID=' + data._id + '; Path=/; Expires=' + new Date(Date.now() + 999999999999);

            setFromServer(false);
        });
    };

    // every one minute update
    setInterval(setFromServer, 60000);

    return {
        // get initial value
        initValue: nowValue,
        setFromServer: setFromServer,
        showCheckinForm: showCheckinForm,
        newCheckin: newCheckin
    };
}();

// load facebook api
$(function () {
    window.fbAsyncInit = function () {
        FB.init({
            appId: fbAppID,
            xfbml: true,
            version: 'v2.3'
        });
    };
    (function (d, s, id) {
        var js,
            fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
});

// render reactjs
$(function () {
    React.render(React.createElement(CheckinLink, null), document.getElementById('checkin_button'));
});

//# sourceMappingURL=out.js.map