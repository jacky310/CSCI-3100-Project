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
                $("#partyRoomName").text(room.party_room_name);
                $("#district").text(room.district);
                $("#address").text(room.address);
                $("#description").text(room.description);
                $("#partyRoomNumber").text(room.party_room_number);
                $("#capacity").text(room.quotaMin + " - " + room.quotaMax);
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
            indicators.append("<li data-target='#carouselExampleControls' data-slide-to='" + i + "' class='active'></li>");
            inner.append("<div class='carousel-item active'>" +
                "<img class='d-block w-100' src='data:image/png;base64," + image +
                "' alt='" + i + "'></img></div>");
        }
        else {
            indicators.append("<li data-target='#carouselExampleControls' data-slide-to='" + i + "'></li>");
            inner.append("<div class='carousel-item'>" +
                "<img class='d-block w-100' src='data:image/png;base64," + image +
                "' alt='" + i + "'></img></div>");
        }
    }
}

function createSlide(image, i) {
    return;
}