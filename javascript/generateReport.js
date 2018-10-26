$( document ).ready(function() {

  var token = localStorage.getItem('token');
  const myDriverId = findGetParameter("driverId");

  var nbRapport = 0;
  var nbMaxRapport;

  const requestByToken = 4;

  var isFirstChunk = true;

  var tabVehicles;

  var tabRapport = [];

  var tabStatsDrivers = {};



  const dataToken = {
          gmtOffset : {value: 0},
          password: localStorage.getItem('password'),
          username: localStorage.getItem('username')
  };

  var dicoDrivers = {};

  var shouldDisplay = 0;

  $("#getCsv").click(function() {
    createCsv(tabStatsDrivers);
  });

  $("#getReport").click(function() {


    if ((localStorage.getItem("tabStatsDrivers") != null
        && localStorage.getItem("currentWeekMonday") != null
        && localStorage.getItem("dicoDrivers") != null)
        && lastMonday == localStorage.getItem("currentWeekMonday")
        && localStorage.getItem('username') == localStorage.getItem('saveStatsUsername')) {

          dicoDrivers = JSON.parse(localStorage.getItem("dicoDrivers"));
          tabStatsDrivers = JSON.parse(localStorage.getItem("tabStatsDrivers"));
          console.log(dicoDrivers);
          console.log(tabStatsDrivers);
          shouldDisplay = 2;
          displayDriver(shouldDisplay);

    } else {

      nbRapport = 0;
      getToken(getVehicles);
    }

  });

  function getToken(onSuccess) {
    makeRequest( "Api_LoginLoginTO_1", webserverUrl+"/dynafleet/login",
    "POST", dataToken, onSuccess, onFail);
  }

  function getVehicles(data) {

    var myData = {
      id: data.result.id
    };

    makeRequest("Api_SessionId_1", webserverUrl+"/dynafleet/getVehiclesV2", "POST", myData,
    onSuccessVehicle, onFail);
  }

  function onSuccessVehicle(data) {
    console.log(data.result);

    tabVehicles = data.result.vehicleInfos;

    nbMaxRapport = tabVehicles.length;

    getRapportChunk( 0, requestByToken, tabVehicles);
  }

  function getRapportChunk(minRange, maxRange, tab) {


    getToken(function(data) {
      console.log("Range:", "[" + minRange +", "+maxRange+"]"," token:", data.result.id);
      for(var i = minRange; i < maxRange; i++) {

        getSingleReport( data.result.id, tab[i].vehicleId.id);
      }
    });

  }

  function getSingleReport(tmpToken, tmpVehicleId, rangCallBack) {

    if(isFirstChunk) {
      var objData = {
        from: {value: lastMonday},
        sessionId: {id: tmpToken},
        to: {value: midWeek},
        vehicleId: {id: tmpVehicleId}
      };

    } else {
      var objData = {
        from: {value: midWeek},
        sessionId: {id: tmpToken},
        to: {value: lastSunday},
        vehicleId: {id: tmpVehicleId}
      };

    }

    makeRequest("Api_ReportGetVehicleReportDataTO_1", webserverUrl+"/dynafleet/getVehicleReportDataExtended", "POST",
    objData,
    onSuccessReport, onFail);
  }

  function onSuccessReport(data) {

    if(data.result.hasOwnProperty('dataEntries')) {
      for(var i in data.result.dataEntries) {
        if(data.result.dataEntries[i].hasOwnProperty('driverId')) {
          tabRapport.push(data.result.dataEntries[i]);
        }
      }

    }
    nbRapport++;

    if(nbRapport == nbMaxRapport && isFirstChunk) {

      nbRapport = 0;
      isFirstChunk = false;

      getRapportChunk( nbRapport,
        nbRapport+requestByToken==tabVehicles.length ?tabVehicles.length :  nbRapport+requestByToken,
        tabVehicles);

    } else if(nbRapport == nbMaxRapport && isFirstChunk == false) {

      makeStats();

    } else if(nbRapport%requestByToken == 0) {

      getRapportChunk( nbRapport,
        nbRapport+requestByToken > tabVehicles.length ?tabVehicles.length :  nbRapport+requestByToken,
        tabVehicles);

    }
  }

  function makeStats() {
    getToken(getDrivers);

    console.log(tabRapport);

    for(var i in tabRapport) {

      if(typeof tabStatsDrivers[tabRapport[i].driverId.id] === "undefined") {
        tabStatsDrivers[tabRapport[i].driverId.id] = newTemplateData();
      }

      for(var j in tabRapport[i]) {
        if(j != 'driverId' && j != 'startTime' && j != 'endTime' && tabStatsDrivers[tabRapport[i].driverId.id].hasOwnProperty(j)) {
           tabStatsDrivers[tabRapport[i].driverId.id][j].value += Number(tabRapport[i][j].value);
        }

        if(j != 'driverId' && j != 'startTime' && j != 'endTime' && !tabStatsDrivers[tabRapport[i].driverId.id].hasOwnProperty(j)) {
           console.log("has not", j);
        }
      }

    }
    shouldDisplay++;
    displayDriver(shouldDisplay);

  }

  function getDrivers(data) {
    var data = {
      id: data.result.id
    };

    makeRequest("Api_SessionId_1", webserverUrl+"/dynafleet/getDrivers", "POST", data,
    getDicoDrivers, onFail);
  }

  function getDicoDrivers(data) {

    var driverTab = data.result.driverInfos;

    for(var i in driverTab) {
      dicoDrivers[driverTab[i].driverId.id] = {
        displayName: driverTab[i].displayName,
        driverId: driverTab[i].driverId.id
      };
    }


    shouldDisplay++;
    displayDriver(shouldDisplay);

  }

  function displayDriver(tmp) {

    if(shouldDisplay == 2) {

      if (localStorage.getItem("tabStatsDrivers") === null) {
        localStorage.setItem('tabStatsDrivers', JSON.stringify(tabStatsDrivers));
      }

      if (localStorage.getItem("currentWeekMonday") === null) {
        localStorage.setItem('currentWeekMonday', lastMonday);
      }

      if (localStorage.getItem("dicoDrivers") === null) {
        localStorage.setItem('dicoDrivers', JSON.stringify(dicoDrivers));
      }

      localStorage.setItem('saveStatsUsername', localStorage.getItem('username'));

      var tableStr = '<thead>';
            tableStr += '<tr>';
              tableStr += '<th>Nom</th>';
              tableStr += '<th>Identifiant</th>';
              tableStr += '<th></th>';
            tableStr += '</tr>';
          tableStr += '</thead>';

    for (var i in dicoDrivers) {
      //if(!(typeof tabStatsDrivers[dicoDrivers[i].driverId] === "undefined")) {
        tableStr += '<tr>';
          tableStr += '<td>'+ dicoDrivers[i].displayName +'</td>';
          tableStr += '<td>'+ dicoDrivers[i].driverId +'</td>';
          tableStr += '<td><button type="button" class="btn btn-success rapport_button" id='+ dicoDrivers[i].driverId +'>Rapport</button></td>';
        tableStr += '</tr>';
      //}
    }


    $(".dataTables_wrapper").replaceWith('<table class="dataTables_wrapper" style="width:100%; margin: 0px auto;"></table>');

    $(".dataTables_wrapper").html(tableStr);
    $('.dataTables_wrapper').DataTable();
    }

  }


  $(".data_container").on( "click", ".rapport_button", function() {

      if(typeof tabStatsDrivers[$(this).attr("id")] === "undefined") {
        alert("Pas de stats");
      } else {
        displayModal($(this).attr("id"));
      }

  });

  function displayModal(tmpDriverId) {
    var strTab = '<table style="width:100%;">';
          strTab += '<tr>';
            strTab += '<th>Temps total</th>';
            strTab += '<th>'+ secondsToHms(tabStatsDrivers[tmpDriverId].unitOnSeconds.value) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Distance (km)</th>';
            strTab += '<th>'+ tabStatsDrivers[tmpDriverId].drivingMeters.value/1000 +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Nombre de stop / 100km</th>';
            strTab += '<th>'+ Math.ceil(100/(tabStatsDrivers[tmpDriverId].drivingMeters.value/1000)*tabStatsDrivers[tmpDriverId].stopCount.value) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Coup de frein / 100km</th>';
            strTab += '<th>'+ Math.ceil(100/(tabStatsDrivers[tmpDriverId].drivingMeters.value/1000)*tabStatsDrivers[tmpDriverId].brakeCount.value) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Ralenti - Durée</th>';
            strTab += '<th>'+ ((tabStatsDrivers[tmpDriverId].idleSeconds.value/tabStatsDrivers[tmpDriverId].unitOnSeconds.value)*100).toFixed(2) +'%</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Mode economique - Durée</th>';
            strTab += '<th>'+ ((tabStatsDrivers[tmpDriverId].economySeconds.value/tabStatsDrivers[tmpDriverId].unitOnSeconds.value)*100).toFixed(2) +'%</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Au-delà mode eco - Durée</th>';
            strTab += '<th>'+ ((tabStatsDrivers[tmpDriverId].lovEngineOutOfGreenAreaSeconds.value/tabStatsDrivers[tmpDriverId].unitOnSeconds.value)*100).toFixed(2) +'%</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Roue libre - Durée</th>';
            strTab += '<th>'+ ((tabStatsDrivers[tmpDriverId].coastingMeters.value/tabStatsDrivers[tmpDriverId].drivingMeters.value)*100).toFixed(2) +'%</th>';
          strTab += '</tr>';

        strTab += '</table>';


    $("#modal_content").html(strTab);

    $('#exampleModalCenter').modal('toggle');


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
