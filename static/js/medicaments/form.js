
angular.module('TreatmentsManager')
.controller('MedicamentFormCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Registro de medicamento"

	$scope.presentations = []

	$scope.init = function(){

		$rootScope.api.presentations.all().execute(function(res){

			$scope.presentations = res.presentations;
			$scope.$apply()

		});
	}

	$scope.save = function(){

		medicament = $scope.medicament;

		medicament.registered_by = $rootScope.doctor_key;

		$rootScope.api.medicament.save(medicament).execute(function(res){

			console.log(res);
		})
	}

	$scope.init();

})