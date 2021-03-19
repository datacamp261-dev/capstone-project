import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateMealRequest } from '../../requests/CreateMealRequest'
import { getUserId } from '../utils'
import { createMealItem } from '../../businessLogic/meal'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const newMeal: CreateMealRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  
  // TODO: Implement creating a new Meal item
  
  const result = await createMealItem(newMeal, userId)
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: result
    })
  }
}
