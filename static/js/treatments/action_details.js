
angular.module('TreatmentsManager')
.controller('TreatmentActionDetailCtrl', function($scope, $rootScope, $routeParams){

	$scope.setupChart = function(){

		var data = google.visualization.arrayToDataTable($scope.measurement_chartdata, false);

		var container = document.getElementById('measurement_chart');

		var options = {			
			'width': container.offsetWidth,
			'height': 300,
			'pointSize': 5,
			'vAxis':{
				'title': 'Registros',
				'maxValue': 100,
				'minValue': 0
			},
			'hAxis':{
				'title': 'Días'
			},
			'animation':{
				'duration': 1000,				
			},
			'legend': {
				'position': 'none'
			}
		};

		var chart = new google.visualization.LineChart(container);
		chart.draw(data, options);
	}

	$scope.init = function(){

		$rootScope.section_title = "";

		var action_key = $routeParams.action_key;

		var request_params = {
			fulfillments_range_init : 0,
			fulfillments_range_finish : 30,
			ekey: action_key
		}

		$rootScope.api.treatment.action.get(request_params).execute(function (response) {
			
			$scope.action = new TreatmentAction(response);

			if ($scope.action.isForMeasurement){
				$rootScope.section_title = $scope.action.measurement.name

				$scope.measurement_chartdata = [['Dias', 'Registro']];

				if ($scope.action.measurement.fulfillments){
					for (var i = $scope.action.measurement.fulfillments.length - 1; i >= 0; i--) {

						$scope.measurement_chartdata[i+1] = [];
						$scope.measurement_chartdata[i+1][0] = moment($scope.action.measurement.fulfillments[i].for_moment).toDate();
						$scope.measurement_chartdata[i+1][1] = $scope.action.measurement.fulfillments[i].value*1;
					};	
				}
				
			}

			if ($scope.action.isForMedicamentTake){

			}

			$scope.$apply();

			google.load('visualization', '1.0', {'packages':['corechart'], 'language': 'es', 'callback': $scope.setupChart });	
			
		})
	}

	$scope.init();
})