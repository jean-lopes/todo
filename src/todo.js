'use strict;';
var app = angular.module('todoApp', []);
app.controller(
    'todoCtrl',
    [
        '$scope',
        '$http',
        function($scope, $http) {
            $scope.todo = {};
            $scope.todos = [];

            $scope.resetTodo = function () {
                $scope.todo = { id: null, task: "", done: false };
            };

            $scope.submit = function () {
                if ($scope.todo.task) {
                    if ($scope.todo.id) {
                        $http.put(
                            "./todos/" + $scope.todo.id,
                            $scope.todo
                        ).then(
                            function sucess(response) {
                                $scope.todos.forEach(
                                    function (item, index) {
                                        if (item.id === $scope.todo.id) {
                                            item.task = $scope.todo.task;
                                            item.done = $scope.todo.done;
                                        }
                                    }
                                );

                                $scope.resetTodo();
                            },
                            function error(response) {
                                $scope.resetTodo();
                            }
                        );
                    } else {
                        $http.post(
                            "./todos", 
                            $scope.todo
                        ).then(
                            function sucess(response) {
                                $scope.todo.id = response.data;
                            
                                $scope.todos.push($scope.todo);

                                $scope.resetTodo();
                            },
                            function error(response) {
                                $scope.resetTodo();
                            }
                        );
                    }
                }            
            };

            $scope.filterAll = function () {

            };

            $scope.filterActive = function () {

            };

            $scope.filterCompleted = function () {

            };

            $scope.clearCompleted = function () {

            };

            $scope.edit = function (todo) {
                $scope.todo = angular.copy(todo);
                var input = angular.element('[ng-model="todo.task"]');
                input.focus();
            };

            $scope.delete = function (todo) {

            };

            $scope.updateCssDone = function (todo) {
                if (todo.done) {
                    return "w3-theme-d3 w3-text-theme";
                } else {
                    return "w3-theme-light w3-text-theme";
                } 
            };

            $scope.checkDone = function (todo) {
                todo.done = !todo.done;
                //TODO: $scope.update(todo);
            };

            $scope.resetTodo();
            $scope.filterAll();
        }
    ]
);