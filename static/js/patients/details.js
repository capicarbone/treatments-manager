
angular.module('TreatmentsManager')
.controller('PatientDetailsCtrl', function($scope, $rootScope, $routeParams){

	$scope.init = function(){

		$rootScope.api.patient.details({ekey: $routeParams.patient_key})
		.execute(function(response){
			$scope.patient = new Patient(response);
			$scope.$apply();
		});

		$rootScope.api.patient.treatments({ekey: $routeParams.patient_key})
		.execute(function(response){			

			$scope.treatments = [];
			angular.forEach(response.treatments, function(t){
				$scope.treatments.push(new Treatment(t));
			})

			$scope.$apply();
		});
	}

	$scope.init();
})