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
                const user = await db.query(`SELECT email FROM users WHERE id = '${asset.rows[0].assigned_to}'`);
                await db.query(`UPDATE notifications set is_read = true WHERE id = '${id}'`);
                await sendEmail({
                    to: user.rows[0].email,
                    subject: 'Your Requested Asset Assigned Succesfully!!!',
                    text: `Asset ${asset.rows[0].type} - ${asset.rows[0].name} is assigned to you on ${asset.rows[0].assigned_date} as per your request`
                });
                return 'Successfully Approved!';
            }
            else {
                const user = await db.query(`SELECT email FROM users WHERE id = '${result.rows[0].user_id}'`);
                await db.query(`UPDATE notifications set is_read = true WHERE id = '${id}'`);
                await sendEmail({
                    to: user.rows[0].email,
                    subject: 'Your Request for Asset!!!',
                    text: `Sorry, your requested asset is not assigned to you as per the process.Please, find any other asset or will get to you soon!`
                });
                return 'Succesfully Rejected!';
            }
        }
        catch (error) {
            throw new Error(error);
        }
    }
}