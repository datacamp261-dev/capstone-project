import { MealAccess } from "../dataLayer/mealAccess"
import { MealItem } from '../models/MealItem'
import {APIGatewayProxyEvent} from 'aws-lambda'
import { createLogger } from '../utils/logger'
import { getUserId } from "../lambda/utils"
import * as uuid from 'uuid';
import { CreateMealRequest } from "../requests/CreateMealRequest"
import { UpdateMealRequest } from "../requests/UpdateMealRequest"
import { MealUpdate } from "../models/MealUpdate"

const mealAccess = new MealAccess()
const logger = createLogger('Meal')

export async function getAllMealItems(event: APIGatewayProxyEvent) : Promise<MealItem[]> {
  
  const userId = getUserId(event);
  
  logger.info('Getting all meal items for user.', {"userId": userId})

  return await mealAccess.getMealsForUser(userId)
}

export async function createMealItem(newMeal: CreateMealRequest, userId: string): Promise<MealItem> {
  
  logger.info('Create new meal item.', {"userId": userId, "MealItem": newMeal})
  
  const mealId = uuid.v4()
  const createdAt = new Date(Date.now()).toISOString()
  
  const newMealItem: MealItem = {
    userId: userId,
    mealId: mealId,
    createdAt: createdAt,
    done: false,
    ...newMeal
  }
  
  await mealAccess.createMealForUser(newMealItem)
  return newMealItem
}

export async function updateMealItem(userId: string, mealId: string, updatedMeal: UpdateMealRequest): Promise<void> {
  
  logger.info('Update item.', {"userId": userId, "mealId": mealId, "updatedMeal": updatedMeal})

  const mealUpdate: MealUpdate = updatedMeal as MealUpdate
  
  await mealAccess.updateMealItemForUser(userId, mealId, mealUpdate )
}

export async function genUploadUrl(userId: string, mealId: string): Promise<string> {
  
  logger.info('Generate Upload URL and update attachment url for ', {"userId": userId, "MealId": mealId})

  const signedUploadUrl = await mealAccess.createUploadUrl(mealId)
  
  const attachmentUrl = signedUploadUrl.split('?')[0]
  
  await mealAccess.updateAttachmentUrl(userId, mealId, attachmentUrl)
  
  return signedUploadUrl
  
}

export async function deleteMeal(userId: string, mealId: string): Promise<void> {
  
  logger.info('Delete Meal for ', {"userId": userId, "MealId": mealId})

  await mealAccess.deleteMealItem(userId, mealId)
  
  await mealAccess.deleteMealItemAttachment(mealId)
  
}


