# ☁️ CloudVault

A secure, full-stack cloud storage web application built with Node.js, Express, and PostgreSQL. CloudVault allows users to securely upload, manage, and share their files and folders, complete with time-limited public sharing links.

Check it out live at --> https://file-uploader-epti.onrender.com/

## ✨ Features

* **User Authentication:** Secure sign-up and login functionality using Passport.js and bcrypt password hashing.
* **File & Folder Management:** Create custom folders and upload files directly to them.
* **Universal File Support:** Upload images, videos, PDFs, ZIPs, and raw documents (Powered by Cloudinary).
* **Smart Preview & Download:** View files directly in the browser or force-download them with a single click.
* **Secure Folder Sharing:** Generate time-limited (1 hour, 1 day, 7 days, or infinite) secure links for specific folders.
* **Guest View:** A read-only, sanitized UI for guests to view and download files from shared links without needing an account.

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, EJS (Embedded JavaScript templates)
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL, Prisma ORM
* **Storage:** Cloudinary (via Multer and `multer-storage-cloudinary`)
* **Authentication:** Passport.js, express-session, bcryptjs
