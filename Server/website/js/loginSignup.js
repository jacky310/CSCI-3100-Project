// send check login req
$(function () {
  $.ajax({
    type: "post",
    async: false,
    url: "/checkLogin"
  })
    .done(res => {
      if (res.isLogined == true) {
        window.location.href = "/";
      }
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err);
    });
});

// Login
$(function () {
  $("#loginForm").submit(function (e) {
    e.preventDefault();
    var form = $(this);
    var url = form.attr('action');
    var data = form.serializeArray();
    $.ajax({
      type: "POST",
      async: false,
      data: form.serialize(),
      url: url
    })
      .done(res => {
        if (res == "customerLoginSuccess" || res == "ownerLoginSuccess")
          window.location.href = "/";
        else alert(res);
      })
      .fail((jqXHR, textStatus, err) => {
        alert(err);
      });
  });
});

// Go to corresponding depend on the user click which btn
$(function () {
  $("#createCustomerBtn").click(() => {
    window.location.href = "/customer";
  });

  $("#createOwnerBtn").click(() => {
    window.location.href = "/owner";
  });
});
