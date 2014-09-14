'use strict';

var directiveModule = angular.module('uchiwa.directives', []);

directiveModule.directive('bootstrapTooltip', function () {
  return {
    restrict: 'EA',
    link: function (scope, element) {
      element.tooltip();
    }
  };
});

directiveModule.directive('siteTheme', ['$cookieStore', 'settings', function ($cookieStore, settings) {
  return {
    restrict: 'EA',
    link: function (scope, element) {
      scope.themes = [
        {
          name: 'default'
        },
        {
          name: 'dark'
        }
      ];
      var lookupTheme = function (themeName) {
        return scope.themes[scope.themes.map(function (t) {
          return t.name;
        }).indexOf(themeName)];
      };
      var setTheme = function (theme) {
        var themeName = angular.isObject(theme) && angular.isDefined(theme.name) ? theme.name : settings.theme;
        scope.currentTheme = lookupTheme(themeName);
        $cookieStore.put('currentTheme', scope.currentTheme);
        var fullThemeName = 'uchiwa-' + scope.currentTheme.name;
        element.attr('href', 'css/' + fullThemeName + '/' + fullThemeName + '.css');
      };
      scope.$on('theme:changed', function (event, theme) {
        setTheme(theme);
      });

      setTheme($cookieStore.get('currentTheme'));
    }
  };
}]);

directiveModule.directive('statusGlyph', function() {
  return {
    restrict: 'EA',
    link: function(scope, element, attrs) {
      var style;

      function updateGlyph() {
        element.removeAttr('class');
        element.addClass('fa fa-fw');
        switch(style) {
          case 'success':
            element.addClass('fa-check-circle');
            break;
          case 'warning':
            element.addClass('fa-exclamation-circle');
            break;
          case 'danger':
            element.addClass('fa-bomb');
            break;
          case 'muted':
            element.addClass('fa-question-circle');
            break;
        }
        element.addClass('text-' + style);
      }

      scope.$watch(attrs.statusGlyph, function(value) {
        // convert sensu state to CSS class name
        var styleOverrides = {
          'critical': 'danger',
          'unknown': 'muted'
        };
        style = styleOverrides[value] ? styleOverrides[value] : value;
        updateGlyph();
      });
    }
  };
});

directiveModule.directive('attribute', ["$compile", "$filter", function ($compile, $filter) {
  //Figure out how to render content based on the content.
  var selectTemplate = function(value){
      var template = '';

      if($filter("mightBeLink")(value)) {
        // Would be better to move to external template if other renders are desired.
        template = "<a target='_blank' href='" + value + "'>" + value + "</a>";
      }
      else {
        template = value;
      }

      return template;
  };

  return {
    restrict: 'EA',
    transclude: true,
    link: function(scope, element, attributes) {
      element.html(selectTemplate(attributes.value));
      $compile(element.contents())(scope);
    }
  };
}]);
