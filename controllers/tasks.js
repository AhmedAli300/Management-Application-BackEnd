const taskModel = require('../models/task');
const projectModel = require('../models/project');
const ApiError = require('../utils/ApiErrors');

// Helper to populate task references
const populateTask = (query) => {
    return query
        .populate('creator', 'name email role')
        .populate('assignee', 'name email role');
};

// Verify user has access to the project (is creator or member, or admin)
const checkProjectAccess = async (projectId, userId, userRole) => {
    if (userRole === 'admin') return true;

    const project = await projectModel.findById(projectId);
    if (!project) return false;

    const isCreator = project.creator.toString() === userId;
    const isMember = project.members.some(memberId => memberId.toString() === userId);

    return isCreator || isMember;
};

// Create a new task
const createTask = async (req, res, next) => {
    try {
        const { title, description, status, priority, dueDate, assignee, project: projectId } = req.body;

        if (!projectId) {
            return next(new ApiError(400, 'Project ID is required to create a task'));
        }

        // Verify project access
        const hasAccess = await checkProjectAccess(projectId, req.id, req.role);
        if (!hasAccess) {
            return next(new ApiError(403, 'Access denied: You do not have permission to add tasks to this project'));
        }

        let newTask = await taskModel.create({
            title,
            description,
            status,
            priority,
            dueDate,
            assignee,
            project: projectId,
            creator: req.id
        });

        
        newTask = await populateTask(taskModel.findById(newTask._id));

        // Emit Socket.io real-time event
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${projectId}`).emit('task:created', newTask);
        }

        res.status(201).json({ message: 'Task created successfully', data: newTask });
    } catch (err) {
        next(err);
    }
};

// Get all tasks in a project (with filtering, sorting, and search)
const getTasks = async (req, res, next) => {
    try {
        const { project: projectId, status, priority, assignee, search } = req.query;

        if (!projectId) {
            return next(new ApiError(400, 'Project ID is required as a query parameter'));
        }

        // Verify project access
        const hasAccess = await checkProjectAccess(projectId, req.id, req.role);
        if (!hasAccess) {
            return next(new ApiError(403, 'Access denied: You do not have access to this project'));
        }

        // Build search query
        const query = { project: projectId };

        if (status) {
            query.status = status;
        }
        if (priority) {
            query.priority = priority;
        }
        if (assignee) {
            query.assignee = assignee;
        }
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const tasks = await populateTask(taskModel.find(query).sort({ createdAt: -1 }));

        res.status(200).json({ count: tasks.length, data: tasks });
    } catch (err) {
        next(err);
    }
};

// Get task details by ID
const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await taskModel.findById(id);

        if (!task) {
            return next(new ApiError(404, 'Task not found'));
        }

        // Verify access to project containing this task
        const hasAccess = await checkProjectAccess(task.project, req.id, req.role);
        if (!hasAccess) {
            return next(new ApiError(403, 'Access denied: You do not have access to this task'));
        }

        const populatedTask = await populateTask(taskModel.findById(id));
        res.status(200).json({ data: populatedTask });
    } catch (err) {
        next(err);
    }
};

// Update task details
const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        let task = await taskModel.findById(id);
        if (!task) {
            return next(new ApiError(404, 'Task not found'));
        }

        // Verify access to project containing this task
        const hasAccess = await checkProjectAccess(task.project, req.id, req.role);
        if (!hasAccess) {
            return next(new ApiError(403, 'Access denied: You do not have permission to modify this task'));
        }

        // Protect key fields
        delete updates.project;
        delete updates.creator;

        // Perform updates
        const updatedTask = await populateTask(
            taskModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        );

        // Emit Socket.io real-time event
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${task.project}`).emit('task:updated', updatedTask);
        }

        res.status(200).json({ message: 'Task updated successfully', data: updatedTask });
    } catch (err) {
        next(err);
    }
};

// Delete a task
const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;

        const task = await taskModel.findById(id);
        if (!task) {
            return next(new ApiError(404, 'Task not found'));
        }

        // Verify access to project containing this task
        const hasAccess = await checkProjectAccess(task.project, req.id, req.role);
        if (!hasAccess) {
            return next(new ApiError(403, 'Access denied: You do not have permission to delete this task'));
        }

        await taskModel.findByIdAndDelete(id);

        // Emit Socket.io real-time event
        const io = req.app.get('io');
        if (io) {
            io.to(`project:${task.project}`).emit('task:deleted', id);
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};
