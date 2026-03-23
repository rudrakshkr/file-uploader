const { Router } = require("express");
const { 
    signUpPageGet, 
    signUpPagePost, 
    logInIndexPageGet, 
    uploadFilePost,
    downloadFileGet,
    uploadFolderPost,
    openFolderGet,
    shareFolderPost,
    accessShareFolderGet,
    deleteFolderPost,
    deleteFilePost,
    authenticateUser, 
    logOutGet 
} = require("../controllers/indexController");

const indexRouter = Router();

// Auth middleware function
function requireAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next(); 
    }
    // Kick unauthenticated users back to the root route (your login page)
    res.redirect('/'); 
}

// uploadMiddleware
const uploadMiddleware = require("../uploadMiddleware");

// Initialise the middleware and pass folder name as argument
const upload = uploadMiddleware("uploads")


// --------------------------------------- ROUTES -------------------------------------------------------

// Log In Page
indexRouter.get("/", logInIndexPageGet);


// Protected Routes
indexRouter.post("/upload", requireAuth, upload.single('fileInput'), uploadFilePost);
indexRouter.post("/file/:id/delete", requireAuth, deleteFilePost);
indexRouter.get("/file/:id/download", requireAuth, downloadFileGet);

indexRouter.post("/add-folder", requireAuth, uploadFolderPost);
indexRouter.post("/folder/share", requireAuth, shareFolderPost);
indexRouter.get("/folder/:id", requireAuth, openFolderGet);
indexRouter.post("/folder/:id/delete", requireAuth, deleteFolderPost);

indexRouter.get("/log-out", requireAuth, logOutGet);


// Public Routes
indexRouter.get("/shared/folder/:token", accessShareFolderGet);
indexRouter.get("/sign-up", signUpPageGet);
indexRouter.post("/sign-up", signUpPagePost);
indexRouter.post("/log-in", authenticateUser);

module.exports = indexRouter;