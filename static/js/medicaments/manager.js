
angular.module('TreatmentsManager')
.controller('MedicamentsManagerCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Medicamentos"

	$scope.init = function(){
		$rootScope.api.medicaments.all().execute(function(res){

			$scope.medicaments = res.medicaments;

			$scope.$apply();
		})
	}

	

	$scope.init();

})