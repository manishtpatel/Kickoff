// DataStore for CheckinLink
// { 
//    loading: true,
//    wait: 0,
//    checkedIn: false,
//    till: 10,
//    showCheckinForm: false
// }
var CheckinLink = React.createClass({
  getInitialState: function() {
    // set required state for loading the component
    return {
      loading: true,
      showCheckinForm: false
    };
  },
  componentDidMount: function() {
    var component = this;

    // once component mounts get status from server
    this.resetState();

    // bind events
    $("body").on("checkedin", function(data) {
      component.resetState();
      component.setState({showCheckinForm: false});
    });

    $("body").on("loading", function(data) {
      component.setState({ loading: true });
    });

    // every one minute update
    refreshWaitInterval = setInterval(function(){
      component.resetState();
    }, 60000);
  },
  componentWillUnmount: function(){
    $("body").off("checkedin");
    $("body").off("loading");
    clearInterval(refreshWaitInterval);
  },
  resetState: function(){
    var component = this;

    var checkinID = document.cookie.replace(/(?:(?:^|.*;\s*)checkinID\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    // load state from server here
    $.get(remoteURL + '/api/myStatus', { checkinID: checkinID }, function(data) {
        component.setState({ 
          loading: false,  
          open: data.open,
          wait: data.wait,
          checkedIn: data.checkedIn,
          till: data.till
        });
    });
  },
  handleClick: function(event){
    this.setState({ showCheckinForm: !this.state.showCheckinForm });
  },
  render: function() {
  	  var buttonStyle = {
  	    opacity: 1
  	  };
      var btnClass = "btn btn-info btn-lg btn-block" + ((this.state.checkedIn)? " btn-danger": " ");
      var canCheckin = false;
      var displayMessage = "Check-in : ";
      var mapMarkerClassName = "glyphicon glyphicon-map-marker";
      var showCheckinFormStyle = {
        display : ((this.state.showCheckinForm)? "" : "none")
      } 

      if(this.state.loading){
        return (
          <div>
            <button style={buttonStyle} type="button" disabled className="btn btn-info btn-lg btn-block">
              <span className="fa fa-refresh fa-spin" aria-hidden="true"></span>&nbsp;
            </button>
          </div>
        );
      }

      // build display message and set disabled
      if(this.state.open){
        if(this.state.checkedIn){
          displayMessage += "You are checked in for next " + this.state.till + " minutes"
        } else {
          canCheckin = true;

          if(this.state.wait == 0){
            displayMessage += "No Wait";
          } else {
            displayMessage += this.state.wait + " Min Wait";
          }
        }
      } else {
        displayMessage += "Closed Now";
      }
      
      return (
      	<div>
          <div>
        		<button style={buttonStyle} type="button" disabled={!canCheckin} onClick={this.handleClick} className={btnClass}>
              <span style={showCheckinFormStyle}><span className="fa fa-arrow-down" aria-hidden="true"></span>&nbsp;&nbsp;</span>
        			<span className={mapMarkerClassName} aria-hidden="true"></span>&nbsp;
        			{displayMessage}&nbsp;&nbsp;
              <span style={showCheckinFormStyle}><span className="fa fa-arrow-down" aria-hidden="true"></span>&nbsp;</span>
        		</button>
          </div>
          <CheckinForm show={this.state.showCheckinForm} />
      	</div>
    );
  }
});

var CheckinForm = React.createClass({
  handleSubmit: function(event){
    event.preventDefault();
    $('body').trigger('loading');

    var formData = {
      name: React.findDOMNode(this.refs.name).value.trim(),
      email: React.findDOMNode(this.refs.email).value.trim()
    };

    $.post(remoteURL + '/api/checkin_online_freeform', formData, function(data) {
      alert('Thank you, you have been checked in');
      
      // add cookie so we remember him, ajax is making request to another domain so set cookie in js
      document.cookie = 'checkinID=' + data._id + '; Path=/; Expires=' + new Date(Date.now() + 999999999999);

      $("body").trigger("checkedin", data);
    });
  },
  render: function() {
    var myStyle = {
      display: ((this.props.show) ? "" : "none"),
      'padding': 10
    };

    return (
      <div style={myStyle}>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <input type="text" className="form-control" required placeholder="Full Name" ref="name" />
          </div>
          <div className="form-group">
            <input type="email" className="form-control" placeholder="Enter eMail" ref="email" />
          </div>
          <button type="submit" className="btn btn-danger btn-lg">Check-in</button>
        </form>
      </div>
    );
  }
});

$(function(){
  React.render(
    <CheckinLink />,
      document.getElementById('checkin_button')
  );  
})
