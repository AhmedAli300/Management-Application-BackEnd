const express = require('express');
const router = express.Router();
const { auth } = require('../mddilewares/auth');
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    removeMember
} = require('../controllers/projects');

// All project routes require authentication
router.use(auth);

router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:id')
    .get(getProjectById)
    .patch(updateProject)
    .delete(deleteProject);

router.route('/:id/members')
    .post(addMember)
    .delete(removeMember);

module.exports = router;
