import bcrypt from 'bcryptjs';
import db from './db.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from './mailer.js';
export const resolvers = {
  Query: {
    users: async () => {
      const result = await db.query("SELECT * FROM users");
      return result.rows;
    },
    user: async (_req, args) => {
      const result = await db.query(`SELECT * FROM users WHERE id = '${args.id}'`);
      // console.log("User Data : ", result.rows[0]);
      return { ...result.rows[0], dob: result.rows[0].dob ? result.rows[0].dob.toISOString().split("T")[0] : null };
    },
    allAssets: async () => {
      const result = await db.query(`SELECT * FROM assets`);
      // console.log("All assets : ",result.rows);
      return result.rows;
    },
    asset: async (_req, args) => {
      const result = await db.query(`SELECT * FROM assets WHERE id = '${args.id}'`);
      return result.rows[0];
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
      return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET_KEY || "your_secret_key", { expiresIn: "1h" });
    },
    updateUser: async (_req, args) => {
      const result = await db.query(`UPDATE users SET name = '${args.name}', email = '${args.email}', profile_pic = '${args.profile_pic}' , dob = '${args.dob}', gender = '${args.gender}', 
            blood_group = '${args.blood_group}', marital_status = '${args.marital_status}', phone = '${args.phone}', address = '${args.address}', designation = '${args.designation}',
            department = '${args.department}', city = '${args.city}', state = '${args.state}', pin_code = '${args.pin_code}', country = '${args.country}' WHERE id = '${args.id}' RETURNING *`)
      console.log(result.rows[0]);
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
      catch(error){
        console.error("Error in assignAsset:", error);
        throw new Error("Failed to assign asset.");
      }
    },
    addAsset: async (_req, args) => {
      try{
        const result = await db.query(`INSERT INTO assets (type, serial_no, name, version, specifications, condition, assigned_status) VALUES ('${args.type}', '${args.serial_no}', '${args.name}', '${args.version}', '${args.specifications}', '${args.condition}', '${args.assigned_status}') RETURNING * `);
        console.log(result.rows[0]);
        return 'Asset Added Successfully';
      }
      catch(error){
        throw new Error(error);
      }
    }
  }
}