const express = require('express');
const router = express.Router();
const { getUsers, updateRole, deleteUser } = require('../controllers/userController');
const { protect, restrictTo } = require('../middlewares/auth');

router.use(protect, restrictTo('admin'));

router.get('/', getUsers);
router.patch('/:id/role', updateRole);
router.delete('/:id', deleteUser);

module.exports = router;