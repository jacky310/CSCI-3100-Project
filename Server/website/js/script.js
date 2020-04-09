$(function () {
  //store the pages to be toggled
  //add pages at the end of this array if needed
  var pages = [$("#homePage"), $("#loginSignupPage"), $("#customerCreatePage"), $("#ownerCreatePage"), $("#signupSuccessPage")];

  //show the required page, hide all others
  //pages[0] is reserved for home page
  // so index should be >= 1
  function togglePages(index) {
    pages.forEach((p, i) => (i == index) ? p.show() : p.hide());
  }

  //toggle to the page depending button clicked
  $("#loginSignupBtn").click(() => togglePages(1));
  $("#createCustomerBtn").click(() => togglePages(2));
  $("#createOwnerBtn").click(() => togglePages(3));

  $("#searchNowBtn").click(() => $("#mainSearchBar").slideDown("slow"));

  $("#mainSearchBarCloseBtn").click(() => $("#mainSearchBar").slideUp("slow"));

  $("#priceRange").on("input", () => $("#priceValue").html("Price: $" + $("#priceRange").val() + " / person"));

  $("#searchForm").submit(function (e) {
    var form = $(this);
    var url = form.attr('action');
    $.ajax({
      type: "GET",
      async: false,
      data: form.serialize(),
      url: url
    })
      .done(res => {
        alert(res);
        if (res == "SearchSuccess") {
          $("html").animate({ scrollTop: $(searchResult).offset().top }, 600);
        }
      })
      .fail((jqXHR, textStatus, err) => {
        alert(err);
      });
    e.preventDefault();
  });

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

  $("#customerSignUpForm").submit(function (e) {
    var form = $(this);
    var url = form.attr('action');
    $.ajax({
      type: "POST",
      async: false,
      data: form.serialize(),
      url: url
    })
      .done(res => {
        alert(res);
        if (res == "SignupSuccess") {
          togglePages(4);
        }
        form[0].reset();
      })
      .fail((jqXHR, textStatus, err) => {
        alert(err);
        form[0].reset();
      });
    e.preventDefault();
  });

  $("#ownerSignUpForm").submit(function (e) {
    var form = $(this);
    var url = form.attr('action');
    $.ajax({
      type: "POST",
      async: false,
      data: form.serialize(),
      url: url
    })
      .done(res => {
        alert(res);
        if (res == "SignupSuccess") {
          togglePages(4);
        }
        form[0].reset();
      })
      .fail((jqXHR, textStatus, err) => {
        alert(err);
        form[0].reset();
      });
    e.preventDefault();
  });
});