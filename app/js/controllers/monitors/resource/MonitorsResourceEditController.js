angular.module('AgaveToGo').controller("MonitorsResourceEditController", function($scope, $state, $stateParams, $translate, MonitorsController, SystemsController, ActionsService, MessageService) {

	$scope.monitorId = $stateParams.monitorId;

	if ($stateParams.monitorId){
		$scope.requesting = true;
		SystemsController.listSystems(99999)
				.then(function(response){
					$scope.systemsTitleMap = [];
					_.each(response.result, function(system){
						$scope.systemsTitleMap.push({"value": system.id, "name": system.id});
					});

					MonitorsController.getMonitoringTask($stateParams.monitorId)
							.then(
									function(response){
										$scope.monitor = response.result;
										$scope.requesting = false;
										var resource = '';

										$scope.model = {
											"id": response.result.id,
											"target": response.result.target,
											"active": response.result.active,
											"frequency": response.result.frequency,
											"updateSystemStatus": response.result.updateSystemStatus
										};

										$scope.schema = {
											"type": "object",
											"properties": {
												"id": {
													"type": "string",
													"description": "UUID for this monitor",
													"title": "ID",
													"readonly": true
												},
												"target": {
													"type": "string",
													"description": "The id of the sytem to be monitored. This must be an active system registered with the Systems service",
													"items": [],
													"title": "Target",
													"readonly": true
												},
												"active": {
													"type": "boolean",
													"description": "Whether this monitor shour be active",
													"title": "Prepend command line argument?",
													"default": true
												},
												"frequency": {
													"type": "integer",
													"description": "How often the monitor should run in minutes. Minimum 5, default 720 (12 hours)",
													"title": "Frequency"
												},
												"updateSystemStatus": {
													"type": "boolean",
													"description": "Whether the test should update the system status. You must have an ADMIN role on the system to set this. Default = false",
													"title": "Update System Status",
													"default": false
												}
											}
										};

										$scope.form = [
											"id",
											{
												"key": "target",
												"type": "select",
												"titleMap": $scope.systemsTitleMap,
												ngModelOptions: {
													updateOnDefault: true
												},
												validationMessage: {
													'required': 'Missing required'
												},
												$validators: {
													required: function(value) {
														return value ? true : false;
													}
												}
											},
											{
												"key": "active",
												"type": "radiobuttons",
												"style": {
													"selected": "btn-success",
													"unselected": "btn-default"
												},
												"titleMap": [
													{"value": true, "name": "True"},
													{"value": false, "name": "False"}
												],
												"description": "Whether this monitor should be active",
												"title": "Active",
												ngModelOptions: {
													updateOnDefault: true
												}
											},
											"frequency",
											{
												"key": "updateSystemStatus",
												"type": "radiobuttons",
												"style": {
													"selected": "btn-success",
													"unselected": "btn-default"
												},
												"titleMap": [
													{"value": true, "name": "True"},
													{"value": false, "name": "False"}
												],
												"description": "Whether the test should update the system status. You must have an ADMIN role on the system to set this. Default = false",
												"title": "Update System Status",
												ngModelOptions: {
													updateOnDefault: true
												}
											}
										];

									},
									function(response){
										MessageService.handle(response, $translate.instant('error_monitors_list'));
									}
							);

				},
				function(response){
					$scope.requesting = false;
					MessageService.handle(response, $translate.instant('error_monitors_list'));
				}
			);
	} else {
		MessageService.handle($translate.instant('error_monitors_list'));
	};

	$scope.delete = function(){
		ActionsService.confirmAction('monitors', $scope.monitor, 'delete');
	};

	$scope.update = function(){
		$scope.requesting = true;
		MonitorsController.updateMonitoringTask($scope.model, $scope.model.id)
				.then(
						function(response){
							App.alert({message: $translate.instant('success_monitors_update') + $scope.monitorId});
							$scope.requesting = false;
						},
						function(response){
							$scope.requesting = false;
							MessageService.handle(response, $translate.instant('error_monitors_list'));
						}
				);
	};

	$scope.test = function(){
		$scope.requesting = true;
		$scope.monitorCheck = '';
		MonitorsController.createForceMonitoringTaskCheck($scope.monitorId)
				.then(
						function(response){
							$scope.requesting = false;
							$scope.monitorCheck = response.result;
							App.alert({message: $translate.instant('success_monitors_test') + $scope.monitorId});
						},
						function(response){
							$scope.requesting = false;
							MessageService.handle(response, $translate.instant('error_monitors_test'));
						}
				);
	}


});
