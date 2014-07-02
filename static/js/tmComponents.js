angular.module('tmComponents', [])

.directive('tmMenu', function(){

	return {
		restrict: 'E',		
		scope: true,
		replace: true,
		transclude: true,
		controller: function($scope, $element){					

			var empty = true

			this.addOption = function(option)	{
				if (empty){
					option.selected = true;
					empty = false;
				} 					
          		
			}
		},
		template:			
			'<ul id="nav-side" class="nav nav-sidebar" ng-transclude></ul>' 			
	}
})

.directive('tmOption', function($location) {
	return {
	  require: '^tmMenu',
	  restrict: 'E',
	  transclude: true,
	  replace:true,
	  scope: { title: '@' , url: '@', iconclass: '@'},
	  link: function(scope, element, attrs, tmMenuCtrl) {
	    tmMenuCtrl.addOption(scope);


	     
	  },
	  controller: function($scope){

	  		$scope.location = $location;

	  		// TODO: Se coloca -2 para quitar la S del plural pero no debería ser así
	  		$scope.url_value = $scope.url.substr(1,$scope.url.length-2);

	    	$scope.$watch('location.path()', function(value){

	    		if ( $scope.url_value != "/" && value.indexOf($scope.url_value) != -1 ){
	    			$scope.selectThis();
	    		}

	    	});
	
			$scope.selectThis = function(){
				var sibling = $scope.$$nextSibling;
				
				while(sibling){
					sibling.selected = false;
					sibling = sibling.$$nextSibling;
				}
					
				sibling = $scope.$$prevSibling;

				while(sibling){
					sibling.selected = false;
					sibling = sibling.$$prevSibling;
				}

				$scope.selected = true;

			}

	  },
	  template:'<li ng-click="selectThis()">'+	  			  
	           	  '<a ng-class="{active:selected}" href="{{url}}"><i class="{{iconclass}}"></i>{{title}}</a>' +
	           '</li>' 
	};
})

.directive('tmBackButton', function($window){
    return {
        template: '<a><span>Volver</span></a>',
        restrict: 'E',
        link: function(scope, element, attrs){
            element.on('click', function(e){
                $window.back();
            });
        }
    }
})

.directive('tmSectionTitle', function(){
    return {        
        templateUrl: 'template/tm-section-title.html',        
        restrict: 'E',
        transclude: true,
        scope: {
            addUrl: '=add',
        }
    }
})
           


