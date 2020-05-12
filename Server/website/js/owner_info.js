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

function getUserInfo(username) {
  $.ajax({
    type: "post",
    async: false,
    data: "username=" + username,
    url: "/owner/info"
  })
    .done(res => {
      if (res == "notFound")
        window.location.href = "/404.html";
      else {
        $('#companyName').text(res.companyName);
        $('#username').text(res.username);
        $('#email').text(res.email);
        $('#phone').text(res.phone);
        getPartyRoom(username);
      }
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err);
    });
}

function getPartyRoom(username) {
  $.ajax({
    type: "post",
    async: false,
    data: "username=" + username,
    url: "/owner/room"
  })
    .done(res => {
      res.result.forEach(room => {
        $("#roomlist").append(createCard(
          room.id,
          room.img,
          room.title,
          room.description,
          room.capacity,
          room.location,
          room.price
        ));
      });
      getBookings(username);
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err);
    });
}

function getBookings(username) {
  $.ajax({
    type: "post",
    async: false,
    data: "username=" + username,
    url: "/owner/booking"
  })
    .done(res => {
      res.result.forEach(booking => {
        $("#bookinglist").append(
          "<tr>" +
          "<td><a href='/partyRoom?id=" + booking.room_id + "'>" + booking.room + "</td>" +
          "<td>" + booking.customer + "</td>" +
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

function createCard(id, img, title, description, capacity, location, price) {
  let cardContainer = $("<div class='col-lg-6'></div>");
  let card = $("<div class='m-2 card'></div>");

  let cardImg = $("<img width='100%' height='300' style='object-fit:cover;' class='card-img-top'></img>");
  cardImg.attr("src", "data:image/png;base64," + img);
  cardImg.attr("alt", "Card image cap");
  cardImg.attr("width", "256px");
  cardImg.attr("height", "200px");

  let cardBody = $("<div class='card-body'></div>");

  let cardTitle = $("<h5 class='card-title'></h5>").text(title);
  let cardDescription = $("<p class='card-text crop-text-2'></p>").text(description);

  let cardDetail = $("<ul class='list-group list-group-flush'></ul>");
  let cardCapacity = $("<li class='list-group-item'></li>").text("Capacity: " + capacity);
  let cardLocation = $("<li class='list-group-item'></li>").text("Location: " + location);
  let cardPrice = $("<li class='list-group-item'></li>").text("Price: " + price);
  cardDetail.append(cardCapacity, cardLocation, cardPrice);

  let cardButton = $("<div class='card-body'><a href='/partyRoom?id=" + id + "' class='btn btn-success'>View</a></div>");
  cardBody.append(cardTitle, cardDescription, cardDetail, cardButton);
  card.append(cardImg, cardBody);
  cardContainer.append(card);

  return cardContainer;
}