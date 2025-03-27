import { notificationService } from "./notifications.service.js"

export const notificationsResolvers = {
    Query: {
        getNotifications: async () => notificationService.getAllNotifications(),
        getNotificationsById: async (_req, args) => notificationService.getAllNotificationsById(args.user_id)
    },
    Mutation: {
        createNotification: async(_req,args) => notificationService.getCreateNotification(args.user_id, args.asset_id, args.message),
        readNotifications: async (_req, args) =>  notificationService.getReadNotifications(args.id, args.choice)
    }
}