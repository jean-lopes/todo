'use strict;';
var app = angular.module(
    'todoApp', 
    [ 'LocalStorageModule' ]
).config(
    function (localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('todoApp');
    }
).controller(
    'todoCtrl',
    [
        '$scope',
        '$http',
        '$log',
        'localStorageService',
        function($scope, $http, $log, localStorageService) {
            $scope.todo = {};
            $scope.todos = [];
            $scope.isOfflineMode = true;
            $scope.currentFilter = 'all';
            $scope.allCount = 0;
            $scope.activeCount = 0;
            $scope.completedCount = 0;

            $scope.resetTodo = function () {
                $scope.todo = { id: null, task: "", done: false };
            };

            $scope.updateCssDone = function (todo) {
                if (todo.done) {
                    return "w3-theme-d3 w3-text-theme";
                } else {
                    return "w3-theme-light w3-text-theme";
                } 
            };

            $scope.updateCssFilter = function (filter) {
                if ($scope.currentFilter === filter) {
                    return "w3-theme";
                } else {
                    return "w3-theme-dark";
                }
            }

            $scope.filterAll = function () {
                $scope.currentFilter = 'all';
            };

            $scope.filterActive = function () {
                $scope.currentFilter = 'active';
            };

            $scope.filterCompleted = function () {
                $scope.currentFilter = 'completed';
            };           

            $scope.filterBy = function (currentFilter) {
                return function (item) {
                    return (currentFilter === 'all') 
                        || (currentFilter === 'active'    && !item.done)
                        || (currentFilter === 'completed' &&  item.done);
                };
            };

            $scope.edit = function (todo) {
                $scope.todo = angular.copy(todo);
                var input = angular.element('[ng-model="todo.task"]');
                input.focus();
            }; 

            $scope.submit = function () {
                if ($scope.todo.id) {
                    $scope.update($scope.todo);
                } else {
                    $scope.insert($scope.todo);
                }

                $scope.resetTodo();
            };

            $scope.clearCompleted = function () {
                $scope.todos = 
                    $scope.todos.filter(
                        function (item) { 
                            return !item.done 
                        }
                    );
            };

            $scope.toggleDone = function (todo) {
                todo.done = !todo.done;
            };

            $scope.insert = function (todo) {
                var max = 0;

                $scope.todos.forEach(
                    function (item) {
                        if (item.id > max) {
                            max = item.id;
                        }
                    }
                );

                $scope.todo.id = max + 1;
            
                $scope.todos.push($scope.todo);
            };

            $scope.update = function (todo) {
                $scope.todos.forEach(
                    function (item) {
                        if (item.id === $scope.todo.id) {
                            item.task = $scope.todo.task;
                            item.done = $scope.todo.done;
                        }
                    }
                );
            };

            $scope.delete = function (todo) {
                $scope.todos = 
                    $scope.todos.filter(
                        function (item) { 
                            return item.id !== todo.id;
                        }
                    );
            };

            $scope.init = function () {
                $scope.resetTodo();
                $scope.filterAll();

                if (localStorageService.isSupported) {
                    $scope.todos = localStorageService.get('todos') || [];
                    $scope.currentFilter = localStorageService.get('currentFilter') || 'all';

                    $scope.$watch(
                        "todos",
                        function (newValue, oldValue, scope) {
                            localStorageService.set('todos', newValue);

                            var active = 0;

                            scope.todos.forEach(function (item) {
                                if (!item.done) {
                                    active++;
                                }
                            });

                            scope.allCount = scope.todos.length;
                            scope.activeCount = active;
                            scope.completedCount = scope.allCount - scope.activeCount;
                        },
                        true
                    );

                    $scope.$watch(
                        "currentFilter",
                        function (newValue, oldValue) {
                            localStorageService.set('currentFilter', newValue);
                        }
                    );
                }
            };

            $scope.init();
        }
    ]
);