import { ObjectId } from 'mongodb'
import type { Db } from 'mongodb'
import type { DbNotification, NotificationType } from './types'

export async function createNotification(
  db: Db,
  userId: ObjectId | string,
  data: {
    type: NotificationType
    title: string
    message: string
    link?: string
  }
) {
  const notification: DbNotification = {
    userId: typeof userId === 'string' ? new ObjectId(userId) : userId,
    type: data.type,
    title: data.title,
    message: data.message,
    read: false,
    link: data.link,
    createdAt: new Date(),
  }
  await db.collection<DbNotification>('notifications').insertOne(notification)
}

export function toPublicNotification(n: DbNotification) {
  return {
    id: n._id!.toString(),
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    link: n.link,
    timestamp: n.createdAt.getTime(),
  }
}
