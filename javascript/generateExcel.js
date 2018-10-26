function createCsv(data) {
  var csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Intervalle date:,";
      csvContent += convertDate(lastMonday);
      csvContent += " - ";
      csvContent += convertDate(lastSunday);
      csvContent += "\r\n\r\n\r\n";

      csvContent += "Conducteur,";
      csvContent += "Temps total (h),";
      csvContent += "Distance total (km),";
      csvContent += "Nombre de stop / 100km,";
      csvContent += "Coup de frein / 100km,";
      csvContent += "Ralenti - Durée,";
      csvContent += "Mode economique - Durée,";
      csvContent += "Au-delà mode eco - Durée,";
      csvContent += "Roue libre - Durée\r\n";

      for(var i in data) {
        csvContent += i +",";
        csvContent += convertTime(data[i].totalSeconds) +",";
        csvContent += data[i].totalDistance/1000 +",";
        csvContent += Math.ceil(100/(data[i].totalDistance/1000)*data[i].stopCount) +",";
        csvContent += Math.ceil(100/(data[i].totalDistance/1000)*data[i].brakeCount) +",";
        csvContent += ((data[i].idleSecond/data[i].totalSeconds)*100).toFixed(2)+",";
        csvContent += ((data[i].economySeconds/data[i].totalSeconds)*100).toFixed(2)+",";
        csvContent += ((data[i].idleSecond/data[i].lovEngineOutOfGreenAreaSeconds)*100).toFixed(2)+",";
        csvContent += ((data[i].coastingMeters/data[i].totalSeconds)*100).toFixed(2)+",";
        csvContent += "\r\n";

      }

  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
}

function convertTime(seconds) {
    var date = new Date(1970,0,1);
    date.setSeconds(seconds);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}
