$(function(){
  $("#searchButton").click(function(){
    $("#searchButton").hide();
    $("#searchForm").show();
  });
});

$(function(){
  $("#loginSignupBtn").click(function(){
    $("#loginSignupPage").show();
    $("#homePage").hide();
    $("#customerCreatePage").hide();
    $("#ownerCreatePage").hide();
  });
});

$(function(){
  $("#createCustomerBtn").click(function(){
    $("#customerCreatePage").show();
    $("#ownerCreatePage").hide();
    $("#homePage").hide();
    $("#loginSignupPage").hide();
  });
});

$(function(){
  $("#createOwnerBtn").click(function(){
    $("#ownerCreatePage").show();
    $("#customerCreatePage").hide();
    $("#homePage").hide();
    $("#loginSignupPage").hide();
  });
});
