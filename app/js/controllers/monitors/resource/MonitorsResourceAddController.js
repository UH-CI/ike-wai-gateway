angular.module('AgaveToGo').controller("MonitorsResourceAddController", function($scope, $state, $stateParams, $translate, MonitorsController, SystemsController, ActionsService, MessageService) {
		$scope.model = {};

		$scope.init = function(){
			if ($stateParams.systemId){
				$scope.model.target = $stateParams.systemId;
			}

			SystemsController.listSystems(99999)
				.then(
					function(response){
						$scope.systemsTitleMap = [];
						_.each(response.result, function(system){
							$scope.systemsTitleMap.push({"value": system.id, "name": system.id});
						});

						$scope.schema = {
							"type": "object",
							"properties": {
									"target": {
											"type": "string",
											"description": "The id of the sytem to be monitored. This must be an active system registered with the Systems service",
											"items": [],
											"title": "Target"
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
											"title": "Frequency",
											"default": 720,
											"minimum": 5
									},
									"updateSystemStatus": {
										"type": "boolean",
										"description": "Whether the test should update the system status. You must have an ADMIN role on the system to set this. Default = false",
										"title": "Update System Status",
										"default": false
									},
							}
						};

						$scope.form = [
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
						MessageService.handle(response, $translate.instant('error_monitors_add'));
					});
		};

		$scope.init();

		$scope.delete = function(){
			ActionsService.confirmAction('monitors', $scope.monitor, 'delete');
		};

		$scope.submit = function(){
			$scope.requesting = true;

			MonitorsController.addMonitoringTasks($scope.model)
				.then(
					function(response){
						$scope.monitorId = response.result.id;
						App.alert({message: 'Success: Added ' + $scope.monitorId });
						$scope.requesting = false;
					},
					function(response){
						$scope.requesting = false;
						MessageService.handle(response, $translate.instant('error_monitors_add'));
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
