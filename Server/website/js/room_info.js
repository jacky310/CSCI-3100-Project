$(function () {
    $.ajax({
        type: "post",
        async: false,
        data: window.location.search.substring(1),
        url: window.location.pathname
    })
        .done(res => {
            $("#partyRoomName").text(res.party_room_name);
            $("#district").text(res.district);
            $("#address").text(res.address);
            $("#description").text(res.description);
            $("#partyRoomNumber").text(res.party_room_number);
            $("#capacity").text(res.quotaMin + " - " + res.quotaMax);
            if (res.photos.length == 0) {
                $("#carousel").hide();
            }
            else createCarouselContent(res.photos);
        })
        .fail((jqXHR, textStatus, err) => {
            alert(err);
        });
});

function createCarouselContent(photos) {
    var indicators = $("#indicators");
    var inner = $("#inner");
    for (let i = 0; i < photos.length; i++) {
        $.ajax({
            type: "post",
            async: false,
            data: { id: photos[i] },
            url: "/partyRoom/photos"
        })
            .done(res => {
                if (!i) {
                    indicators.append("<li data-target='#carouselExampleControls' data-slide-to='" + i + "' class='active'></li>");
                    inner.append("<div class='carousel-item active'>" + createSlide(image, i) + "</div>");
                }
                else {
                    indicators.append("<li data-target='#carouselExampleControls' data-slide-to='" + i + "'></li>");
                    inner.append("<div class='carousel-item'>" + createSlide(image, i) + "</div>");
                }
            })
            .fail((jqXHR, textStatus, err) => {
                alert(err);
            });
    }
}

function createSlide(image, i) {
    return "<img class='d-block w-100' src='data:image/png;base64," + image + "' alt='" + i + "'></img>";
}