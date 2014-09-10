
angular.module('TreatmentsManager')
.controller('PatientsManagerCtrl', function($scope, $location, $rootScope){

	$rootScope.section_title = "Mis Pacientes"

	$scope.patients = []

	$scope.is_ready = false;

	$scope.init = function(){

		$('.dropdown-toggle').dropdown();

		$rootScope.api.patients.all({ekey: $rootScope.doctor_key})
		.execute( function(res){
			$scope.$apply(function(){				
				
				angular.forEach(res.patients, function(patient){

					$scope.patients.push(new Patient(patient));
				})

				$scope.is_ready = true;
			})
		});
	};

	$scope.init()

})