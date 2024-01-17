import angular, { ILocationService } from 'angular';
import { ChangeTracker } from './ChangeTracker';
import { ContextSrv } from 'app/core/services/context_srv';
import { DashboardSrv } from './DashboardSrv';
import { GrafargRootScope } from 'app/routes/GrafargCtrl';

/** @ngInject */
export function unsavedChangesSrv(
  this: any,
  $rootScope: GrafargRootScope,
  $location: ILocationService,
  $timeout: any,
  contextSrv: ContextSrv,
  dashboardSrv: DashboardSrv,
  $window: any
) {
  this.init = function (dashboard: any, scope: any) {
    this.tracker = new ChangeTracker(dashboard, scope, 1000, $location, $window, $timeout, contextSrv, $rootScope);
    return this.tracker;
  };
}

angular.module('grafarg.services').service('unsavedChangesSrv', unsavedChangesSrv);
