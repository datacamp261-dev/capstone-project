import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
//import { MealItem } from '../../models/MealItem'
import { getAllMealItems } from '../../businessLogic/meal'

const logger = createLogger('getMeal')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all Meal items for a current user
    
  logger.info('Caller event', event)

  const mealItems = await getAllMealItems(event)

  return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            items: mealItems
        })
    }
    
}
