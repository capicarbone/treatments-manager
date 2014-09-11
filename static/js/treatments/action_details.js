
angular.module('TreatmentsManager')
.controller('TreatmentActionDetailCtrl', function($scope, $rootScope, $routeParams, $filter){

	$scope.setupChart = function(){

		//var data = google.visualization.arrayToDataTable($scope.measurement_chartdata, false);
		var data = new google.visualization.DataTable();
		data.addColumn('datetime', 'Dias');
		data.addColumn('number', 'Registro');

		data.addRows($scope.measurement_chartdata);

		var container = document.getElementById('measurement_chart');

		var options = {			
			'width': container.offsetWidth,
			'height': 300,
			'pointSize': 5,
			'vAxis':{
				'title': 'Registros',
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

				//$scope.measurement_chartdata = [['Dias', 'Registro']];
				$scope.measurement_chartdata = [];

				var realizeds = $filter('filter')($scope.action.measurement.fulfillments, function(f){
					return f.decision == 'T';
				})

				if (realizeds){
					for (var i = realizeds.length - 1; i >= 0; i--) {

						$scope.measurement_chartdata[i] = [];
						$scope.measurement_chartdata[i][0] = moment(realizeds[i].for_moment).toDate();
						$scope.measurement_chartdata[i][1] = realizeds[i].value*1;
					};	
				}
			
				google.load('visualization', '1.0', {'packages':['corechart'], 'language': 'es', 'callback': $scope.setupChart });		
			}

			if ($scope.action.isForMedicamentTake){

			}

			$scope.$apply();			
			
		})
	} 
	

	$scope.init();
})