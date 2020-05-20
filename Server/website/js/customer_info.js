$(function () {
  // check whether user logined: if userType is not customer, then will go 404 Page
  $.ajax({
    type: "post",
    async: false,
    url: "/checkLogin"
  })
    .done(res => {
      if (!res.isLogined || res.userType != "customer")
        window.location.href = "/404.html";
      else getUserInfo(res.user);
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err);
    });
  
  // logout
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
  if (window.location.hash != "") {
    $('a[href="' + window.location.hash + '"]').click();
  }
  window.scrollTo(0, 0);
});

// get customer info
function getUserInfo(username) {
  $.ajax({
    type: "post",
    async: false,
    data: "username=" + username,
    url: "/customer/info"
  })
    .done(res => {
      if (res == "notFound")
        window.location.href = "/404.html";
      else {
        $('#username').text(res.username);
        $('#email').text(res.email);
        $('#phone').text(res.phone);
        getBookings(username);
      }
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err);
    });
}

// get customer booking records
function getBookings(username) {
  $.ajax({
    type: "post",
    async: false,
    data: "username=" + username,
    url: "/customer/booking"
  })
    .done(res => {
      res.result.forEach(booking => {
        $("#bookinglist").append(
          "<tr>" +
          "<td><a href='/partyRoom?id=" + booking.room_id + "'>" + booking.room + "</td>" +
          "<td>" + booking.owner + "</td>" +
          "<td>" + booking.start + "</td>" +
          "<td>" + booking.end + "</td>" +
          "<td>" + booking.num + "</td>" +
          "</tr>");
      });
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err);
    });
}