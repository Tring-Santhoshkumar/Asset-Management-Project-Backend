import db from '../../db.js';
import { sendEmail } from '../Mail/mailer.js';

export const assetService = {
    getAllAssets: async () => {
        const result = await db.query("SELECT * FROM assets");
        return result.rows;
    },
    getAssetById: async (id) => {
        const result = await db.query(`SELECT * FROM assets WHERE id = '${id}'`);
        return result.rows[0];
    },
    getAssetsByUserId: async (userId) => {
        const result = await db.query(`SELECT * FROM assets WHERE assigned_to = '${userId}'`);
        return result.rows;
    },
    assignAsset: async (id, assigned_to) => {
        const result = await db.query(`UPDATE assets SET assigned_to = '${assigned_to}', assigned_status = 'Assigned', assigned_date = NOW() WHERE id = '${id}' RETURNING *`);
        const user = await db.query(`SELECT email FROM users WHERE id = '${assigned_to}' `);
        await sendEmail({
          to: user.rows[0].email,
          subject: "Asset Assigned!!!",
          text: `Asset ${result.rows[0].type} - ${result.rows[0].name} is assigned to you on ${result.rows[0].assigned_date}`
        });
        return result.rows[0];
    },
    requestAsset: async (id) => {
        const result = await db.query(`SELECT * FROM assets WHERE id = '${id}' `);
        return "Successfully requested asset!";
    },
    addAsset: async (args) => {
        const result = await db.query(`INSERT INTO assets (type, serial_no, name, version, specifications, condition, assigned_status) 
                        VALUES ('${args.type}', '${args.serial_no}', '${args.name}', '${args.version}', '${args.specifications}', 
                        '${args.condition}', '${args.assigned_status}') RETURNING *`);
        // console.log(result.rows[0]);
        return "Asset Added Successfully";
    },
    deAssignAsset: async (id) => {
        const result = await db.query(`UPDATE assets SET assigned_to = null, assigned_status = 'Available', assigned_date = null, 
                        updated_at = NOW(), return_date = NOW() WHERE id = '${id}' RETURNING *`);
        return result.rowCount > 0 ? "Asset De-Assigned Successfully!" : "Invalid asset de-assigning!";
    }
}