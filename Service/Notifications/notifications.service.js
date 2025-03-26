import db from '../../db.js';
import { sendEmail } from '../Mail/mailer.js';

export const notificationService = {
    getAllNotifications: async () => {
        const result = await db.query("SELECT * FROM notifications ORDER BY created_at DESC");
        return result.rows;
    },
    getAllNotificationsById: async (user_id) => {
        const result = await db.query(`SELECT * FROM notifications WHERE user_id = '${user_id}' ORDER BY created_at DESC`);
        return result.rows;
    },
    getCreateNotification: async (user_id, asset_id, message) => {
        const result = await db.query("INSERT INTO notifications (user_id, asset_id, message) VALUES ($1, $2, $3) RETURNING *", [user_id, asset_id, message]);
        return result.rows[0];
    },
    getReadNotifications: async (id, choice) => {
        try {
            const result = await db.query(`SELECT * FROM notifications WHERE id = '${id}'`);
            if (choice) {
                const asset = await db.query(`UPDATE assets SET assigned_to = '${result.rows[0].user_id}', assigned_status = 'Assigned', assigned_date =  NOW() WHERE id = '${result.rows[0].asset_id}' RETURNING *`);
                const user = await db.query(`SELECT * FROM users WHERE id = '${asset.rows[0].assigned_to}'`);
                await db.query(`UPDATE notifications set is_read = true, approved = true WHERE id = '${id}'`);
                await sendEmail({
                    to: user.rows[0].email,
                    subject: 'Your Requested Asset Assigned Succesfully!!!',
                    html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #28a745;">Asset Request Approved</h2>
                    <p>Dear ${user.rows[0].name},</p>
                    <p>We are pleased to inform you that your requested asset has been successfully assigned to you.</p>
                    <h3>Asset Details:</h3>
                    <p><strong>Type:</strong> ${asset.rows[0].type}</p>
                    <p><strong>Name:</strong> ${asset.rows[0].name}</p>
                    <p><strong>Assigned Date:</strong> ${asset.rows[0].assigned_date}</p>
                    <p>Please ensure proper handling of this asset as per company policies.</p><hr/>
                    <p>Best regards,</p>
                    <p><strong>Tringapps Research Labs Pvt Ltd</strong></p>
                    <p>Email: <a href="mailto:${process.env.ADMIN_EMAIL}">${process.env.ADMIN_EMAIL}</a></p></div>`
                });
                return 'Successfully Approved!';
            }
            else {
                const user = await db.query(`SELECT * FROM users WHERE id = '${result.rows[0].user_id}'`);
                await db.query(`UPDATE notifications set is_read = true, rejected = true WHERE id = '${id}'`);
                await sendEmail({
                    to: user.rows[0].email,
                    subject: 'Your Request for Asset!!!',
                    html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #d9534f;">Asset Request Not Approved</h2>
                    <p>Dear ${user.rows[0].name},</p>
                    <p>We regret to inform you that your requested asset could not be assigned at this time.</p>
                    <p>Our team is reviewing the availability of assets, and we will update you as soon as possible. In the meantime, please consider requesting an alternative asset or reaching out to the IT department for further assistance.</p>
                    <p>We appreciate your understanding.</p><hr/>
                    <p>Best regards,</p>
                    <p><strong>Tringapps Research Labs Pvt Ltd</strong></p>
                    <p>Email:<a href="mailto:${process.env.ADMIN_EMAIL}">${process.env.ADMIN_EMAIL}</a></p></div>`
                });
                return 'Succesfully Rejected!';
            }
        }
        catch (error) {
            throw new Error(error);
        }
    }
}