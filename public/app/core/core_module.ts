import angular from 'angular';

const coreModule = angular.module('grafarg.core', ['ngRoute']);

// legacy modules
const angularModules = [
  coreModule,
  angular.module('grafarg.controllers', []),
  angular.module('grafarg.directives', []),
  angular.module('grafarg.factories', []),
  angular.module('grafarg.services', []),
  angular.module('grafarg.filters', []),
  angular.module('grafarg.routes', []),
];

export { angularModules, coreModule };

export default coreModule;
