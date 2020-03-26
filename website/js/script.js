$(function () {
  //store the pages to be toggled
  //add pages at the end of this array if needed
  var pages = [$("#homePage"), $("#loginSignupPage"), $("#customerCreatePage"), $("#ownerCreatePage")]

  //show the required page, hide all others
  //pages[0] is reserved for home page
  //so index should be >= 1
  function togglePages(index) {
    pages.forEach((p, i) => (i == index) ? p.show() : p.hide());
  }

  //toggle to the page depending button clicked
  $("#loginSignupBtn").click(() => togglePages(1));
  $("#createCustomerBtn").click(() => togglePages(2));
  $("#createOwnerBtn").click(() => togglePages(3));

  //show the search form
  $("#startSearchBtn").click(() => {
    $("#startSearchBtn").fadeOut("normal", () => $("#searchForm").slideDown("normal"));
    return false;
  });

  //show the search result
  $("#searchBtn").click(function () {
    $('html').animate({ scrollTop: $("#searchResult").offset().top }, 600);
    return false;
  });

  //the login function
  $("#loginBtn").click(function () {
    //this is just a sample function.
    //we will not check the login info using this simple approach.
    var email = document.getElementById("exampleInputEmail1").value;
    var password = document.getElementById("exampleInputPassword1").value;
    switch (email) {
      case "customer":
        if (password == "123456")
          window.location.href = "customer_info.html";
        else
          alert("ERROR: Incorrect password. Try again.");
        break;
      case "owner":
        if (password == "qwerty")
          window.location.href = "owner_info.html";
        else
          alert("ERROR: Incorrect password. Try again.");
        break;
      default:
        alert("ERROR: The email is not registered. Try again.");
        break;
    }
    return false;
  });
});
