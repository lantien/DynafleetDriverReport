$( document ).ready(function() {

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

  var nbQueryDone = 0;
  var dataArray = [];

  var token = localStorage.getItem('token');
  var myVehicleId = findGetParameter("vehicleId");

  var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
  , day = beforeOneWeek.getDay()
  , diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
  , lastMonday = new Date(beforeOneWeek.setDate(diffToMonday))
  , midWeek = new Date(beforeOneWeek.setDate(diffToMonday + 3))
  , lastSunday = new Date(beforeOneWeek.setDate(diffToMonday + 6));

  lastMonday.setHours(0,0,0,0);
  lastSunday.setHours(23,59,59,59);

  getVehicleReport( lastMonday, midWeek);
  getVehicleReport( midWeek, lastSunday);
  function getVehicleReport( firstDate, secondDate) {
    var data = {
      from: {value: firstDate},
      sessionId: {id: token},
      to: {value: secondDate},
      vehicleId: {id: myVehicleId}
    };

    makeRequest("Api_ReportGetVehicleReportDataTO_1", webserverUrl+"/dynafleet/getVehicleReportDataExtended", "POST", data,
    onSuccessReport, onFail);
  }

  function onSuccessReport(data) {
    nbQueryDone++;
    var dataTab = data.result.dataEntries;

    dataArray.push(dataTab);

    if(nbQueryDone == 2) {
      displayData();
    }
  }

  function displayData() {
    console.log("2 query done !", dataArray.length);

    for(var i in dataArray) {
      for(var j in dataArray[i]) {

        templateData.totalSeconds += Number(dataArray[i][j].unitOnSeconds.value);
        templateData.coastingMeters += Number(dataArray[i][j].coastingMeters.value);
        templateData.lovEngineOutOfGreenAreaSeconds += Number(dataArray[i][j].lovEngineOutOfGreenAreaSeconds.value);
        templateData.economySeconds += Number(dataArray[i][j].economySeconds.value);
        templateData.idleSecond += Number(dataArray[i][j].idleSeconds.value);
        templateData.stopCount += Number(dataArray[i][j].stopCount.value);
        templateData.breakCount += Number(dataArray[i][j].brakeCount.value);
        templateData.totalDistance += Number(dataArray[i][j].drivingMeters.value);
      }
    }

    console.log("STOP :", (100/templateData.totalDistance*1000)*templateData.stopCount);
    console.log("FREIN :", (100/templateData.totalDistance*1000)*templateData.breakCount);
    console.log("RALENTI :", (templateData.idleSecond/templateData.totalSeconds)*100);

    console.log(templateData);

  }

});
