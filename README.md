# ChoreKeeper

## Team
Team Name: Group 14

Members:
- Joshua Dueck, dueckj1@myumanitoba.ca
- Syed Ali Jafry, aliahses@myumanitoba.ca
- Kimberly Wills, willsk@myumanitoba.ca
- Abdulraheem Tiamiyu, tiamiyao@myumanitoba.ca

## Project Summary and Vision


## Core Features
- Create, update, and delete chores
- View and manage a list of chores
- Receive notifications regarding chores
- Can response x users with y requests per minute concurrently

## Technologies



## User Stories

### Create, update, and delete chores
- As a person with chores to complete, I want to be able to create, update, and delete chores so that I can keep track of the chores that I need to complete
- Scenario: User compiles their chores in the system
    
    Given that I need to complete some chores\
    when I click the "add" button and fill in the information for a chore\
    then the chore is created in the system\
    and the chore is added to a chore list\
    when I click on an existing chore\
    then I can view the information I inputted for that chore\
    and the system shows an "edit" button for that chore\
    when I click the "edit" button, change the information, and save it\
    then the chore is updated in the system\
    when I click the "delete" button on a chore\
    then the chore is removed from the system

### View and manage a list of chores
- As a person with chores to complete, I want to be able view and manage a list of chores per day, week, month, etc. so that I can organize and priorities my chores
- Scenario: User manages a list of chores so that they can organize their time

    Given that I have entered my chores into the system\
    when I go to the main page\
    then I can see my chores in a list\
    and the system shows a "sort" button and a "filter" button\
    when I click the "sort" button and select a sort criteria, such as due date and time\
    then the list of chores is sorted\
    when I click a "filter" button and select a filter criteria, such as for the day\
    then the list of chores is filtered\
    when I complete a chore and click the box next to it\
    then the chore is "checked off" and marked as completed in the system

### Receive notifications regarding chores
- As a signed-in user, I want to be able to get notifications about upcoming chores so that I do not forget to complete them
- Scenario: User sets up notifications to be received to remind them about their chores

    Given that I am a signed-in and have entered my chores into the system with specified notification times\
    when I navigate to the notifications settings and input my phone number or email\
    then I receive a text or email notification when my chore needs to be completed

