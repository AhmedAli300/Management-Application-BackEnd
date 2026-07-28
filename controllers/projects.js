const projectModel = require('../models/project');
const taskModel = require('../models/task');
const userModel = require('../models/user');
const ApiError = require('../utils/ApiErrors');

// Create a new project
const createProject = async (req, res, next) => {
    try {
        const { name, description, members } = req.body;
        
        const newProject = await projectModel.create({
            name,
            description,
            creator: req.id,
            members: members || []
        });

        const populatedProject = await projectModel.findById(newProject._id)
            .populate('creator', 'name email role')
            .populate('members', 'name email role');

        // Emit Socket.io real-time event to all connected clients
        const io = req.app.get('io');
        if (io) {
            io.emit('project:created', populatedProject);
        }

        res.status(201).json({ message: 'Project created successfully', data: populatedProject });
    } catch (err) {
        next(err);
    }
};

// Get all projects accessible to the authenticated user (creator or member)
const getProjects = async (req, res, next) => {
    try {
        const query = {
            $or: [
                { creator: req.id },
                { members: req.id }
            ]
        };

        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }

        let projects = await projectModel.find(query)
            .populate('creator', 'name email role')
            .populate('members', 'name email role');

        res.status(200).json({ count: projects.length, data: projects });
    } catch (err) {
        next(err);
    }
};

// Get project details by ID
const getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await projectModel.findById(id)
            .populate('creator', 'name email role')
            .populate('members', 'name email role');

        if (!project) {
            return next(new ApiError(404, 'Project not found'));
        }

        const isCreator = project.creator._id.toString() === req.id;
        const isMember = project.members.some(member => member._id.toString() === req.id);
        const isAdmin = req.role === 'admin';

        if (!isCreator && !isMember && !isAdmin) {
            return next(new ApiError(403, 'Access denied to this project'));
        }

        res.status(200).json({ data: project });
    } catch (err) {
        next(err);
    }
};

// Update project details (Creator or Admin only)
const updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const project = await projectModel.findById(id);

        if (!project) {
            return next(new ApiError(404, 'Project not found'));
        }

        const isCreator = project.creator.toString() === req.id;
        const isAdmin = req.role === 'admin';

        if (!isCreator && !isAdmin) {
            return next(new ApiError(403, 'Only the project creator or an admin can update this project'));
        }

        project.name = name || project.name;
        project.description = description !== undefined ? description : project.description;
        
        await project.save();

        const updatedProject = await projectModel.findById(id)
            .populate('creator', 'name email role')
            .populate('members', 'name email role');

        // Emit Socket.io event
        const io = req.app.get('io');
        if (io) {
            io.emit('project:updated', updatedProject);
        }

        res.status(200).json({ message: 'Project updated successfully', data: updatedProject });
    } catch (err) {
        next(err);
    }
};

// Delete a project and all its associated tasks (Creator or Admin only)
const deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const project = await projectModel.findById(id);

        if (!project) {
            return next(new ApiError(404, 'Project not found'));
        }

        const isCreator = project.creator.toString() === req.id;
        const isAdmin = req.role === 'admin';

        if (!isCreator && !isAdmin) {
            return next(new ApiError(403, 'Only the project creator or an admin can delete this project'));
        }

        await projectModel.findByIdAndDelete(id);
        await taskModel.deleteMany({ project: id });

        // Emit Socket.io event
        const io = req.app.get('io');
        if (io) {
            io.emit('project:deleted', id);
        }

        res.status(200).json({ message: 'Project and all associated tasks deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// Add a member to a project (Creator or Admin only)
const addMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!email) {
            return next(new ApiError(400, 'User email is required to add them as member'));
        }

        const project = await projectModel.findById(id);
        if (!project) {
            return next(new ApiError(404, 'Project not found'));
        }

        const isCreator = project.creator.toString() === req.id;
        const isAdmin = req.role === 'admin';
        if (!isCreator && !isAdmin) {
            return next(new ApiError(403, 'Only the project creator or an admin can manage project members'));
        }

        const userToAdd = await userModel.findOne({ email });
        if (!userToAdd) {
            return next(new ApiError(404, 'User not found with this email'));
        }

        if (project.members.includes(userToAdd._id)) {
            return next(new ApiError(400, 'User is already a member of this project'));
        }

        if (project.creator.toString() === userToAdd._id.toString()) {
            return next(new ApiError(400, 'User is the creator of this project'));
        }

        project.members.push(userToAdd._id);
        await project.save();

        const updatedProject = await projectModel.findById(id)
            .populate('creator', 'name email role')
            .populate('members', 'name email role');

        // Emit Socket.io event
        const io = req.app.get('io');
        if (io) {
            io.emit('project:updated', updatedProject);
        }

        res.status(200).json({ message: 'Member added successfully', data: updatedProject });
    } catch (err) {
        next(err);
    }
};

// Remove a member from a project (Creator or Admin only)
const removeMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return next(new ApiError(400, 'User ID is required to remove them'));
        }

        const project = await projectModel.findById(id);
        if (!project) {
            return next(new ApiError(404, 'Project not found'));
        }

        const isCreator = project.creator.toString() === req.id;
        const isAdmin = req.role === 'admin';
        if (!isCreator && !isAdmin) {
            return next(new ApiError(403, 'Only the project creator or an admin can manage project members'));
        }

        const index = project.members.indexOf(userId);
        if (index === -1) {
            return next(new ApiError(400, 'User is not a member of this project'));
        }

        project.members.splice(index, 1);
        await project.save();

        const updatedProject = await projectModel.findById(id)
            .populate('creator', 'name email role')
            .populate('members', 'name email role');

        // Emit Socket.io event
        const io = req.app.get('io');
        if (io) {
            io.emit('project:updated', updatedProject);
        }

        res.status(200).json({ message: 'Member removed successfully', data: updatedProject });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    removeMember
};
