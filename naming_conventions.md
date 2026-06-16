# Naming Convetions

This document covers the naming convention used in this project. It outlines how github branches, commit messages, database tables, and et cetera are named.
There is not standard convention used. However, a mixture of naming conventions such as the *lowercase*, *snake_case*, and the *camelCase* will be used.

## Coding Practices

The naming convention in terms of coding practices includes how the following are named:

    1. Github branches
    2. Commit messages
    3. Folders
    4. Files
    5. Functions
    6. Variables

#### Github branches

We make use of the *camelCase* to name github branches. For example:

    1. a frontend branch will be named as *frontend* (considering frontend as one word).
    2. a feature branch on the frontend will be name as *frontendFeature*. <parent branch><sub branch starting with capital letter>
FYI, branches in this repository include : main, development, backend, backendFeature, frontend, and frontendFeature.

#### Commit messages

When commiting to the repository, the following convention will be followed to write the commit messages.

    1. <branch you're working on>(one or two word summary of the commit message):<full commit message>
Take the following as an example. When working on the *frontendFeature* branch after adding the login functionality for user authentication, the commit message will be written as:

    1. frontendFeature(user auth):This adds the functionality to facilitate user login

#### Folders | Files | Functions | Variables

Try by all means to write descriptive or self-explanatory names when naming folders, files, functions, and variables. The *lowercase* is used for one-word names while
the *camelCase* is used for multiple-word names. For example: 

    1. a function to handle user login or registration should be named <handleUserLogin> or <handleUserRegistration> respectively
    2. a file to store patient routes will be stored in the <routes> folder and named <patients>

## Database

This focuses on how database schemas, tables, and columns will be named. The *lowercase* convention will be used for one-word names while the *snake_case* will be used for
multiple-word names. For example:

    1. a patient id column should be named <patient_id>
    2. a schema which stores tables that have patients' information should be named <patients> 

**BEWARE: There exists an exception for naming components. To follow the standard principle of React, component names are Capitalized** 
