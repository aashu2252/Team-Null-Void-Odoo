const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
// require authorize

router.use(protect);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
