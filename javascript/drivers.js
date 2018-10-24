$( document ).ready(function() {

  var token = localStorage.getItem('token');
  console.log("Ready :", token);

  getDrivers();

  function getDrivers() {

    var data = {
      id: token
    };

    makeRequest("Api_SessionId_1", webserverUrl+"/dynafleet/getDriversV2", "POST", data,
    onSuccessDrivers, onFail);
  }

  function onSuccessDrivers(data) {

      var tableStr = '<thead>';
            tableStr += '<tr>';
              tableStr += '<th>Nom</th>';
              tableStr += '<th>Identifiant tacho</th>';
              tableStr += '<th>Identifiant</th>';
              tableStr += '<th></th>';
            tableStr += '</tr>';
          tableStr += '</thead>';

    var tableauDriver = data.result.driverInfos;

    for (var i in tableauDriver) {
      tableStr += '<tr>';
        tableStr += '<td>'+ tableauDriver[i].displayName +'</td>';
        tableStr += '<td>'+ tableauDriver[i].digitalTachoCardId +'</td>';
        tableStr += '<td>'+ tableauDriver[i].driverId.id +'</td>';
        tableStr += '<td><button type="button" class="btn btn-success rapport_button" id='+ tableauDriver[i].driverId.id +'>Rapport</button></td>';
      tableStr += '</tr>';
    }


    $(".dataTables_wrapper").replaceWith('<table class="dataTables_wrapper" style="width:100%; margin: 0px auto;"></table>');

    $(".dataTables_wrapper").html(tableStr);
    $('.dataTables_wrapper').DataTable();

    console.log(data);
  }

  $(".data_container").on( "click", ".rapport_button", function() {
      console.log("Get rapport !", $(this).attr("id"));

      window.location.replace("./driverRapport.html?driverId="+$(this).attr("id"));
  });

});
