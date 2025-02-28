import multer from "multer";
const storage = multer.memoryStorage();
const uploadFiles = multer({ storage }).single("file");
export { uploadFiles };
