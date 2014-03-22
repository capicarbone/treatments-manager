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

.directive('tmOption', function() {
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
