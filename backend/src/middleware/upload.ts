import multer from 'multer';

// Use memory storage (file.buffer) - no disk writes
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // One file per request
  }
});
