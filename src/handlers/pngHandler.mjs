import multer from 'multer'            ;
import utils  from '../paths/utils.mjs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, utils.imgsPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const uploadPNG = multer({
  storage: storage,
  
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
      
    } else {
      const error = new Error('Only .png files are allowed!');
      error.code = 'INVALID_FILE_TYPE';

      cb(error, false);
    }
  }
});

export default uploadPNG;