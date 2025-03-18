import bcrypt from 'bcryptjs';
import db from '../../db.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../Mail/mailer.js';

export const userService = {
    getAllUsers: async () => {
        const result = await db.query("SELECT * FROM users");
        return result.rows;
    },
    getUserById: async (id) => {
        const result = await db.query(`SELECT * FROM users WHERE id = '${id}'`);
        return { ...result?.rows[0], dob: result.rows[0].dob ? result.rows[0].dob.toISOString().split("T")[0] : null };
    },
    registerUser: async (name, email, password, role) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(`INSERT INTO users (name, email, password, role) VALUES ('${name}', '${email}', '${hashedPassword}', '${role}') RETURNING *`);
        return result.rows[0];
    },
    loginUser: async (email, password) => {
        const result = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
        const user = result.rows[0];
        if (!user) return "No User";
        if (!(await bcrypt.compare(password, user.password))) return "Invalid Password";
        const token = jwt.sign({ id: user.id, role: user.role, reset_password: user.reset_password }, process.env.JWT_SECRET_KEY || "your_secret_key", { expiresIn: "1h" });
        if (user.reset_password) {
            await db.query(`UPDATE users SET reset_password = FALSE WHERE id = '${user.id}' `);
        }
        return token;
    },
    changePassword: async (id, password) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(`UPDATE users SET password = '${hashedPassword}' WHERE id = '${id}' RETURNING *`);
        return result.rowCount > 0 ? "Successfully Changed Password!" : "Failed to Change Password.";
    },
    addUser: async (name, email, role) => {
        try {
            const alreadyExist = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
            if (alreadyExist.rowCount > 0) {
                throw new Error('User already exists.');
            }
            const temporaryPassword = 'Santhosh@123';
            const hashedTempPassword = await bcrypt.hash(temporaryPassword, 10);
            await sendEmail({
                to: email,
                subject: "Your Temporary Password",
                html: `<p>Hi ${name},</p>
                   <p>Your account has been created. Here is your temporary password: <strong>${temporaryPassword}</strong></p>
                   <p>Please log in and change your password.</p>`,
            });
            const result = await db.query(`INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES ('${name}', '${email}', '${hashedTempPassword}', '${role}', NOW(), NOW()) RETURNING *`);
            return "User added successfully!";
        }
        catch (error) {
            throw new Error(error.message);
        }
    },
    updateUser: async (args) => {
        const result = await db.query(`UPDATE users SET name = '${args.name}', email = '${args.email}', profile_pic = '${args.profile_pic}', 
                        dob = '${args.dob}', gender = '${args.gender}', blood_group = '${args.blood_group}', marital_status = '${args.marital_status}', 
                        phone = '${args.phone}', address = '${args.address}', designation = '${args.designation}', department = '${args.department}',
                        city = '${args.city}', state = '${args.state}', pin_code = '${args.pin_code}', country = '${args.country}' WHERE id = '${args.id}' RETURNING *`);
        return result.rows[0];
    },
    deleteUser: async (id) => {
        const result = await db.query(`UPDATE users SET status = 'Inactive', deleted_at = NOW() WHERE id = '${id}' RETURNING *`);
        return result.rowCount > 0 ? "User Deleted Successfully!" : "Failed to Delete User.";
    }
}