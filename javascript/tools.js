const webserverUrl = "http://localhost:8080";

function makeRequest(xmlName, myUrl, method, myData, successFunc, failFunc) {
  $.ajax({
      headers: {
        "Content-Type":"application/json",
        "xmlName": xmlName
      },
      url: myUrl,
      type: method,
      data: JSON.stringify(myData),
      success: successFunc,
      error: failFunc
  });
}

function onFail(xhr, ajaxOptions, thrownError) {
  logout();
  console.log(xhr.responseJSON);
}


function logout() {
  localStorage.removeItem('token');
  window.location.replace("./index.html");
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function getPreviousMonday()
{
    var date = new Date();
    var day = date.getDay();
    var prevMonday;
    if(date.getDay() == 0){
        prevMonday = new Date().setDate(date.getDate() - 7);
    }
    else{
        prevMonday = new Date().setDate(date.getDate() - day);
    }

    return prevMonday;
}
