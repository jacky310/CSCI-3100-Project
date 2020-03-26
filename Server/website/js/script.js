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

  $("#searchNowBtn").click(function () {
    $("#mainSearchBar").slideDown("slow");
  });

  $("#mainSearchBarCloseBtn").click(function () {
    $("#mainSearchBar").slideUp("slow");;
  });

  $("#searchBtn").click(function () {
    $("html").animate({ scrollTop: $(searchResult).offset().top }, 1000);
  });
});

$(function () {
  var range = document.getElementById("priceRange");
  var output = document.getElementById("priceValue");
  output.innerHTML = "Each price / hr: $" + (range.value * (20) + 20); // Display the default slider value

  // Update the current slider value (each time you drag the slider handle)
  range.oninput = function () {
    output.innerHTML = "Each price / hr: $" + (this.value * (20) + 20);
  }
});

function login(data) {
  //this is just a sample function.
  //we will not check the login info using this simple approach.
  var username = data.username.value;
  var password = data.password.value;
  switch (username) {
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
}

function customerSignUp(data) {
  var username = data.username.value;
  var email = data.email.value;
  var password = data.password.value;
  var phone = data.phone.value;
  var customer = {
    "username": username,
    "email": email,
    "password": password,
    "phone": phone
  }
  console.log(customer);
  $.ajax({
    type: "POST",
    async: false,
    dataType: "json",
    data: customer,
    url: "/CustomerSignUp"
  });
}

function ownerSignUp(data) {
  var name = data.name.value;
  var username = data.username.value;
  var partyRoomName = data.partyRoomName.value;
  var email = data.email.value;
  var password = data.password.value;
  var phone = data.phone.value;
  var owner = {
    "name": name,
    "username": username,
    "partyRoomName": partyRoomName,
    "email": email,
    "password": password,
    "phone": phone
  }
  console.log(owner);
  $.ajax({
    type: "POST",
    async: false,
    dataType: "json",
    data: owner,
    url: "/OwnerSignUp"
  });
}
