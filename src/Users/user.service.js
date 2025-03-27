import bcrypt from 'bcryptjs';
import db from '../DBConfig/db.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/Mail/mailer.js';
import { generatePassword } from '../utils/Password/generatePassword.js';
import dotenv from 'dotenv';
dotenv.config();

export const userService = {
    getAllUsers: async () => {
        try{
            const result = await db.query("SELECT users.*, assets.id AS asset_id, assets.serial_no AS assetserial_no, assets.type AS assettype, assets.name AS assetname FROM users LEFT JOIN assets ON users.id = assets.assigned_to");
            const resultMap = {};
            result.rows.forEach(row => {
                const { asset_id, assetserial_no, assettype, assetname, ...userData } = row;
                if (!resultMap[row.id]) {
                    resultMap[row.id] = { ...userData, assigned_assets: [] }
                }
                if(asset_id) {
                    resultMap[row.id].assigned_assets.push({ id: asset_id, serial_no: assetserial_no, type: assettype, name: assetname })
                }
            })
            return Object.values(resultMap);
        }
        catch(error){
            throw new Error(error);
        }
    },
    getUserById: async (id) => {
        try{
            const result = await db.query(`SELECT * FROM users WHERE id = '${id}'`);
            if(result.rowCount === 0) {
                throw new Error("User not found");
            }
            return { ...result?.rows[0], dob: result.rows[0].dob ? result.rows[0].dob.toISOString().split("T")[0] : null };
        }catch(error){
            throw new Error(`Error in getUserById: ${error.message}`)
        }
    },
    registerUser: async (name, email, password, role) => {
        try{
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await db.query(`INSERT INTO users (name, email, password, role) VALUES ('${name}', '${email}', '${hashedPassword}', '${role}') RETURNING *`);
            return result.rows[0];
        }
        catch(error){
            throw new Error(`Error in registerUser: ${error.message}`);
        }
    },
    loginUser: async (email, password) => {
        try{
            const result = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
            const user = result.rows[0];
            // if (!user) return "No User";
            // if (!(await bcrypt.compare(password, user.password))) return "Invalid Password";
            // if (user.status == 'Inactive') return "Inactive User";
            // console.log(user?.status === 'Inactive' ? "Inactive User" : (!user? "No User" : 'Invalid Password'));
            if(user?.status === 'Inactive' || !user || !(await bcrypt.compare(password, user.password))){
                return !user ? 'No User' : user.status === 'Inactive' ? "Inactive User" : 'Invalid Password';
            }
            const token = jwt.sign({ id: user.id, role: user.role, reset_password: user.reset_password }, process.env.JWT_SECRET_KEY || "your_secret_key", { expiresIn: "1h" });
            if (user.reset_password) {
                await db.query(`UPDATE users SET reset_password = FALSE WHERE id = ${user.id} `);
            }
            return token;
        }
        catch(error){
            throw new Error(`Error in loginUser: ${error.message}`);
        }
    },
    changePassword: async (id, password) => {
        try{
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await db.query(`UPDATE users SET password = '${hashedPassword}' WHERE id = '${id}' RETURNING *`);
            return result.rowCount > 0 ? "Successfully Changed Password!" : "Failed to Change Password.";
        }catch(error){
            throw new Error(`Error in changePassword: ${error.message}`);
        }
    },
    addUser: async (name, email, role) => {
        try {
            const alreadyExist = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
            if (alreadyExist.rowCount > 0) {
                throw new Error('User already exists.');
            }
            const temporaryPassword = generatePassword();
            const hashedTempPassword = await bcrypt.hash(temporaryPassword, 10);
            await sendEmail({
                to: email,
                subject: "Your Temporary Password",
                html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #0056b3;">Welcome to Tringapps!</h2>
                <p>Dear ${name},</p>
                <p>We are pleased to inform you that your account has been successfully created on our system.</p>
                <h3>Your Account Details:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> <i>${temporaryPassword}</i></p>
                <p>For security reasons, we strongly recommend that you log in and update your password immediately.</p>
                <h3>How to Log In:</h3>
                <p>Go to our login page: <a href=${process.env.LOGIN_URL} style="color: #0056b3;">Login</a></p>
                <p>Enter your email and the temporary password provided above.</p>
                <p>Follow the on-screen instructions to set up a new password.</p>
                <p>If you did not request this account, please contact our support team immediately.</p>
                <hr />
                <p>Best regards,</p>
                <p><strong>Tringapps Research Labs Pvt Ltd</strong></p>
                <p>Email: <a href="mailto:${process.env.ADMIN_EMAIL}">${process.env.ADMIN_EMAIL}</a></p>
                </div>`
            });
            const result = await db.query(`INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES ('${name}', '${email}', '${hashedTempPassword}', '${role}', NOW(), NOW()) RETURNING *`);
            if(result.rowCount == 0){
                throw new Error('Failed to add user');
            }
            return "User added successfully!";
        }
        catch(error){
            throw new Error(error.message);
        }
    },
    updateUser: async (args) => {
        try{
            const result = await db.query(`UPDATE users SET name = '${args.name}', email = '${args.email}', dob = '${args.dob}',
                        gender = '${args.gender}', blood_group = '${args.blood_group}', marital_status = '${args.marital_status}', 
                        phone = '${args.phone}', address = '${args.address}', designation = '${args.designation}', department = '${args.department}',
                        city = '${args.city}', state = '${args.state}', pin_code = '${args.pin_code}', country = '${args.country}' WHERE id = '${args.id}' RETURNING *`);
            if(result.rowCount == 0){
                throw new Error("User not found in update");
            }
            return result.rows[0];
        }
        catch(error){
            throw new Error(error);
        }
    },
    deleteUser: async (id) => {
        const result = await db.query(`UPDATE users SET status = 'Inactive', deleted_at = NOW() WHERE id = '${id}' RETURNING *`);
        await sendEmail({
            to: result.rows[0].email,
            subject: " Your Account Has Been Deleted",
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #d9534f;">Important Notice: Account Deletion</h2>
            <p>Dear ${result.rows[0].name},</p>
            <p>We regret to inform you that your account with <strong>Tringapps</strong> has been deleted by an administrator. As a result, you will no longer have access to our services.</p>
            <p>If you believe this was done in error or require further assistance, please contact our support team.</p><hr />
            <p>Best regards,</p>
            <p><strong>Tringapps Research Labs Pvt Ltd</strong></p>
            <p>Email: <a href="mailto:${process.env.ADMIN_EMAIL}">${process.env.ADMIN_EMAIL}</a></p>
            </div>`,
        });
        return result.rowCount > 0 ? "User Deleted Successfully!" : "Failed to Delete User.";
    }
}