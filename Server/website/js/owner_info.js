// check login
$(function () {
  $.ajax({
    type: "post",
    async: false,
    url: "/checkLogin"
  })
    .done(res => {
      if (!res.isLogined || res.userType != "owner")
        window.location.href = "/404.html";
      else getUserInfo(res.user);
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err);
    });
});

// Logout
$(function () {
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

function getUserInfo(username) {
  $.ajax({
    type: "post",
    async: false,
    data: "username=" + username,
    url: "/owner"
  })
    .done(res => {
      if (res == "notFound")
        window.location.href = "/404.html";
      else {
        $('#companyName').text(res.companyName);
        $('#username').text(res.username);
        $('#email').text(res.email);
        $('#phone').text(res.phone);
      }
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err);
    });

    if (window.location.hash != "") {
      $('a[href="' + window.location.hash + '"]').click();
    }
}