$(function () {
  var priceSettingNum = 1;
  $("#addPriceSettingBtn").click(() => {
    let day = $("<div class='form-group col-md-3'><label>Day: </label><select name='day' class='form-control day'><option value='Monday to Thursday' selected>Monday to Thursday</option><option value='Friday'>Friday</option><option value='Saturday'>Saturday</option><option value='Sunday'>Sunday</option></select></div>");
    let time = $("<div class='form-group col-auto'><label>Time: </label><div class='form-inline'><input name='startTime' type='time' class='form-control starttime' value='00:00'><label>&emsp;to&emsp;</label><input name='endTime' type='time' class='form-control endtime' value='00:00'></div></div>");
    let price = $("<div class='form-group col-md-3'><label>Price: </label><input name='price' type='text' class='form-control price' value='0'></div>");
    let priceSettingDetail = $("<div class='form-row priceSettingDetail'></div>");
    priceSettingDetail.append(day, time, price);

    priceSettingNum++;
    let priceSettingTitle = $("<p class='priceSettingTitle'></p>").text("Price Setting " + priceSettingNum);
    let priceSettingBlock = $("<div class='priceSettingBlock'></div>");
    priceSettingBlock.append(priceSettingTitle, priceSettingDetail);

    $("#priceSetting").append(priceSettingBlock);
  });
});

$(function () {
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
        if (res.userType == 'owner') {
          $('#userIcon').css('background-color', '#eb4934');
          userType = 'owner';
        }
        else {
          window.location.href = "/";
        }
      }
      else{
        window.location.href = "/";
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

  $("#partyRoomInfoForm").submit((e) => {
    var k = document.getElementById("district");
    var strUser = k.options[k.selectedIndex].value;
    var partyRoomName = $("#partyRoomInfoForm input[name='partyRoomName']").val();
    var partyRoomPhoneNum = $("#partyRoomInfoForm input[name='partyRoomPhoneNum']").val();
    var address = $("#partyRoomInfoForm input[name='address']").val();
    var district = strUser;
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
    for (var i = 0; i < startTimeArray.length; i++) {
      startTime.push(startTimeArray[i].value);
    }

    var endTimeArray = document.getElementsByClassName("endtime");
    var endTime = [];
    for (var i = 0; i < endTimeArray.length; i++) {
      endTime.push(endTimeArray[i].value);
    }

    var priceArray = document.getElementsByClassName("price");
    var price = [];
    for (var i = 0; i < priceArray.length; i++) {
      price.push(priceArray[i].value);
    }
    console.log(price);
    var facilities = []
    $("input:checkbox[name='facilities']:checked").each(function(){
      facilities.push($(this).val());
    });

    var price_setting = [];

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
    console.log(data);


    //For photos:
    var fd = new FormData();
    var photoTotal = document.getElementById('photos').files.length;
    for (var i = 0; i < photoTotal; i++) {
      var newName = partyRoomName + "_photo" + i;
      console.log(newName);
      fd.append("file", document.getElementById('photos').files[i], newName);
    }


    $.ajax({
      type: "POST",
      contentType: false,
      processData: false,
      async: false,
      data: fd,
      url: "/create_partyroom/uploadPhoto"
    })
    .done((res) => {
      alert(res);
      $.ajax({
        type: "POST",
        async: false,
        data: data,
        url: "/create_partyroom/create"
      }).
      done((res)=>{
        alert(res);
      });
    });
    e.preventDefault();
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
});
