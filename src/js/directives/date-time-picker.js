angular.module('dunner').directive('datetimepicker', ['$timeout', ($timeout) => {
  function link($scope, $element, $attrs, controller) {
    $element.on('dp.change', () => {
      $timeout(() => {
        controller.$setViewValue($element.data('DateTimePicker').date());
        $scope.onDateChangeFunction();
      });
    });

    $element.on('click', () => {
      $scope.onDateClickFunction();
    });

    controller.$render = () => {
      if (Boolean(controller) && Boolean(controller.$viewValue)) {
        $element.data('DateTimePicker').date(controller.$viewValue);
      }
    };

    $element.datetimepicker($scope.$eval($attrs.datetimepickerOptions));
  }

  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      datetimepickerOptions: '@',
      onDateChangeFunction: '&',
      onDateClickFunction: '&',
    },
    link,
  };
},
]);
