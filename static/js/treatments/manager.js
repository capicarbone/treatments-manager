
angular.module('TreatmentsManager')
.controller('TreatmentsManagerCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Tratamientos activos"

	$scope.treatments = [];

	$scope.init = function(){

		$rootScope.api.treatments.actives({ekey: $rootScope.doctor_key}).execute(function(response){

			$scope.$apply(function(){
				
				angular.forEach(response.treatments, function(t){
					t.created_at_readable = moment(t.created_at).format("DD / MM / YY");
					
				});

				$scope.treatments = response.treatments;
			});

		});
	}

	$scope.init()

})