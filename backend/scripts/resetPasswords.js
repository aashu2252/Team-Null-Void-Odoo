require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');

// ── CONFIG ──────────────────────────────────────────
// Set the email(s) you want to reset and the new password
const RESET_TARGETS = [
  { email: 'pawan2@gmail.com',  newPassword: 'Password123!' },
  { email: 'gautam@gmail.com',  newPassword: 'Password123!' },
  { email: 'aashu@gmail.com',   newPassword: 'Password123!' },
];
// ─────────────────────────────────────────────────────

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');

  for (const target of RESET_TARGETS) {
    const user = await User.findOne({ email: target.email });
    if (!user) {
      console.log(`[SKIP] ${target.email} — user not found`);
      continue;
    }
    user.password = target.newPassword; // pre-save hook will bcrypt this
    await user.save();
    console.log(`[RESET] ${target.email} — password reset to "${target.newPassword}" (hashed via bcrypt)`);
  }

  console.log('\nDone! All specified passwords have been reset.');
  process.exit(0);
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
