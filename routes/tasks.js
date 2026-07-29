const express = require('express');
const router = express.Router();
const { auth } = require('../mddilewares/auth');
const {createTask,getTasks,getTaskById,updateTask,deleteTask } = require('../controllers/tasks');

router.use(auth);

router.route('/').get(getTasks).post(createTask);

router.route('/:id').get(getTaskById).patch(updateTask).delete(deleteTask);

module.exports = router;
