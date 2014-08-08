angular.module('laboard-frontend')
    .controller('ColumnController', [
        '$scope', '$rootScope', 'ColumnsRepository', '$modal', 'IssuesRepository',
        function($scope, $rootScope, ColumnsRepository, $modal, IssuesRepository) {
            $scope.drop = function(issue) {
                $scope.column.issues.push(issue);
                issue.to = $scope.column.title;

                IssuesRepository.move(issue)
                    .then(
                        function(issue) {
                            if (issue.theme) {
                                issue.before = issue.theme;
                                issue.after = null;

                                IssuesRepository.theme(issue);
                            }
                        }
                    );
            };

            $scope.move = function(step) {
                $scope.column.position += step;

                ColumnsRepository.edit($scope.column)
                    .then(
                        function() {
                            $scope.columns.all.forEach(function(column) {
                                if(column === $scope.column) return;

                                if (column.position === $scope.column.position) {
                                    column.position += -step;

                                    ColumnsRepository.edit(column)
                                        .then(
                                            function() {},
                                            function() {
                                                $scope.column.position += -step;
                                                column.position += step;
                                            }
                                        );
                                }
                            });
                        },
                        function() {
                            $scope.column.position += -step;
                        }
                    );
            };

            $scope.edit = function() {
                var column = $scope.column,
                    theme = $scope.column.theme;

                $modal
                    .open({
                        templateUrl: 'partials/column/modal.html',
                        controller: function($scope, $modalInstance) {
                            $scope.edit = true;
                            $scope.theme = column.theme || 'default';

                            $scope.save = function () {
                                column.theme = $scope.theme;

                                ColumnsRepository.edit(column)
                                    .then(
                                        $modalInstance.close,
                                        function() {
                                            column.theme = theme;

                                            $modalInstance.dismiss('error');
                                        }
                                    );
                            };
                        }
                    });
            };

            $scope.remove = function() {
                ColumnsRepository.remove($scope.column);
            };

            $scope.create = function() {
                $modal
                    .open({
                        templateUrl: 'partials/column/modal.html',
                        controller: function ($scope, $modalInstance) {
                            $scope.theme = 'default';
                            $scope.error = false;

                            $scope.save = function () {
                                var column = {
                                    title: $scope.title,
                                    theme: $scope.theme
                                };

                                ColumnsRepository.add(column)
                                    .then(
                                        $modalInstance.close,
                                        function () {
                                            $scope.error = true;
                                        }
                                    );
                            };
                        }
                    });
            };

            $scope.fill = function() {
                var issues = [];

                IssuesRepository.all.forEach(function(issue) {
                    if (issue.column === $scope.column.title.toLowerCase()) {
                        issues.push(issue);
                    }
                });

                $scope.column.issues = issues;
            };

            $scope.$watch(
                function() {
                    return IssuesRepository.all;
                },
                function() {
                    if (IssuesRepository.all) {
                        $scope.fill();
                    }
                }
            );

            socket.on(
                'issue.move',
                function(data) {
                    var index = [data.from, data.to].indexOf($scope.column.title.toLowerCase());

                    if (index === -1) return;

                    $rootScope.$apply(
                        function() {
                            IssuesRepository.add(data.issue);

                            $scope.fill();
                        }
                    );
                }
            );
        }
    ]);
