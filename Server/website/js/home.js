//search
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

$(function () {
  $("#searchNowBtn").click(() => $("#mainSearchBar").slideDown("slow"));

  $("#mainSearchBarCloseBtn").click(() => $("#mainSearchBar").slideUp("slow"));

  $("#priceRange").on("input", () => $("#priceValue").html("Each hour Price: $" + $("#priceRange").val() + " / person"));

  $("#searchBtn").click(function () {
    var form = $("#searchForm");
    var date = $("#searchForm input[name='date']").val();

    if (date == '') {
      $("#searchForm input[name='date']").addClass("is-invalid");
      return;
    }
    else {
      $("#searchForm input[name='date']").removeClass("is-invalid");
    }

    var currentTime = new Date();
    var starttime = $("#searchForm input[name='starttime']").val();
    var endtime = $("#searchForm input[name='endtime']").val();
    var overNight = false;

    var start = stringTranDate(date + "," + starttime, false);
    if (stringTranTime(endtime) <= stringTranTime(starttime)) overNight = true;
    var end = stringTranDate(date + "," + endtime, overNight);

    if (start < currentTime) {
      $("#searchForm input[name='starttime']").addClass("is-invalid");
      $("#searchForm input[name='date']").addClass("is-invalid");
      return;
    }
    else {
      $("#searchForm input[name='starttime']").removeClass("is-invalid");
      $("#searchForm input[name='date']").removeClass("is-invalid");
    }

    if (end < currentTime) {
      $("#searchForm input[name='endtime']").addClass("is-invalid");
      $("#searchForm input[name='date']").addClass("is-invalid");
      return;
    }
    else {
      $("#searchForm input[name='endtime']").removeClass("is-invalid");
      $("#searchForm input[name='date']").removeClass("is-invalid");
    }

    var url = form.attr('action');
    console.log(form.serialize());
    $.ajax({
      type: "GET",
      async: false,
      data: form.serialize(),
      url: url
    })
      .done(res => {
        $("#searchResult").html("");
        $("html").animate({ scrollTop: $("#scrollTo").offset().top }, 600);
        if (res.hasResult) {
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
          $("#searchResult").html("<img src='images/no-result.png' alt='Card image cap'>");
        }
      })
      .fail((jqXHR, textStatus, err) => {
        alert(err);
      });
    // e.preventDefault();
  });
});

function createCard(id, img, title, description, capacity, location, price) {
  let cardContainer = $("<div class='col-lg-4'></div>");
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

  let cardButton = $("<div class='card-body'><a href='/partyRoom?id=" + id + "' class='btn btn-success'>Book it!</a></div>");
  cardBody.append(cardTitle, cardDescription, cardDetail, cardButton);
  card.append(cardImg, cardBody);
  cardContainer.append(card);

  return cardContainer;
}
