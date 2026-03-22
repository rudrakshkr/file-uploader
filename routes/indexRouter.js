const { Router } = require("express");
const multer = require("multer");
const { 
    signUpPageGet, 
    signUpPagePost, 
    logInIndexPageGet, 
    uploadFilePost,
    downloadFileGet,
    uploadFolderPost,
    openFolderGet,
    deleteFolderPost,
    deleteFilePost,
    authenticateUser, 
    logOutGet 
} = require("../controllers/indexController");

const indexRouter = Router();

// uploadMiddleware
const uploadMiddleware = require("../uploadMiddleware");

// Initialise the middleware and pass folder name as argument
const upload = uploadMiddleware("uploads")

// Routes
indexRouter.get("/", logInIndexPageGet);

indexRouter.post("/upload", upload.single('fileInput'), uploadFilePost);
indexRouter.post("/file/:id/delete", deleteFilePost);
indexRouter.get("/file/:id/download", downloadFileGet);

indexRouter.post("/add-folder", uploadFolderPost);

indexRouter.get("/folder/:id", openFolderGet);
indexRouter.post("/folder/:id/delete", deleteFolderPost);

indexRouter.get("/sign-up", signUpPageGet);
indexRouter.post("/sign-up", signUpPagePost);
indexRouter.post("/log-in", authenticateUser);
indexRouter.get("/log-out", logOutGet);

module.exports = indexRouter;