# Meal Planner App


# Functionality of the application

This application will allow creating/removing/updating/fetching Meal items. Each Meal item can optionally have an attachment image. Each user only has access to Meal items that he/she has created.

# Meal items

The application should store Meal items, and each Meal item contains the following fields:

* `mealId` (string) - a unique id for an item
* `createdAt` (string) - date and time when an item was created
* `name` (string) - name of a Meal item (e.g. "Hash browns")
* `dueDate` (string) - date and time for which an meal item is planned for
* `done` (boolean) - true if an the meal was cooked as planned
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a Meal item
* `recipe` (string) - a short description of steps involved in cooking the meal
*  `userId` (string) - a unique id for the user who created the meal item


# Functions 

Following functions are implemented and configured via the `serverless.yml` file:

* `Auth` - this function implements a custom authorizer for API Gateway that is added to all other functions.

* `GetMeals` - returns all Meal Items planned for a current user. A user id is extracted from the JWT token that is sent by the frontend

* `CreateMeal` - creates a new Meal Item for the current user. 

It returns a new Meal item that looks like this:

```json
{
  "item": {
    "mealId": "123",
    "createdAt": "2019-07-27T20:01:45.424Z",
    "name": "Hash browns",
    "dueDate": "2019-07-29T20:01:45.424Z",
    "done": false,
    "recipe": "Step 1: Step2: Step3:"
    "attachmentUrl": "http://example.com/image.png"
  }
}
```

* `UpdateMeal` - updates a Meal Item created by the current user and returns an empty body. Following fields can be updated:
* `name` (string) - name of a Meal item (e.g. "Hash browns")
* `dueDate` (string) - date and time for which an meal item is planned for
* `done` (boolean) - true if an the meal was cooked as planned
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a Meal item
* `recipe` (string) - a short description of steps involved in cooking the meal

* `DeleteMeal` - deletes a Meal item created by the current user. Expects an id of a Meal item to remove.


* `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for a Meal item.

It returns a JSON object that looks like this:

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
}
```

All functions are connected to the appropriate events from API Gateway.



# Frontend

The `client` folder contains a web application that uses the API that has been developed in the project and placed in folder backend.

If you use this backend code and replicate, the only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Logging

The project comes with a configured [Winston](https://github.com/winstonjs/winston) logger that creates [JSON formatted](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/) log statements. 



# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless Meal-Planner application.

