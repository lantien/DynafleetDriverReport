$( document ).ready(function() {

  var token = localStorage.getItem('token');
  const myDriverId = findGetParameter("driverId");

  var nbRapport = 0;
  var nbMaxRapport;

  const requestByToken = 4;

  var isFirstChunk = true;

  var tabVehicles;

  var tabRapport = [];

  var tabStats = {};

  const dataToken = {
          gmtOffset : {value: 0},
          password: localStorage.getItem('password'),
          username: localStorage.getItem('username')
  };

  var dicoDrivers = {};

  var shouldDisplay = 0;

  console.log("Page ready !");

  $("#getReport").click(function() {
    nbRapport = 0;
    getToken(getVehicles);
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

    tabVehicles = data.result.vehicleInfos;

    nbMaxRapport = tabVehicles.length;

    getRapportChunk( 0, requestByToken, tabVehicles);
  }

  function getRapportChunk(minRange, maxRange, tab) {

    getToken(function(data) {
      console.log("Range:", "[" + minRange +", "+maxRange+"]");
      for(var i = minRange; i < maxRange; i++) {

        getSingleReport( data.result.id, tab[i].vehicleId.id);
      }
    });

  }

  function getSingleReport(tmpToken, tmpVehicleId) {

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
        nbRapport+requestByToken==tabVehicles.length ?tabVehicles.length :  nbRapport+requestByToken,
        tabVehicles);
    }
  }

  function makeStats() {
    getToken(getDrivers);
    console.log("Calculatin stats...");
    console.log(tabRapport);

    for(var i in tabRapport) {

      if(typeof tabStats[tabRapport[i].driverId.id] === "undefined") {
        tabStats[tabRapport[i].driverId.id] = newTemplateData();
      }

      tabStats[tabRapport[i].driverId.id].totalSeconds += Number(tabRapport[i].unitOnSeconds.value);
      tabStats[tabRapport[i].driverId.id].coastingMeters += Number(tabRapport[i].coastingMeters.value);
      tabStats[tabRapport[i].driverId.id].lovEngineOutOfGreenAreaSeconds += Number(tabRapport[i].lovEngineOutOfGreenAreaSeconds.value);
      tabStats[tabRapport[i].driverId.id].economySeconds += Number(tabRapport[i].economySeconds.value);
      tabStats[tabRapport[i].driverId.id].idleSecond += Number(tabRapport[i].idleSeconds.value);
      tabStats[tabRapport[i].driverId.id].stopCount += Number(tabRapport[i].stopCount.value);
      tabStats[tabRapport[i].driverId.id].breakCount += Number(tabRapport[i].brakeCount.value);
      tabStats[tabRapport[i].driverId.id].totalDistance += Number(tabRapport[i].drivingMeters.value);

    }
    shouldDisplay++;
    displayDriver(shouldDisplay);

  }

  function getDrivers(data) {
    console.log("Getting drivers...");
    var data = {
      id: data.result.id
    };

    makeRequest("Api_SessionId_1", webserverUrl+"/dynafleet/getDrivers", "POST", data,
    getDicoDrivers, onFail);
  }

  function getDicoDrivers(data) {
    console.log("Creating driver table...", data);

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
    console.log("Display drivers !");

    if(shouldDisplay == 2) {
      var tableStr = '<thead>';
            tableStr += '<tr>';
              tableStr += '<th>Nom</th>';
              tableStr += '<th>Identifiant</th>';
              tableStr += '<th></th>';
            tableStr += '</tr>';
          tableStr += '</thead>';

    for (var i in dicoDrivers) {
      if(!(typeof tabStats[dicoDrivers[i].driverId] === "undefined")) {
        tableStr += '<tr>';
          tableStr += '<td>'+ dicoDrivers[i].displayName +'</td>';
          tableStr += '<td>'+ dicoDrivers[i].driverId +'</td>';
          tableStr += '<td><button type="button" class="btn btn-success rapport_button" id='+ dicoDrivers[i].driverId +'>Rapport</button></td>';
        tableStr += '</tr>';
      }
    }


    $(".dataTables_wrapper").replaceWith('<table class="dataTables_wrapper" style="width:100%; margin: 0px auto;"></table>');

    $(".dataTables_wrapper").html(tableStr);
    $('.dataTables_wrapper').DataTable();
    }
  }


  $(".data_container").on( "click", ".rapport_button", function() {
      console.log("Get rapport !", $(this).attr("id"));

      if(typeof tabStats[$(this).attr("id")] === "undefined") {
        alert("Pas de stats");
      } else {
        displayModal($(this).attr("id"));
      }

  });

  function displayModal(tmpDriverId) {
    console.log("Display modal", tmpDriverId);

    var strTab = '<table style="width:100%;">';
          strTab += '<tr>';
            strTab += '<th>Temps (s)</th>';
            strTab += '<th>'+ secondsToHms(tabStats[tmpDriverId].totalSeconds) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Distance (km)</th>';
            strTab += '<th>'+ tabStats[tmpDriverId].totalDistance/1000 +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Nombre de stop / 100km</th>';
            strTab += '<th>'+ Math.ceil(100/(tabStats[tmpDriverId].totalDistance/1000)*tabStats[tmpDriverId].stopCount) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Coup de frein / 100km</th>';
            strTab += '<th>'+ Math.ceil(100/(tabStats[tmpDriverId].totalDistance/1000)*tabStats[tmpDriverId].breakCount) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Ralenti %</th>';
            strTab += '<th>'+ ((tabStats[tmpDriverId].idleSecond/tabStats[tmpDriverId].totalSeconds)*100).toFixed(2) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Mode economique %</th>';
            strTab += '<th>'+ ((tabStats[tmpDriverId].economySeconds/tabStats[tmpDriverId].totalSeconds)*100).toFixed(2) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Au-delà mode eco %</th>';
            strTab += '<th>'+ ((tabStats[tmpDriverId].lovEngineOutOfGreenAreaSeconds/tabStats[tmpDriverId].totalSeconds)*100).toFixed(2) +'</th>';
          strTab += '</tr>';
          strTab += '<tr>';
            strTab += '<th>Regulateur de vitesse %</th>';
            strTab += '<th>'+ ((tabStats[tmpDriverId].coastingMeters/tabStats[tmpDriverId].totalDistance)*100).toFixed(2) +'</th>';
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
