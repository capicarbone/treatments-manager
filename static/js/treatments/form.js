
angular.module('TreatmentsManager')
.controller('TreatmentFormCtrl', function($scope, $rootScope, $routeParams, $location){

	$rootScope.section_title = "Registro de tratamiento"

	$scope.patient = $rootScope.patient;
	$scope.treatment = {is_active: true};

	$scope.medicaments = []

	$scope.action = {}
	$scope.action.regime_type = Consts.TreatmentAction.regimeTypes.SPECIFIC_HOUR;

	$scope.actions = []

	$scope.medicament_take_form_fl = false;
	$scope.measurement_take_form_fl = false;

	$scope.medicamentsCount = 0;
	$scope.measurementsCount = 0;

	$scope.isFormActive = function(){
		return $scope.medicament_take_form_fl || $scope.measurement_take_form_fl;
	}

	$scope.initFinishDateField = function(){		

		var format = "dd / mm / yyyy";

	    $(".input-group.date").datepicker({
	    	format: format,
	    	startDate: moment(new Date).format(format),	    	
    		language: "es",    		
    		autoclose: true
	    })
	    .on('changeDate', function(e){	    	

	    	console.log("Cambiado");

	    	$scope.$apply(function(){	    		
	    		$scope.action.readable_finish_date = e.format();
	    		console.log(e);
	    		$scope.action.finish_date = moment(e.date).format();	    		
	    	})
	    })
	}

	$scope.init = function(){

		$scope.initFinishDateField();

		$rootScope.api.medicaments.all().execute(function(res){

			$scope.medicaments = res.medicaments;
			$scope.$apply();
		});

		$("#take_time_picker").datetimepicker({
			language: 'en',
			minuteStepping: 5,
			pickDate: false
		})
		.on('change.dp', function(e){
			$scope.$apply(function(){
				$scope.action.readable_take_hour = document.getElementById("take_hour").value

				var moment_date = moment($scope.action.readable_take_hour, "hh:mm a");

				if ( moment_date.isValid() )
					$scope.action.take_hour = moment_date.format();
				else
					$scope.action.take_hour = undefined;

			});

		})

	}	

	$scope.specificHourSelected = function(){
		return $scope.action.regime_type == Consts.TreatmentAction.regimeTypes.SPECIFIC_HOUR;
	}

	$scope.rangeHourSelected = function(){
		console.log("Se ejecuta");
		return $scope.action.regime_type == Consts.TreatmentAction.regimeTypes.TIME_INTERVAL;
	}


	$scope.medicament_take_form = function(){
		$scope.medicament_take_form_fl = true;
		$scope.measurement_take_form_fl = false;

	}

	$scope.measurement_take_form = function(){
		$scope.medicament_take_form_fl = false;
		$scope.measurement_take_form_fl = true;
	}

	$scope.valid_action = function(){

		if ( $scope.action.action_type == 'M' ){

			if ( !$scope.action.medicament || $scope.action_type == "")
				return false;

			if ( $scope.action.regime_type == 'E')
				if ( !$scope.action.take_hour || $scope.action.take_hour == "")
					return false
		}

		return true;
	}

	$scope.register_action = function(){

		var action = {}

		if ($scope.medicament_take_form_fl )
			$scope.action.action_type = 'M';

		if ($scope.measurement_take_form_fl )
			$scope.action.action_type = 'I';

		if ( $scope.valid_action() ){

			angular.copy($scope.action, action);

			action.readable_take_hour = $scope.action.readable_take_hour;

			var action = new TreatmentAction(action);

			if (action.isForMeasurement)
				$scope.measurementsCount++;

			if (action.isForMedicamentTake)
				$scope.medicamentsCount++;

			$scope.actions.push(action);			

			delete $scope.action.medicament;
			$scope.action.take_hour = "";
			$scope.form.take_hour = "";
			$scope.action.readable_take_hour = "";

			$scope.cancel();

		}		

	}

	$scope.treatment_save = function(){

		var treatment = $scope.treatment;
		treatment.actions = $scope.actions;
		treatment.patient_key = $scope.patient.key;

		$rootScope.api.treatment.save(treatment).execute(function(res){
			console.log(res);
			treatment_id = res.id;

			$location.path('tratamiento/' + res.key).replace();
			$scope.$apply();

		});
	}

	$scope.delete_action = function(index){

		var action = $scope.actions.pop(index);		

		if (action.isForMeasurement)
			$scope.measurementsCount--;

		if (action.isForMedicamentTake)
			$scope.measurementsCount--;

	}

	$scope.cancel = function(){
		$scope.medicament_take_form_fl = false;
		$scope.measurement_take_form_fl = false;
	}

	$scope.init();

})