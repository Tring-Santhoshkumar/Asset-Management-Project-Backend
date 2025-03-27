import { userService } from "./user.service.js"

export const userResolvers = {
    Query: {
        users: async () => userService.getAllUsers(),
        user: async (_req, args) => userService.getUserById(args.id),
    },
    Mutation: {
        register: async (_req, args) => userService.registerUser(args.name, args.email, args.password, args.role),
        login: async (_req, args) => userService.loginUser(args.email, args.password),
        changePassword: async (_req, args) => userService.changePassword(args.id, args.password),
        updateUser: async (_req, args) => userService.updateUser(args?.input),
        addUser: async (_req, args) => userService.addUser(args.name, args.email, args.role),
        deleteUser: async (_req, args) => userService.deleteUser(args.id),
    }
}