$( document ).ready(function() {


  $(".form").submit(function( event ) {
    event.preventDefault();
    console.log("Submit login form !");
    const username = $("#usernameInput").val();
    const password = $("#passwordInput").val();

    localStorage.setItem('username', username);
    localStorage.setItem('password', password);

    var data = {
            gmtOffset : {value: 0},
            password: password,
            username: username
    };

    makeRequest( "Api_LoginLoginTO_1", webserverUrl+"/dynafleet/login", "POST", data,
    onSuccessLogin, onFail);

  });

  function onSuccessLogin(data) {

    localStorage.setItem('token', data.result.id);
    window.location.replace("./rapport.html");
  }

  function onFail(xhr, ajaxOptions, thrownError) {

    console.log(xhr.responseJSON);
  }

});
