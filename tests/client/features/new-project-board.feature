Feature: New project board

  As a Laboard user & project master
  I should be able to create a project's board
  In order to manage my issues

  Background:
    Given user "test" has token "foobar"
    And project "bar" exists in namespace "foo"
    And I am "master" on project "foo/bar"
    And I go to laboard
    And I login with token "foobar"
    And I click on "foo/bar"

  Scenario: Project has no column
    Then I should see "No column"
    And I should see "create some columns"
    And I should see "use the default columns"

  Scenario: Use default columns set
    When I click on "use the default columns"
    Then I should see the "Sandbox" column
    And I should see the "Backlog" column
    And I should see the "Accepted" column
    And I should see the "Review" column
    And I should see the "Done" column

  Scenario: Manually create column
    When I click on "create some columns"
    Then I should see a modal dialog

    When I type "Todo" in "#title"
    And I click on "Save"
    Then I should see the "Todo" column
