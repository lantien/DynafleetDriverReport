$( document ).ready(function() {

  var token = localStorage.getItem('token');
  var myDriverId = findGetParameter("driverId");

  var nbRapport = 0;
  var nbMaxRapport;

  var tabStats = [];

  var from = new Date("2018-04-12T00:00:00");
  var to = new Date("2018-04-15T23:59:59");

  var testFrom = new Date("2018-04-09T00:00:00");
  var testMid = new Date("2018-04-12T00:00:00");
  var testTo = new Date("2018-04-15T23:59:59");

  var templateData = {
    breakCount: 0,
    totalDistance: 0,
    stopCount: 0,
    idleSecond: 0,
    economySeconds: 0,
    lovEngineOutOfGreenAreaSeconds: 0,
    coastingMeters: 0,
    totalSeconds: 0
  };

  console.log(token, myDriverId);

  getDriver();
  getVehicles();

  function getVehicles() {
    var data = {
      id: token
    };

    makeRequest("Api_SessionId_1", webserverUrl+"/dynafleet/getVehiclesV2", "POST", data,
    onSuccessVehicle, onFail);
  }

  function onSuccessVehicle(data) {
    var tab = data.result.vehicleInfos;

    console.log(tab.length);
    nbMaxRapport = tab.length;



    /*for(var i in tab) {

        requestMaker(tab[i], i, token);
    }*/

    nbMaxRapport = 18;
    for(var i = 0; i<18; i++) {

        requestMaker(tab[i], i, token);

    }
  }

  function getNewToken(rangeMin, rangeMax) {

    var password = localStorage.getItem('password');
    var username = localStorage.getItem('username');

    console.log(username, password);

    var data = {
            gmtOffset : {value: 0},
            password: password,
            username: username
    };

    makeRequest( "Api_LoginLoginTO_1", webserverUrl+"/dynafleet/login", "POST", data,
    function(data) {
      for(var i = rangeMin; i<rangeMax; i++) {

          requestMaker(tab[i], i, data.result.id);

      }
    }
    , function(xhr, ajaxOptions, thrownError)  {console.log("fail new token")});
  }

  function requestMaker(tab, i, newToken) {

    /*setTimeout(function() {
      makeRequest("Api_ReportGetVehicleReportDataTO_1", webserverUrl+"/dynafleet/getVehicleReportDataExtended", "POST",
      {
        from: {value: testMid},
        sessionId: {id: newToken},
        to: {value: testTo},
        vehicleId: {id: tab.vehicleId.id}
      },
      onSuccessReport, onFail);
    }, i*500);*/

    c
  }

  function onSuccessReport(data) {

    console.log(nbRapport, data);

    if(data.result.hasOwnProperty('dataEntries')) {
      tabStats.push(data.result);
    }

    nbRapport++;

    if(nbRapport == nbMaxRapport) {
      displayStats();
    }
  }

  function displayStats() {

    var myTab = tabStats[0].dataEntries;

    for(var i in myTab) {
      if(myTab[i].hasOwnProperty('driverId') && myTab[i].driverId.id == myDriverId) {
        templateData.totalSeconds += Number(myTab[i].unitOnSeconds.value);
        templateData.coastingMeters += Number(myTab[i].coastingMeters.value);
        templateData.lovEngineOutOfGreenAreaSeconds += Number(myTab[i].lovEngineOutOfGreenAreaSeconds.value);
        templateData.economySeconds += Number(myTab[i].economySeconds.value);
        templateData.idleSecond += Number(myTab[i].idleSeconds.value);
        templateData.stopCount += Number(myTab[i].stopCount.value);
        templateData.breakCount += Number(myTab[i].brakeCount.value);
        templateData.totalDistance += Number(myTab[i].drivingMeters.value);
      }

      if(i == myTab.length - 1) {
        console.log("display report !");
        displayDriverReport();
      }
    }

  }

  function displayDriverReport() {

    console.log("Display: ", templateData);

    var strTab = '<table style="width:100%;">';
          strTab += '<tr>';
            strTab += '<th>Temps (s)</th>';
            strTab += '<th>'+ secondsToHms(templateData.totalSeconds) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Distance (km)</th>';
            strTab += '<th>'+ templateData.totalDistance/1000 +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Nombre de stop / 100km</th>';
            strTab += '<th>'+ Math.ceil(100/(templateData.totalDistance/1000)*templateData.stopCount) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Coup de frein / 100km</th>';
            strTab += '<th>'+ Math.ceil(100/(templateData.totalDistance/1000)*templateData.breakCount) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Ralenti %</th>';
            strTab += '<th>'+ ((templateData.idleSecond/templateData.totalSeconds)*100).toFixed(2) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Mode economique %</th>';
            strTab += '<th>'+ ((templateData.economySeconds/templateData.totalSeconds)*100).toFixed(2) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Au-delà mode eco %</th>';
            strTab += '<th>'+ ((templateData.lovEngineOutOfGreenAreaSeconds/templateData.totalSeconds)*100).toFixed(2) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Regulateur de vitesse %</th>';
            strTab += '<th>'+ ((templateData.coastingMeters/templateData.totalDistance)*100).toFixed(2) +'</th>';
          strTab += '</tr>';

        strTab += '</table>';


    $(".dataTables_wrapper").replaceWith(strTab);
  }

  function getDriver() {

    var data = {
      driverId: {id: myDriverId},
      sessionId: {id: token}
    };

    makeRequest("Api_VADAdminGetDriverTO_1", webserverUrl+"/dynafleet/getDriver", "POST", data,
    onSuccessDriver, onFail);
  }

  function onSuccessDriver(data) {

    $("#driverName").text(data.result.firstName + " " + data.result.lastName);
  }


});

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay;
}
