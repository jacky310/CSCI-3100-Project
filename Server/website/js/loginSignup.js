$(function () {
  $("#loginForm").submit(function (e) {
    var form = $(this);
    var url = form.attr('action');
    $.ajax({
      type: "POST",
      async: false,
      data: form.serialize(),
      url: url
    })
      .done(res => {
        alert("LoginSuccess");
        if (res =="CustomerLoginSuccess")
          window.location.href = "customer_info.html";
        else if (res =="OwnerLoginSuccess")
          window.location.href = "owner_info.html";
      })
      .fail((jqXHR, textStatus, err) => {
        alert(err);
      });
    e.preventDefault();
  });
});

$(function () {
  $("#createCustomerBtn").click(() =>{
    window.location.href = "/customerSignup";
  });
});

$(function () {
  $("#createOwnerBtn").click(() =>{
    window.location.href = "/ownerSignup";
  });
});
