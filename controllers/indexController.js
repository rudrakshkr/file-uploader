const pool = require("../config/pool");
const bcrypt = require("bcryptjs");
const {body, validationResult, matchedData} = require("express-validator");
const passport = require("passport");
const crypto = require("crypto");

const CustomNotFoundError = require("../errors/CustomNotFoundError");

const prisma = require("../lib/prisma.cjs");
const { parse } = require("dotenv");
require("dotenv");
async function logInIndexPageGet(req, res, next) {
    try {

        if (!req.user) {
            return res.render("index");
        }
        const userId = req.user.id;

        const folders = await prisma.folders.findMany({
            where: {userId: userId}
        })

        const files = await prisma.files.findMany({
            where: {
                userId: userId,
                folderId: null,
            },
        });

        const formattedFiles = files.map(file => {
            const d = file.date;
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();

            return {
                ...file,
                displayDate: `${dd}/${mm}/${yyyy}`
            };
        });

        res.render("index", {
            user: req.user,
            folders: folders,
            files: formattedFiles,
            currentFolder: "My Drive",
            currentFolderId: null
        });

    } catch(err) {
        return next(err);
    }
}

async function uploadFolderPost(req, res, next) {
    try {
        await prisma.folders.create({
            data: {
                name: req.body.folderInput,
                userId: req.user.id
            }
        })

        res.redirect("/");
    }
    catch(err) {
        return next(err);
    }
}

async function uploadFilePost(req, res, next) {
    try {
        const folderId = req.body.folderId;
        if (req.file) {
            console.log(req.file);
            await prisma.files.create({
                data: {
                    originalName: req.file.originalname,
                    size: req.file.size,
                    path: req.file.path,
                    userId: req.user.id,
                    folderId: folderId ? parseInt(folderId) : null,
                }
            })
        }

        if(folderId !== '') {
            res.redirect(`/folder/${folderId}`);
        }
        else {
            res.redirect("/");
        } 
    } catch (err) {
        return next(err);
    }
}

async function downloadFileGet(req, res, next) {
    try {
        const fileId = parseInt(req.params.id);

        const file = await prisma.files.findFirst({
            where: {
                id: fileId,
                userId: req.user.id
            }
        });

        if (!file) {
            throw new CustomNotFoundError("File not found.");
        }

        const downloadUrl = file.path.replace('/upload/', '/upload/fl_attachment/');

        res.redirect(downloadUrl);
    }
    catch(err) {
        return next(err);
    }
}

async function openFolderGet(req, res, next) {
    try {
        const folderId = parseInt(req.params.id);
        const userId = req.user.id
        
        const folders = await prisma.folders.findMany({
            where: {userId: userId}
        })

        const files = await prisma.files.findMany({
            where: {
                userId: userId,
                folderId: folderId,
            },
        });

        const activeFolder = await prisma.folders.findFirst({
            where: {
                id: folderId,
                userId: userId
            }
        })

        const formattedFiles = files.map(file => {
            const d = file.date;
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();

            return {
                ...file,
                displayDate: `${dd}/${mm}/${yyyy}`
            };
        });

        res.render("index", {
            user: req.user,
            folders: folders,
            files: formattedFiles,
            currentFolder: activeFolder.name,
            currentFolderId: activeFolder.id
        })
    }
    catch(err) {
        return next(err)
    }
}

async function shareFolderPost(req, res, next) {
    try {
        const {folderId, expireTime} = req.body;
        const id = parseInt(folderId);

        const folder = await prisma.folders.findFirst({
            where: {id: id, userId: req.user.id}
        })

        if(!folder) {
            throw new CustomNotFoundError("User does not own this folder")
        }

        const token = crypto.randomBytes(20).toString('hex');
        let expiresAt = null;
        const hours = parseInt(expireTime);

        if(hours > 0) {
            expiresAt = new Date(Date.now() + (hours * 60 * 60 * 1000));
        }


        await prisma.folders.update({
            where: {id: id},
            data: {
                shareToken: token,
                shareExpires: expiresAt
            }
        });

        const shareUrl = `${req.protocol}://${req.get('host')}/shared/folder/${token}`;
        res.json({link: shareUrl})
    }
    catch(err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate link" });
    }
}

async function accessShareFolderGet(req, res, next) {
    try {
        const token = req.params.token;

        const folder = await prisma.folders.findUnique({
            where: {shareToken: token}
        });

        if(!folder) {
            throw new CustomNotFoundError("This link is invalid or the folder was deleted");
        }

        if(folder.shareExpires && folder.shareExpires < new Date()) {
            throw new CustomNotFoundError("This share link has expired!");
        }

        const files = await prisma.files.findMany({
            where: {folderId: folder.id}
        });

        const formattedFiles = files.map(file => {
            const d = file.date;
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();

            return {
                ...file,
                displayDate: `${dd}/${mm}/${yyyy}`
            };
        });

        res.render("sharedFolder", {folder, files: formattedFiles})
    }
    catch(err) {
        return next(err)
    }
}

async function deleteFolderPost(req, res, next) {
    try {
        const folderId = parseInt(req.params.id);
        await prisma.folders.delete({
            where: {
                id: folderId
            }
        })

        res.redirect('/')

    }
    catch(err) {
        return next(err)
    }
}

async function deleteFilePost(req, res, next) {
    try {
        const fileId = parseInt(req.params.id);
        const folderId = req.body.folderId;

        await prisma.files.delete({
            where: {
                id: fileId
            }
        })

        if(folderId !== '') {
            res.redirect(`/folder/${folderId}`);
        }
        else {
            res.redirect("/");
        } 
    }
    catch(err) {
        return next(err);
    }
}

async function authenticateUser(req, res, next) {
    try {
        passport.authenticate("local", function(err, user, info) {
            if(err) {return next(err)}
            if(!user) {
                return res.render('index', {
                    title: "HomePage",
                    user: req.user,
                    errMessage: info.message
                })
            }
            req.logIn(user, function(err) {
                if(err) return next(err);
                return res.redirect('/')
            })
        })(req, res, next)
    } catch(err) {
        return next(err);
    }
}

function signUpPageGet(req, res, next) {
    try {
        res.render("sign-up-form", {
            title: "Sign Up"
        })
    } catch(err) {
        return next(err);
    }
}

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";

const validateUser = [
    body("firstName").trim()
    .isAlpha().withMessage(`First Name ${alphaErr}`)
    .isLength({min: 1, max: 10}).withMessage(`First Name ${lengthErr}`),

    body("lastName").trim()
    .isAlpha().withMessage(`Last Name ${alphaErr}`)
    .isLength({min: 1, max: 10}).withMessage(`Last Name ${lengthErr}`),

    body("password").trim().isLength({min: 6, max: 25}).withMessage("Password should be atleast 6 characters long"),

    body("username").trim()
    .isLength({min: 1, max: 10}).withMessage(`Username ${lengthErr}`)
    .custom(async (value) => {
        const {rows} = await pool.query('SELECT id FROM "Users" WHERE username = $1', [value]);

        if(rows.length > 0) {
            throw new Error("Username already in use");
        }
    })
]

let signUpPagePost = [
    validateUser,
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).render("sign-up-form", {
                    title: "Sign Up",
                    errors: errors.array(),
                });
            }
            const {password} = matchedData(req);
            const hashedPassword = await bcrypt.hash(password, 10);
            
            await pool.query('INSERT INTO "Users" (username, fullname, password) VALUES ($1, $2, $3)', [
                req.body.username,
                req.body.firstName + " " + req.body.lastName,
                hashedPassword
            ])
            res.redirect("/");
        }
        catch(err) {
            return next(err);
        }
    }
]

function logOutGet(req, res, next) {
    try {
        req.logOut((err) => {
            if(err) {
                return next(err);
            }
            res.redirect("/");
        })
    } catch(err) {
        return next(err);
    }
}

module.exports = {
    logInIndexPageGet,
    authenticateUser,
    signUpPageGet,
    signUpPagePost,
    uploadFilePost,
    downloadFileGet,
    uploadFolderPost,
    shareFolderPost,
    accessShareFolderGet,
    deleteFolderPost,
    deleteFilePost,
    openFolderGet,
    logOutGet,
}