import { assetService } from "../Service/Asset/asset.service.js";
import { userService } from "../Service/User/user.service.js";

export const resolvers = {
    Query: {
        users: async () => userService.getUsers(),
        user: async (_req, args) => userService.getUserById(args.id),
        allAssets: async () => assetService.getAllAssets(),
        asset: async (_req, args) => assetService.getAssetById(args.id),
        assetByUserId: async (_req, args) => assetService.getAssetsByUserId(args.assigned_to)
    },
    Mutation: {
        register: async (_req, args) => userService.registerUser(args.name, args.email, args.password, args.role),
        login: async (_req, args) => userService.loginUser(args.email, args.password),
        changePassword: async (_req, args) => userService.changePassword(args.id, args.password),
        updateUser: async (_req, args) => userService.updateUser(args),
        assignAsset: async (_req, args) => assetService.assignAsset(args.id, args.assigned_to),
        requestAsset: async (_req, args) => assetService.requestAsset(args.id),
        addAsset: async (_req, args) => assetService.addAsset(args),
        addUser: async (_req, args) => userService.addUser(args.name, args.email, args.role),
        deleteUser: async (_req, args) => userService.deleteUser(args.id),
        deAssignAsset: async (_req, args) => assetService.deAssignAsset(args.id)
    }
}