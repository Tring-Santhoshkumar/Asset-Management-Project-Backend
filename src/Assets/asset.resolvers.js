import { assetService } from "./asset.service.js"

export const assetResolvers = {
    Query: {
        allAssets: async () => assetService.getAllAssets(),
        asset: async (_req, args) => assetService.getAssetById(args.id),
        assetByUserId: async (_req, args) => assetService.getAssetsByUserId(args.assigned_to),
    },
    Mutation: {
        assignAsset: async (_req, args) => assetService.assignAsset(args.id, args.assigned_to),
        requestAsset: async (_req, args) => assetService.requestAsset(args.id),
        addAsset: async (_req, args) => assetService.addAsset(args?.input),
        deleteAsset: async(_req, args) => assetService.deleteAsset(args.id),
        deAssignAsset: async (_req, args) => assetService.deAssignAsset(args.id),
    }
}