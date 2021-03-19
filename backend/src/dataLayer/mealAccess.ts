//import * as AWS  from 'aws-sdk'
import { createLogger } from '../utils/logger'
import { MealItem } from '../models/MealItem'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { MealUpdate } from '../models/MealUpdate'

const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));


const logger = createLogger('MealAccess')

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export class MealAccess {

  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly mealsTable = process.env.MEALS_TABLE,
   //private readonly mealsTableIndex = process.env.MEALS_INDEX,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)) {
  }

  async getMealsForUser(userId: string): Promise<MealItem[]> {
    
    logger.info("Get Meal Items from Database", {"userId": userId});
    
    try{
      const result = await this.docClient
            .query({
                TableName: this.mealsTable,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            }).promise()
      logger.info("Value of result: ", {"result": result})

      return result.Items as MealItem[]
      
    }catch (e) {
      logger.info('Error occured in the DB query op', {"e.message": e.message})
    }
    
    //if(!result)
      //logger.info('Database query getMealsForUser success!')
      
    
  }
  
  
  async createMealForUser(newmealItem: MealItem) {
        
    logger.info("Create Meal Item in Database", {"mealItem": newmealItem}); 
    
    try{
      await this.docClient.put({
          TableName: this.mealsTable,
          Item: newmealItem
      }).promise();
    }
    catch(e) {
      logger.info('Error occured while DB PUT', {"e.message": e.message})
    }

  }
  
  
  async updateMealItemForUser(userId: string, mealId: string, mealUpdate: MealUpdate): Promise<void>{
    
    logger.info("Update Meal Item in Database", {"userId": userId, "mealId": mealId});
    
    await this.docClient.update({
      TableName: this.mealsTable,
      Key: {
        'userId': userId,
        'mealId': mealId
      },
      UpdateExpression: 'set #name= :n, #dueDate = :due, #done = :d, #recipe = :r',
      ExpressionAttributeNames: {
        "#name": "name",
        '#dueDate': 'dueDate',
        '#done': 'done',
        '#recipe': 'recipe'
      },
      ExpressionAttributeValues: {
        ':n': mealUpdate.name,
        ':due': mealUpdate.dueDate,
        ':d': mealUpdate.done,
        ':r': mealUpdate.recipe
      }
      }).promise();
    
  }
  
  async deleteMealItem(userId: string, mealId: string): Promise<void> {
     
    logger.info("Delete Meal Item from Database", {"userId": userId, "mealId": mealId});
    
        await this.docClient.delete({
            TableName: this.mealsTable,
            Key: {
              'userId': userId,
              'mealId': mealId
            }
        }).promise();

  }
  
  async deleteMealItemAttachment(mealId: string): Promise<void> {
    
    logger.info("Delete Attachment for Meal Item", {"bucketName": this.bucketName, "mealId": mealId});
    
    await s3.deleteObject({
        Bucket: this.bucketName,
        Key: mealId
    }).promise()
  }
  
  async createUploadUrl(mealId: string): Promise<string> {
    logger.info("Create Signed Upload Url", {"bucketName": this.bucketName, "mealId": mealId});
    
    const signedUrl =  s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: mealId,
      Expires: this.urlExpiration
    })
    
    logger.info("Created Signed Upload Url", {"signedUrl": signedUrl});
    return signedUrl
  }
 
  async updateAttachmentUrl(userId: string, mealId: string, attachmentUrl: string): Promise<void> {
    
    logger.info("Updating attachment Url", {"bucketName": this.bucketName, "mealId": mealId});
    
    try{
    await this.docClient.update({
      TableName: this.mealsTable,
      Key: {
        'userId': userId,
        'mealId': mealId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      }).promise()
    }catch(e) {
      logger.info('Error occured while updating attachment Url', {"e.message": e.message})
    }
     
  }
  
}

// function createDynamoDBClient() {
//   if (process.env.IS_OFFLINE) {
//     console.log('Creating a local DynamoDB instance')
//     return new XAWS.DynamoDB.DocumentClient({
//       region: 'localhost',
//       endpoint: 'http://localhost:8000'
//     })
//   }

//   return new XAWS.DynamoDB.DocumentClient()
// }


