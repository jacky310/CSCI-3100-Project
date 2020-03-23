$(function(){
  $("#loginSignupBtn").click(function(){
    $("#loginSignupPage").show();
    $("#homePage").hide();
    $("#customerCreatePage").hide();
  });
});

$(function(){
  $("#createCustomerBtn").click(function(){
    $("#customerCreatePage").show();
    $("#homePage").hide();
    $("#loginSignupPage").hide();
  });
});
