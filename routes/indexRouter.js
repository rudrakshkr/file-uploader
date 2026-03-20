const { Router } = require("express");
const multer = require("multer");
const { 
    signUpPageGet, 
    signUpPagePost, 
    logInIndexPageGet, 
    uploadFilePost,
    uploadFolderPost,
    openFolderGet,
    authenticateUser, 
    logOutGet 
} = require("../controllers/indexController");

const indexRouter = Router();

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
});
const upload = multer({ storage: storage });

// Routes
indexRouter.get("/", logInIndexPageGet);

indexRouter.post("/upload", upload.single('fileInput'), uploadFilePost);

indexRouter.post("/add-folder", uploadFolderPost);

indexRouter.get("/folder/:id", openFolderGet);

indexRouter.get("/sign-up", signUpPageGet);
indexRouter.post("/sign-up", signUpPagePost);
indexRouter.post("/log-in", authenticateUser);
indexRouter.get("/log-out", logOutGet);

module.exports = indexRouter;