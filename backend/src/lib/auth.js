import "dotenv/config";

import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI);
export const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  plugins: [
    bearer(),
  ],

user: {
  additionalFields: {
    role: {
      type: ["user", "admin"],
      required: false,
      defaultValue: "user",
      input: false,
    },

    phoneNumber: {
      type: "string",
      required: false,
      input: true,
    },

    dateOfBirth: {
      type: "string",
      required: false,
      input: true,
    },
  },
},

  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: [
    process.env.FRONTEND_URL,
  ],
});