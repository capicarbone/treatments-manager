


angular.module('TreatmentsManager')
	.service('TreatmentsUtils', function TreatmentsUtils() {

		return {

			addHelpers: function(treatment){

				treatment.remainingDays = function(){

					if (treatment.finish_date){
						var now = moment();

						return -1*now.diff(moment(treatment.finish_date), 'days');
					}

					return 'sdf';
					
				}

				treatment.elapsedDays = function(){

					if (treatment.created_at){
						var now = moment();

						// TODO: Denería ser con un campo de init_date
						return now.diff(moment(treatment.created_at), 'days');
					}

					return 'sdf';
					
				}

				treatment.highFulfillment = function(){

					return treatment.fulfillment_porcentage >= 85;
				}

				treatment.mediumFulfillment = function(){

					return treatment.fulfillment_porcentage < 85 && treatment.fulfillment_porcentage >= 55;
				}

				treatment.lowFulfillment = function(){
					return treatment.fulfillment_porcentage < 55;
				}

			},

			addHelpersToAll: function(treatments){

				service = this;

				angular.forEach(treatments, function(treatment){

					service.addHelpers(treatment);
				})

				return treatments;
			}
		}

  	}
)