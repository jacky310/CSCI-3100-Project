$(function () {
  var priceSettingNum = 1;
  // add price setting for the creating party room form 
  $("#addPriceSettingBtn").click(() => {
    let day = $("<div class='form-group col-md-3'><label>Day: </label><select name='day' class='form-control day'><option value='Monday to Thursday' selected>Monday to Thursday</option><option value='Friday'>Friday</option><option value='Saturday'>Saturday</option><option value='Sunday'>Sunday</option></select></div>");
    let time = $("<div class='form-group col-auto'><label>Time: </label><div class='form-inline timeSetting'><input name='startTime' type='time' class='form-control starttime' value='08:00'><label>&emsp;to&emsp;</label><input name='endTime' type='time' class='form-control endtime' value='12:00'></div></div>");
    let price = $("<div class='form-group col-md-3'><label>Price: </label><input name='price' type='text' class='form-control price' value='0'></div>");
    let priceSettingDetail = $("<div class='form-row priceSettingDetail'></div>");
    priceSettingDetail.append(day, time, price);

    priceSettingNum++;
    let priceSettingTitle = $("<p class='priceSettingTitle'></p>").text("Price Setting " + priceSettingNum);
    let priceSettingBlock = $("<div class='priceSettingBlock'></div>");
    priceSettingBlock.append(priceSettingTitle, priceSettingDetail);

    $("#priceSetting").append(priceSettingBlock);
  });

  // show the map of the address which user have inputed
  $('#address').on('change', function () {
    if ($(this).val() != '') {
      $('#addressMap').show();
      $('#addressMap').attr("src", "https://www.google.com/maps/embed/v1/place?key=AIzaSyC7xcCJQ_UttAhR4MxsHau0pb4joskoAEg&q=" + $(this).val());
    }
    else {
      $('#addressMap').slideUp();
    }
  });
});

// Submit new party room info to server
$(function () {
  $("#partyRoomInfoForm").submit((e) => {
    var start = 0;
    var end = 0;
    // get price setting data
    for (var i = 0; i < $(".timeSetting").length; i++) {
      start = $(".timeSetting").eq(i).children(".starttime").val();
      end = $(".timeSetting").eq(i).children(".endtime").val();
      start = stringTranTime(start);
      end = stringTranTime(end);
    }
    // validation: the starttime should smaller than the end
    if (end <= start) alert("Price setting endTime should not be bigger than the start time.");
    else {
      // Get data form the form
      var partyRoomName = $("#partyRoomInfoForm input[name='partyRoomName']").val();
      var partyRoomPhoneNum = $("#partyRoomInfoForm input[name='partyRoomPhoneNum']").val();
      var address = $("#partyRoomInfoForm input[name='address']").val();

      var k = document.getElementById("district");
      var district = k.options[k.selectedIndex].value;

      var partyRoomDescr = $("#partyRoomDescr").val();
      var quotaLimitMin = $("#partyRoomInfoForm input[name='quotaLimitMin']").val();
      var quotaLimitMax = $("#partyRoomInfoForm input[name='quotaLimitMax']").val();
      var dayArray = document.getElementsByClassName("day");
      var day = [];
      for (var i = 0; i < dayArray.length; i++) {
        day.push(dayArray[i].options[dayArray[i].selectedIndex].value);
      }

      var startTimeArray = document.getElementsByClassName("starttime");
      var startTime = [];
      for (var i = 0; i < startTimeArray.length; i++)
        startTime.push(stringTranTime(startTimeArray[i].value));

      var endTimeArray = document.getElementsByClassName("endtime");
      var endTime = [];
      for (var i = 0; i < endTimeArray.length; i++)
        endTime.push(stringTranTime(endTimeArray[i].value));

      var priceArray = document.getElementsByClassName("price");
      var price = [];
      for (var i = 0; i < priceArray.length; i++)
        price.push(priceArray[i].value);

      var facilities = [];
      $("input:checkbox[name='facilities']:checked").each(function () {
        facilities.push($(this).val());
      });

      // create party room json
      var data = {
        party_room_name: partyRoomName,
        party_room_number: partyRoomPhoneNum,
        address: address,
        district: district,
        description: partyRoomDescr,
        quotaMin: parseInt(quotaLimitMin),
        quotaMax: parseInt(quotaLimitMax),
        day: JSON.stringify(day),
        startTime: JSON.stringify(startTime),
        endTime: JSON.stringify(endTime),
        price: JSON.stringify(price),
        facilities: JSON.stringify(facilities)
      }

      //init the photo data
      var fd = new FormData();
      var photoTotal = document.getElementById('photos').files.length;
      for (var i = 0; i < photoTotal; i++) {
        var newName = partyRoomName + "_photo" + i;
        console.log(newName);
        // add photo data to fd( form data )
        fd.append("file", document.getElementById('photos').files[i], newName);
      }

      // There are 2 steps for create the party room
      // Step 1: send the party room photo to server and save photo data on db
      $.ajax({
        type: "POST",
        contentType: false,
        processData: false,
        async: false,
        data: fd,
        url: "/create_partyroom/uploadPhoto"
      })
        .done((res) => {
          // Step 2: Server save new party room info with the photo data object id which created on step 1
          $.ajax({
            type: "POST",
            async: false,
            data: data,
            url: "/create_partyroom/create"
          })
            .done(res => {
              window.location.href = "/create" + res + ".html";
            })
            .fail((jqXHR, textStatus, err) => {
              alert(err);
            });
        })
        .fail((jqXHR, textStatus, err) => {
          alert(err);
        });
    }
    e.preventDefault();
  });
});

// Tran "HH:MM" to mins
function stringTranTime(s) {
  var parts = s.match(/(\d+)\:(\d+)/),
    hours = parseInt(parts[1], 10) * 60,
    minutes = parseInt(parts[2], 10) + hours;
  return minutes;
}
