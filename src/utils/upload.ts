import multer from "multer";

export function createUploadMiddleware(uploadsDir: string) {
  const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (_req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  return multer({ storage: storage });
}
