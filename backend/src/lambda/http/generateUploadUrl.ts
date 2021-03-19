import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { genUploadUrl } from '../../businessLogic/meal'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  // TODO: Return a presigned URL to upload a file for a Meal item with the provided id
  const userId = getUserId(event)
  const mealId = event.pathParameters.mealId
  
  const presignedUploadUrl = await genUploadUrl(userId, mealId)
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: presignedUploadUrl
    })
  }
}
