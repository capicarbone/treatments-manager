
angular.module('TreatmentsManager')
.controller('DoctorDashboardCtrl', [ '$scope', '$rootScope', '$filter', 'TreatmentsUtils', function($scope, $rootScope, $filter, TreatmentsUtils){

	$rootScope.section_title = "Dashboard";

  $scope.chartBaseOptions = {      
    pieHole: 0.4,
    pieSliceText: 'none',
    chartArea: {
      height: "85%",
      width: "85%",
      top: 8,
      left: 100
    }

  };

  $scope.chartData = {};

  $scope.init = function(){

    $scope.treatmentsActivesCount = 0;
    $scope.porcentageAverage = 0;

    $rootScope.api.treatments.actives({ekey: $rootScope.doctor_key}).execute(function(response){

      if (response.treatments && response.treatments.length > 0 ){

        $scope.$apply(function(){

          //$scope.treatments = $filter('filter')( response.treatments, {is_sync: true});
          $scope.treatments = response.treatments;

          TreatmentsUtils.addHelpersToAll($scope.treatments);

          $scope.nHighFulfillment = $filter('filter')($scope.treatments, function(t){
            return t.highFulfillment();
          }).length;

          $scope.nLowFulfillment = $filter('filter')($scope.treatments, function(t){
            return t.lowFulfillment();
          }).length;

          $scope.nMediumFulfillment = $filter('filter')($scope.treatments, function(t){
            return t.mediumFulfillment();
          }).length;

          $scope.treatmentsActivesCount = $scope.treatments.length;  

          var sum = 0;            

          angular.forEach($scope.treatments, function(t){
            sum += t.fulfillment_porcentage;
          });  

          $scope.porcentageAverage = sum / $scope.treatments.length;
          

          $scope.chartArea = google.visualization.arrayToDataTable([
              ['Niveles de cumplimiento', 'Porcentaje'],
              ['Alto',   $scope.nHighFulfillment > 0 ? $scope.nHighFulfillment : 1],
              ['Aceptable', $scope.nMediumFulfillment],
              ['Pobre',  $scope.nLowFulfillment]      
          ]);

          $scope.chartBaseOptions.slices = {
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
                            
          console.log(response);
        });

      }else{

         $scope.chartData = google.visualization.arrayToDataTable([
                ['Niveles de cumplimiento', 'Porcentaje'],
                ['Tratamientos', 1],                
              ]);

          $scope.chartBaseOptions.slices = {
              0:{
                color: '#888'
              }
          }

          $scope.chartBaseOptions.enableInteractivity = false;
          $scope.chartBaseOptions.legend = {
            position: 'none'
          }

      };

      var chart = new google.visualization.PieChart(document.getElementById('chart'));
      chart.draw($scope.chartData, $scope.chartBaseOptions);

      })

      

      }

      $scope.init();    

}])