const express = require('express');
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole } = require('../controllers/role.controller');
const { protect } = require('../middleware/auth.middleware');
// TODO: add authorize middleware for admin

router.use(protect); // All role routes are protected

router.route('/')
  .get(getRoles)
  .post(createRole);

router.route('/:id')
  .put(updateRole)
  .delete(deleteRole);

module.exports = router;
