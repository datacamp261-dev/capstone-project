import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateMealRequest } from '../../requests/UpdateMealRequest'
import { getUserId } from '../utils'
import { updateMealItem } from '../../businessLogic/meal'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const mealId = event.pathParameters.mealId
  const updatedMeal: UpdateMealRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  await updateMealItem(userId, mealId, updatedMeal)
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }

}
