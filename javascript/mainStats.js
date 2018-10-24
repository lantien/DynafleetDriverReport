$( document ).ready(function() {

  var from = new Date("2018-04-13T00:00:00");
  var to = new Date("2018-04-13T23:59:59");

  var token = localStorage.getItem('token');
  console.log(token);

  //getDriverData();

  function getDriverData() {
    $.ajax({
      type: "POST",
      headers: {
        "Content-Type":"application/json",
        "xmlName":"Api_ReportGetVehicleReportDataTO_1"
      },
      url: "http://localhost:8080/dynafleet/getVehicleReportDataExtended",
      data: '{"from": {"value": "'+ from.toISOString() +'"},"sessionId": {"id": "FW100FUELPERF1284161209837"},"to": {"value": "'+ to.toISOString() +'"},"vehicleId": {"id": "2000328529"}}',
      success: onSuccess,
      error: onFail
    });
  }

  function onSuccess(data) {
    console.log(data.result.dataEntries);

    var dataTab = data.result.dataEntries;

    var sumBrake = 0;
    var drivingMeters = 0;

    for(var i in dataTab) {
      //console.log(dataTab[i].brakeCount);
      sumBrake += Number(dataTab[i].brakeCount.value);
      drivingMeters += Number(dataTab[i].drivingMeters.value);
    }

    console.log(sumBrake);
    console.log(drivingMeters);
    console.log("Average brake 100km", (100/(drivingMeters/1000))*sumBrake);
  }

  

});
