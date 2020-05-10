$(function () {
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
    url: "/customer"
  })
    .done(res => {
      if (res == "notFound")
        window.location.href = "/404.html";
      else {
        $('#username').text(res.username);
        $('#email').text(res.email);
        $('#phone').text(res.phone);
      }
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err+"!!!");
    });

  if (window.location.hash != "") {
    $('a[href="' + window.location.hash + '"]').click();
  }
}