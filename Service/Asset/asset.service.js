import db from '../../db.js';
import { sendEmail } from '../Mail/mailer.js';
import dotenv from 'dotenv';
dotenv.config();

export const assetService = {
    getAllAssets: async () => {
        const result = await db.query("SELECT * FROM assets WHERE deleted_at IS NULL");
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
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #0056b3;">Asset Assigned to You</h2>
          <p>Dear ${user.rows[0].name},</p>
          <p>We are pleased to inform you that a new asset has been assigned to you.</p>
          <h3>Asset Details:</h3>
          <p><strong>Type:</strong> ${result.rows[0].type}</p>
          <p><strong>Name:</strong> ${result.rows[0].name}</p>
          <p><strong>Assigned Date:</strong> ${result.rows[0].assigned_date}</p>
          <p>Please ensure proper usage and care of this asset.</p><hr />
          <p>Best regards,</p>
          <p><strong>Tringapps Research Labs Pvt Ltd</strong></p>
          <p>Email: <a href="mailto:${process.env.ADMIN_EMAIL}">${process.env.ADMIN_EMAIL}</a></p></div>`
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
    deleteAsset: async (id) => {
        const asset = await db.query(`SELECT * FROM assets WHERE id = '${id}' AND assigned_status = 'Assigned'`);
        if(asset.rowCount > 0){
            const user = await db.query(`SELECT email FROM users WHERE id = '${asset.rows[0].assigned_to}' `);
            await sendEmail({
                to: user.rows[0].email,
                subject: `Assigned Asset is removed`,
                html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #d9534f;">Assigned Asset Removed</h2>
                <p>Dear ${user.rows[0].name},</p>
                <p>We want to inform you that an asset previously assigned to you has been removed from the organization.</p>
                <h3>Asset Details:</h3>
                <p><strong>Serial Number:</strong> ${asset.rows[0].serial_no}</p>
                <p><strong>Type:</strong> ${asset.rows[0].type}</p>
                <p><strong>Name:</strong> ${asset.rows[0].name}</p>
                <p>If you have any questions regarding this change, please contact the IT department or your administrator.</p>\
                <hr />
                <p>Best regards,</p>
                <p><strong>Tringapps Research Labs Pvt Ltd</strong></p>
                <p>Email: <a href="mailto:${process.env.ADMIN_EMAIL}">${process.env.ADMIN_EMAIL}</a></p>
                </div>`
            })
        }
        const res = await db.query(`UPDATE assets SET deleted_at = NOW(), assigned_to = NULL, assigned_status = NULL WHERE id ='${id}' RETURNING *`);
        console.log("Datas",res.rows[0]);
        return 'Asset Deleted Successfully';
    },
    deAssignAsset: async (id) => {
        const result = await db.query(`UPDATE assets SET assigned_to = null, assigned_status = 'Available', assigned_date = null, 
                        updated_at = NOW(), return_date = NOW() WHERE id = '${id}' RETURNING *`);
        return result.rowCount > 0 ? "Asset De-Assigned Successfully!" : "Invalid asset de-assigning!";
    }
}