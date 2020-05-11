function stringTranDate(s, overNight) {
  d = new Date();
  var parts = s.match(/(\d+)\-(\d+)\-(\d+)\,(\d+)\:(\d+)/);
  d.setYear(parseInt(parts[1], 10));
  d.setMonth(parseInt(parts[2], 10) - 1);
  d.setDate(parseInt(parts[3], 10));
  d.setHours(parseInt(parts[4], 10));
  d.setMinutes(parseInt(parts[5], 10));
  d.setSeconds(0);
  if (overNight) d.setDate(d.getDate() + 1);
  return d;
}

function stringTranTime(s) {
  var parts = s.match(/(\d+)\:(\d+)/),
    hours = parseInt(parts[1], 10) * 60,
    minutes = parseInt(parts[2], 10) + hours;
  return minutes;
}

function timeTranString(t) {
  var hours = Math.floor(t / 60);
  if (hours < 10) hours = "0" + hours;
  var minutes = t % 60;
  if (minutes < 10) minutes = "0" + minutes;
  return hours + ":" + minutes;
}

//check login
$(function () {
  var userType = 'guest';
  var username = '';
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
        username = res.user;
        if (res.userType == 'owner') {
          $('#partyRoom').show();
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

  $('#partyRoom').click(() => {
    window.location.href = "/account#room";
  });

  $('#bookingRecordBtn').click(() => {
    window.location.href = "/account#booking";
  });

  $('#personalInfo').click(() => {
    window.location.href = "/account#info";
  });

  $("#bookBtn").click(() => {
    if (userType == 'guest') {
      alert("Please Login as Customer first");
      window.location.href = "/loginSignup";
    }
    else if (userType == 'owner')
      alert("Only Customer can book PartyRoom");
    else if (userType == 'customer') {
      var date = $("#bookingForm input[name='date']").val();

      if (date == '') {
        $("#bookingForm input[name='date']").addClass("is-invalid");
        $("#dateChecker").show();
        return;
      }
      else {
        $("#bookingForm input[name='date']").removeClass("is-invalid");
        $("#dateChecker").hide();
      }

      var currentTime = new Date();
      var starttime = $("#bookingForm input[name='starttime']").val();
      var endtime = $("#bookingForm input[name='endtime']").val();
      var overNight = false;

      var start = stringTranDate(date + "," + starttime, false);
      if (stringTranTime(endtime) <= stringTranTime(starttime)) overNight = true;
      var end = stringTranDate(date + "," + endtime, overNight);

      if (start < currentTime) {
        $("#bookingForm input[name='starttime']").addClass("is-invalid");
        $("#timeFromChecker").show();
        return;

      }
      else {
        $("#bookingForm input[name='starttime']").removeClass("is-invalid");
        $("#timeFromChecker").hide();
      }

      if (end < currentTime) {
        $("#bookingForm input[name='endtime']").addClass("is-invalid");
        $("#timeToChecker").show();
        return;
      }
      else {
        $("#bookingForm input[name='endtime']").removeClass("is-invalid");
        $("#timeToChecker").hide();
      }

      partyRoomId = window.location.search.substring(1);
      var numPeople = $("#bookingForm input[name='numPeople']").val();
      data = {
        booker: username,
        partyRoomId: partyRoomId.replace("id=", ""),
        start: start,
        end: end,
        numPeople: numPeople,
        starttime: starttime,
        endtime: endtime
      };
      $.ajax({
        type: "post",
        async: false,
        data: data,
        url: "/book"
      })
        .done(res => {
          if (res == "done") window.location.href = "/bookingSuccess.html";
          else if (res == "try again") $("#tryAgain").show();
        });
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

//get room info
$(function () {
  $.ajax({
    type: "post",
    async: false,
    data: window.location.search.substring(1),
    url: window.location.pathname
  })
    .done(res => {
      if (res == "notFound")
        window.location.href = "/404.html";
      else {
        var room = res.room;
        var photos = res.photos;
        var minPrice = Infinity;
        var maxPrice = -Infinity;
        $("#partyRoomName").text(room.party_room_name);
        $("#district").text(room.district);
        $("#address").text("Address : " + room.address);
        $("#description").text(room.description);
        $("#facilities").append("Facilities : " + room.facilities);
        $("#partyRoomNumber").text(room.party_room_number);
        $("#capacity").text(room.quotaMin + " - " + room.quotaMax);
        $("#numPeople").attr("value", room.quotaMin);
        $("#numPeople").attr("min", room.quotaMin);
        $("#numPeople").attr("max", room.quotaMax);
        for (let i = 0; i < room.price_setting.length; i++) {
          if (room.price_setting[i].price < minPrice) minPrice = room.price_setting[i].price;
          if (room.price_setting[i].price > maxPrice) maxPrice = room.price_setting[i].price;
          var start = timeTranString(room.price_setting[i].startTime);
          var end = timeTranString(room.price_setting[i].endTime);
          $("#price_setting").append(
            "<li class='list-group-item'>" +
            "<div>" + room.price_setting[i].day + " : " + start + " - " + end +
            "<br>" + "Price: $" + room.price_setting[i].price +
            "</div>" +
            "</li>"
          );
        }
        $("#price").text("$" + minPrice + " - " + maxPrice);
        if (photos.length == 0)
          $("#carousel").hide();
        else createCarouselContent(photos);
      }
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err);
    });
});

function createCarouselContent(photos) {
  var indicators = $("#indicators");
  var inner = $("#inner");
  for (let i = 0; i < photos.length; i++) {
    if (!i) {
      indicators.append("<li data-target='#carousel' data-slide-to='" + i + "' class='active'></li>");
      inner.append("<div class='carousel-item active'>" +
        "<img class='d-block w-100' src='data:image/png;base64," + photos[i] + "' alt='" + i + "'></img>" +
        "</div>");
    }
    else {
      indicators.append("<li data-target='#carousel' data-slide-to='" + i + "'></li>");
      inner.append("<div class='carousel-item'>" +
        "<img class='d-block w-100' src='data:image/png;base64," + photos[i] + "' alt='" + i + "'></img>" +
        "</div>");
    }
  }
}
