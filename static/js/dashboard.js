
angular.module('TreatmentsManager')
.controller('DoctorDashboardCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Dashboard"

	var data = google.visualization.arrayToDataTable([
          ['Niveles de cumplimiento', 'Porcentaje'],
          ['Alto',     11],
          ['Aceptable',      2],
          ['Pobre',  2],
          
        ]);

    var options = {      
      pieHole: 0.4,
      pieSliceText: 'none',
      slices:{
        0:{
          color: '#2CA02C'
        },
        1:{
          color: '#ffcc00'
        },
        2:{
        	color: '#ff2a2a'
        }
      }

    };

    var chart = new google.visualization.PieChart(document.getElementById('chart'));
    chart.draw(data, options);



})