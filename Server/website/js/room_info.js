function stringTranDate(s, overNight) {
  d = new Date();
  var parts = s.match(/(\d+)\-(\d+)\-(\d+)\,(\d+)\:(\d+)/);
  year = parseInt(parts[1], 10);
  month = parseInt(parts[2], 10) - 1;
  date = parseInt(parts[3], 10);
  hours = parseInt(parts[4], 10),
    minutes = parseInt(parts[5], 10);
  d.setYear(year);
  d.setMonth(month);
  d.setDate(date);
  d.setHours(hours);
  d.setMinutes(minutes);
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

  $('#bookingRecordBtn').click(() => {
    window.location.href = "/account";
  });

  $('#personalInfo').click(() => {
    window.location.href = "/account";
  });

  $("#bookBtn").unbind().click(() => {
    if (userType != 'customer') {
      alert("Please Login First");
      window.location.href = "/loginSignup";
    }
    else {
      var date = $("#bookingForm input[name='date']").val();
      if (date == '') {
        $("#bookingForm input[name='date']").addClass("is-invalid");
        $("#dateChecker").show();
      }
      else {
        var startTime = $("#bookingForm input[name='starttime']").val();
        var endTime = $("#bookingForm input[name='endtime']").val();
        var url = $("#bookingForm").attr('action');
        var overNight = false;

        var start = stringTranDate(date + "," + startTime, false);
        if (stringTranTime(endTime) <= stringTranTime(startTime)) overNight = true;
        var end = stringTranDate(date + "," + endTime, overNight);

        if (start < new Date()) {
          $("#bookingForm input[name='date']").addClass("is-invalid");
          $("#dateChecker").show();
        }
        else {
          $("#bookingForm input[name='date']").removeClass("is-invalid");;
          $("#dateChecker").hide();

          console.log(start, end);
          partyRoomId = window.location.search.substring(1);
          var numPeople = $("#bookingForm input[name='numPeople']").val();
          data = {
            booker: username,
            partyRoomId: partyRoomId.replace("id=", ""),
            start: start,
            end: end,
            numPeople: numPeople,
            starttime: startTime,
            endtime: endTime
          };
          console.log(data);

          $.ajax({
            type: "post",
            async: false,
            data: data,
            url: "/book"
          })
          .done(res=>{
            if (res == "done") {
              alert("Thank you");  
            }
          })
          .fail((jqXHR, textStatus, err) => {
            alert(err);
          });;
        }
      }
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
  var quotaMin = 0;
  var quotaMax = 0;
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
        $("#partyRoomName").text(room.party_room_name);
        $("#district").text(room.district);
        $("#address").text(room.address);
        $("#description").text(room.description);
        $("#partyRoomNumber").text(room.party_room_number);
        $("#capacity").text(room.quotaMin + " - " + room.quotaMax);
        quotaMin = room.quotaMin;
        quotaMax = room.quotaMax;
        if (photos.length == 0)
          $("#carousel").hide();
        else createCarouselContent(photos);
      }
    })
    .fail((jqXHR, textStatus, err) => {
      alert(err);
    });
  $("#numPeople").attr("value", quotaMin);
  $("#numPeople").attr("min", quotaMin);
  $("#numPeople").attr("max", quotaMax);
});

function createCarouselContent(photos) {
  var indicators = $("#indicators");
  var inner = $("#inner");
  for (let i = 0; i < photos.length; i++) {
    if (!i) {
      indicators.append("<li data-target='#carouselExampleControls' data-slide-to='" + i + "' class='active'></li>");
      inner.append("<div class='carousel-item active'>" +
        "<img class='d-block w-100' src='data:image/png;base64," + photos[i] + "' alt='" + i + "'></img>" +
        "</div>");
    }
    else {
      indicators.append("<li data-target='#carouselExampleControls' data-slide-to='" + i + "'></li>");
      inner.append("<div class='carousel-item'>" +
        "<img class='d-block w-100' src='data:image/png;base64," + photos[i] + "' alt='" + i + "'></img>" +
        "</div>");
    }
  }
}
