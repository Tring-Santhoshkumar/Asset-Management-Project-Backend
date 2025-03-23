import bcrypt from 'bcryptjs';
import db from './db.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from './Service/Mail/mailer.js';
export const resolvers = {
  Query: {
    users: async () => {
      const result = await db.query("SELECT users.*, assets.id AS asset_id, assets.serial_no AS assetserial_no, assets.type AS assettype, assets.name AS assetname FROM users LEFT JOIN assets ON users.id = assets.assigned_to");
      const resultMap = {};
      result.rows.forEach(row => {
        const { asset_id, assetserial_no, assettype, assetname, ...userData } = row;
        if(!resultMap[row.id]){
          resultMap[row.id] = { ...userData, assigned_assets: [] }
        }
        if(asset_id){  
          resultMap[row.id].assigned_assets.push({ id: asset_id, serial_no: assetserial_no, type: assettype, name: assetname})
        }
      })
      console.log("Processed Users: ", resultMap);
      return Object.values(resultMap);
    },
    user: async (_req, args) => {
      const result = await db.query(`SELECT * FROM users WHERE id = '${args.id}'`);
      return { ...result?.rows[0], dob: result.rows[0].dob ? result.rows[0].dob.toISOString().split("T")[0] : null };
    },
    allAssets: async () => {
      const result = await db.query(`SELECT * FROM assets`);
      // console.log("All assets : ",result.rows);
      return result.rows;
    },
    asset: async (_req, args) => {
      const result = await db.query(`SELECT * FROM assets WHERE id = '${args.id}'`);
      return result.rows[0];
    },
    assetByUserId: async (_req, args) => {
      const result = await db.query(`SELECT * FROM assets WHERE assigned_to = '${args.assigned_to}' `);
      // console.log('as : ',result.rows,result.rowCount);
      return result.rows;
    },
    getNotifications: async () => {
      const result = await db.query("SELECT * FROM notifications ORDER BY created_at DESC");
      // console.log(result.rows);
      return result.rows;
    },
    getNotificationsById: async (_req, args) => {
      const result = await db.query(`SELECT * FROM notifications WHERE user_id = '${args.user_id}' ORDER BY created_at DESC`);
      return result.rows;
    }
  },
  Mutation: {
    register: async (_req, args) => {
      const hashedPassword = await bcrypt.hash(args.password, 10);
      const result = await db.query(`INSERT INTO users (name, email, password, role) VALUES ('${args.name}', '${args.email}', '${hashedPassword}', '${args.role}') RETURNING *`);
      return result.rows[0];
    },
    login: async (_req, args) => {
      const result = await db.query(`SELECT * FROM users WHERE email = '${args.email}'`);
      const user = result.rows[0];
      if (!user) return "No User"
      if (!(await bcrypt.compare(args.password, user.password))) return "Invalid Password";
      const token = jwt.sign({ id: user.id, role: user.role, reset_password: user.reset_password }, process.env.JWT_SECRET_KEY || "your_secret_key", { expiresIn: "1h" });
      if (user.reset_password) {
        await db.query(`UPDATE users SET reset_password = FALSE WHERE id = '${user.id}' `);
      }
      return token;
    },
    changePassword: async (_req, args) => {
      const hashedPassword = await bcrypt.hash(args.password, 10);
      const result = await db.query(`UPDATE users SET password = '${hashedPassword}' WHERE id = '${args.id}' RETURNING *`);
      // console.log("Change Password: ",result.rows[0]);
      if (result.rowCount > 0) {
        return 'Successfully Changed Password!';
      }
      return 'Failed to Change Password.';
    },
    updateUser: async (_req, args) => {
      const result = await db.query(`UPDATE users SET name = '${args.name}', email = '${args.email}', profile_pic = '${args.profile_pic}' , dob = '${args.dob}', gender = '${args.gender}', 
            blood_group = '${args.blood_group}', marital_status = '${args.marital_status}', phone = '${args.phone}', address = '${args.address}', designation = '${args.designation}',
            department = '${args.department}', city = '${args.city}', state = '${args.state}', pin_code = '${args.pin_code}', country = '${args.country}' WHERE id = '${args.id}' RETURNING *`)
      // console.log(result.rows[0]);
      return result.rows[0];
    },
    assignAsset: async (_req, args) => {
      try {
        const result = await db.query(`UPDATE assets SET assigned_to = '${args.assigned_to}', assigned_status = 'Assigned', assigned_date =  NOW() WHERE id = '${args.id}' RETURNING *`);
        // console.log("res : ",result.rows[0]);
        const user = await db.query(`SELECT email FROM users WHERE id = '${args.assigned_to}' `);
        //   // console.log(`Asset ${user.rows[0].email} `);
        await sendEmail({
          to: user.rows[0].email,
          subject: 'Asset Assigned!!!',
          text: `Asset ${result.rows[0].type} - ${result.rows[0].name} is assigned to you on ${result.rows[0].assigned_date}`
        });
        return result.rows[0];
      }
      catch (error) {
        console.error("Error in assignAsset:", error);
        throw new Error("Failed to assign asset.");
      }
    },
    requestAsset: async (_req, args) => {
      try {
        const result = await db.query(`SELECT * FROM assets WHERE id = '${args.id}' `);
        // console.log(result.rows[0]);
        return 'Successfully requested asset!';
      }
      catch (error) {
        throw new Error("Failed to request asset.");
      }
    },
    addAsset: async (_req, args) => {
      try {
        const result = await db.query(`INSERT INTO assets (type, serial_no, name, version, specifications, condition, assigned_status) VALUES ('${args.type}', '${args.serial_no}', '${args.name}', '${args.version}', '${args.specifications}', '${args.condition}', '${args.assigned_status}') RETURNING * `);
        // console.log(result.rows[0]);
        return 'Asset Added Successfully';
      }
      catch (error) {
        throw new Error(error);
      }
    },
    addUser: async (_req, args) => {
      try {
        const alreadyExist = await db.query(`SELECT * FROM users WHERE email = '${args.email}' `)
        // console.log("Received Data:", args.name, args.email, args.role);
        if (alreadyExist.rowCount > 0) {
          throw new Error('User is already exists.');
        }
        const temporaryPassword = 'Santhosh@123';
        const hashedTempPassword = await bcrypt.hash(temporaryPassword, 10);
        await sendEmail({
          to: args.email,
          subject: "Your Temporary Password",
          html: `<p>Hi ${args.name},</p>
                 <p>Your account has been created. Here is your temporary password: <strong>${temporaryPassword}</strong></p>
                 <p>Please log in and change your password.</p>`,
        });
        const result = await db.query(`INSERT INTO users (name,email,password,role,created_at,updated_at) VALUES ('${args.name}', '${args.email}', '${hashedTempPassword}', '${args.role}', NOW(), NOW()) RETURNING *`);
        // console.log(result.rows[0]);
        return 'User added successfully!!!';
      }
      catch (error) {
        throw new Error(error);
      }
    },
    deleteUser: async (_req, args) => {
      try {
        const result = await db.query(`UPDATE users SET status = 'Inactive',deleted_at = NOW() WHERE id = '${args.id}' RETURNING *`);
        // console.log('DELETE : ',result.rows[0]);
        return 'User Deleted Successfully!';
      }
      catch (error) {
        throw new Error(error);
      }
    },
    deAssignAsset: async (_req, args) => {
      try {
        const result = await db.query(`UPDATE assets SET assigned_to = null, assigned_status = 'Available', assigned_date = null, updated_at = NOW(), return_date = NOW() WHERE id = '${args.id}' RETURNING *`);
        // console.log(result.rows[0]);
        return 'Asset De-Assigned Successfully!';
      }
      catch (error) {
        throw new Error(error);
      }
    },
    createNotification: async (_, { user_id, asset_id, message }) => {
      const result = await db.query("INSERT INTO notifications (user_id, asset_id, message) VALUES ($1, $2, $3) RETURNING *", [user_id, asset_id, message]);
      return result.rows[0];
    },
    readNotifications: async (_, { id, choice }) => {
      try {
        const result = await db.query(`SELECT * FROM notifications WHERE id = '${id}'`);
        const asset = await db.query(`UPDATE assets SET assigned_to = '${result.rows[0].user_id}', assigned_status = 'Assigned', assigned_date =  NOW() WHERE id = '${result.rows[0].asset_id}' RETURNING *`);
        const user = await db.query(`SELECT email FROM users WHERE id = '${asset.rows[0].assigned_to}'`);
        if (choice) {
          await sendEmail({
            to: user.rows[0].email,
            subject: 'Your Requested Asset Assigned Succesfully!!!',
            text: `Asset ${asset.rows[0].type} - ${asset.rows[0].name} is assigned to you on ${asset.rows[0].assigned_date} as per your request`
          });
          await db.query(`UPDATE notifications set is_read = true WHERE id = '${id}'`);
          return 'Successfully Approved!';
        }
        await sendEmail({
          to: user.rows[0].email,
          subject: 'Your Request for Asset!!!',
          text: `Sorry, your requested asset is not assigned to you as per the process.Please, find any other asset or will get to you soon!`
        });
        await db.query(`UPDATE notifications set is_read = true WHERE id = '${id}'`);
        return 'Succesfully Rejected!';
      } catch (error) {
        throw new Error(error);
      }
    }
  }
}