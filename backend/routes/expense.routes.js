const express = require('express');
const router = express.Router();
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
} = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all endpoints in this router using the existing JWT authentication middleware
router.use(protect);

// RESTful routes for Expense CRUD
router.post('/', createExpense);
router.get('/', getAllExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
