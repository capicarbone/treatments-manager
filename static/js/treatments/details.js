
angular.module('TreatmentsManager')
.controller('TreatmentDetailCtrl', function($scope, $rootScope, $routeParams){

	$rootScope.section_title = "Tratamiento"

	$scope.treatment = {}
	$scope.patient = {}

	$scope.diaryFulfillments = {};

	$scope.setupChart = function (){
		console.log("Charts Loaded");

		var data = google.visualization.arrayToDataTable($scope.diary_fulfillments_chartdata, false);

		var container = document.getElementById('diary_fulfillment_chart');

		var options = {			
			'width': container.offsetWidth,
			'height': 300,
			'pointSize': 5,
			'vAxis':{
				'title': '% Cumplimiento',
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

		var actions = $scope.treatment.actions;

		for (var i = actions.length - 1; i >= 0; i--) {
			var action = actions[i];

			if ( action.isForMeasurement ){
				container = document.getElementById(action.id);
				var plain_data = [['Dia','Valor']];

				if (action.measurement.chart_data.points && action.measurement.chart_data.points.length > 0){
					for (var j = action.measurement.chart_data.points.length - 1; j >= 0; j--) {
						data_point = action.measurement.chart_data.points[j];

						plain_data[j+1] = [];
						plain_data[j+1][0] = Date(data_point.tag);
						plain_data[j+1][1] = data_point.value;
					};				

					var data = google.visualization.arrayToDataTable(plain_data, false);	

					var options = {
						'width': container.offsetWidth,
						'height': 130,		
						'pointSize': 4,
						'axisTitlesPosition': 'none',
						'hAxis': {
							'textStyle': 'none',
							'viewWindowMode': 'maximized',
							'textPosition': 'none'
						},
						'vAxis': {
							'textStyle': 'none',
							'viewWindowMode': 'pretty'
						},
						'legend': {'position': 'none'}
					}

					var chart = new google.visualization.LineChart(container);
					chart.draw(data, options);	
				}			
				
			}
			
		};

	}

	$scope.init = function(){

		var treatment_key = $routeParams.treatment_key

		$rootScope.api.treatment.details({ekey: treatment_key}).execute(function(response){

			$scope.treatment = new Treatment(response.treatment);
			$scope.patient = new Patient(response.patient);

			var actions = $scope.treatment.actions;

			for (i = 0; i < actions.length; i++){
				$scope.treatment.actions[i] = new TreatmentAction(actions[i]);
			}

			$scope.$apply();

			$rootScope.api.treatment.diary_fulfillments({ekey: treatment_key}).execute(function(response){			

				if (!angular.isUndefined(response) && !angular.isUndefined(response.diary_fulfillments)){
					var diary_fulfillments_chartdata = [['Dia', 'Cumplimiento']];

					$scope.diaryFulfillments = response.diary_fulfillments;

					for (var i = response.diary_fulfillments.length - 1; i >= 0; i--) {

						response.diary_fulfillments[i] = new DiaryFulfillment(response.diary_fulfillments[i]);
						var diary_fulfillment = response.diary_fulfillments[i];
						var data_point = []

						data_point[0] = moment(diary_fulfillment.day).toDate();
						data_point[1] = diary_fulfillment.general_porcentage;

						diary_fulfillments_chartdata[i+1] = data_point;

					};

					$scope.diary_fulfillments_chartdata = diary_fulfillments_chartdata;

					$scope.$apply();
					$scope.setupChart();
					
				}				
			});		
		});
	}

	$scope.init()

})