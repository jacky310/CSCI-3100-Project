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

  $('#userIcon').click(() => {
    $("#sideBar").animate({
      width: "toggle"
    });
  });

  $('#favourite').click(() => {
    if (userType == 'customer') {
      window.location.href = "/customer";
    }
    else if (userType == 'owner') {
      window.location.href = "/owner";
    }
  });

  $('#bookingRecordBtn').click(() => {
    if (userType == 'customer') {
      window.location.href = "/customer";
    }
    else if (userType == 'owner') {
      window.location.href = "/owner";
    }
  });

  $('#personalInfo').click(() => {
    if (userType == 'customer') {
      window.location.href = "/customer";
    }
    else if (userType == 'owner') {
      window.location.href = "/owner";
    }
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

$(function () {
  $("#searchNowBtn").click(() => $("#mainSearchBar").slideDown("slow"));

  $("#mainSearchBarCloseBtn").click(() => $("#mainSearchBar").slideUp("slow"));

  $("#priceRange").on("input", () => $("#priceValue").html("Each hour Price: $" + $("#priceRange").val() + " / person"));

  $("#searchForm").submit(function (e) {
    var form = $(this);
    var url = form.attr('action');
    console.log(form.serialize());
    $.ajax({
      type: "GET",
      async: false,
      data: form.serialize(),
      url: url
    })
      .done(res => {
        alert("Search Success!");
        if (res.hasResult) {
          $("#searchResult").html("");
          $("html").animate({ scrollTop: $("#scrollTo").offset().top }, 600);
          res.result.forEach(room => {
            $("#searchResult").append(createCard(
              room.id,
              room.img,
              room.title,
              room.description,
              room.capacity,
              room.location,
              room.price
            ));
          });
        }
        else {
          $("#searchResult").html(
            "<img class='card-img-top' src='images/no-result.webp' alt='Card image cap' width='800px' height='600px'>");
        }
      })
      .fail((jqXHR, textStatus, err) => {
        alert(err);
      });
    e.preventDefault();
  });
});

function createCard(id, img, title, description, capacity, location, price) {
  let cardContainer = $("<div class='col-lg-4'></div>");
  let card = $("<div class='m-2 card'></div>");

  let cardImg = $("<img class='card-img-top'></img>");
  cardImg.attr("src", "data:image/png;base64," + img);
  cardImg.attr("alt", "Card image cap");
  cardImg.attr("width", "256px");
  cardImg.attr("height", "200px");

  let cardBody = $("<div class='card-body'></div>");

  let cardTitle = $("<h5 class='card-title'></h5>").text(title);
  let cardDescription = $("<p class='card-text'></p>").text(description);

  let cardDetail = $("<ul class='list-group list-group-flush'></ul>");
  let cardCapacity = $("<li class='list-group-item'></li>").text("Capacity: " + capacity);
  let cardLocation = $("<li class='list-group-item'></li>").text("Location: " + location);
  let cardPrice = $("<li class='list-group-item'></li>").text("Price: " + price);
  cardDetail.append(cardCapacity, cardLocation, cardPrice);

  let cardButton = $("<div class='card-body'><a href='/partyRoom?id=" + id + "' class='btn btn-success'>Book it!</a></div>");

  cardBody.append(cardTitle, cardDescription, cardDetail, cardButton);
  card.append(cardImg, cardBody);
  cardContainer.append(card);

  return cardContainer;
}
