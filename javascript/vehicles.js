$( document ).ready(function() {

  var token = localStorage.getItem('token');
  console.log("Ready :", token);


  getVehicles();

  function getVehicles() {
    var data = {
      id: token
    };

    makeRequest("Api_SessionId_1", webserverUrl+"/dynafleet/getVehiclesV2", "POST", data,
    onSuccessVehicle, onFail);
  }

  function onSuccessVehicle(data) {
    var tableStr = '<thead>';
          tableStr += '<tr>';
            tableStr += '<th>Nom du vehicule</th>';
            tableStr += '<th>VIN</th>';
            tableStr += '<th>Identifiant</th>';
            tableStr += '<th></th>';
          tableStr += '</tr>';
        tableStr += '</thead>';

  var tableauDriver = data.result.vehicleInfos;

  for (var i = 0; i < 25; i++) {
    tableStr += '<tr>';
      tableStr += '<td>'+ tableauDriver[i].displayName +'</td>';
      tableStr += '<td>'+ tableauDriver[i].vin +'</td>';
      tableStr += '<td>'+ tableauDriver[i].vehicleId.id +'</td>';

      tableStr += '<td><button type="button" class="btn btn-success rapport_button" id='+ tableauDriver[i].vehicleId.id +'>Rapport</button></td>';
    tableStr += '</tr>';
  }


  $(".dataTables_wrapper").replaceWith('<table class="dataTables_wrapper" style="width:100%; margin: 0px auto;"></table>');

  $(".dataTables_wrapper").html(tableStr);
  $('.dataTables_wrapper').DataTable();

  console.log(data);
  }

  $(".data_container").on( "click", ".rapport_button", function() {
      console.log("Get rapport !", $(this).attr("id"));

      window.location.replace("./truckRapport.html?vehicleId="+$(this).attr("id"));
  });
});
