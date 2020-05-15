//check login
$(function () {
  var userType = 'guest';
  $.ajax({
    type: "post",
    async: false,
    url: "/checkLogin"
  })
    .done(res => {
      if (res.isLogined == true) {
        $('#loginSignupForm').hide();
        $('#userIcon').show();
        $('#userIcon').append(res.user.toUpperCase().charAt(0));
        $('#userName').append(res.user);
        if (res.userType == 'owner') {
          $('#partyRoom').show();
          $('#userIcon').css('background-color', '#eb4934');
          userType = 'owner';
        }
        else {
          userType = 'customer';
        }
      }
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err);
    });
  

  // check the userIcon and show sideBar
  $('#userIcon').click(() => {
    $("#sideBar").animate({
      width: "toggle"
    });
  });

  // go to see room info
  $('#partyRoom').click(() => {
    window.location.href = "/account#room";
  });

  // go to see booking record
  $('#bookingRecordBtn').click(() => {
    window.location.href = "/account#booking";
  });

  // go to see user info
  $('#personalInfo').click(() => {
    window.location.href = "/account#info";
  });

  // Logout
  $('#logoutBtn').click(() => {
    $.ajax({
      type: "post",
      async: false,
      url: "/logout"
    })
      .done(res => {
        window.location.href = "/";
      })
      .fail((jqXHR, textStatus, err) => {
        alert(err);
      });
  });
});