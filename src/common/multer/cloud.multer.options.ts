import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
export const attachmentValidation = {
  image: ['image/gif', 'image/jpeg', 'image/png'],
  file: ['plain/text', 'application/json'],
};

export const multerCloudOptions = ({
  fileValidators = attachmentValidation.image,
  fileSize = 1024 * 1024 * 10, // 10MB
}: {
  fileValidators?: string[];
  fileSize?: number;
}): MulterOptions => {
  return {
    storage: diskStorage({}),
    fileFilter: (_req, file, cb) => {
      if (!fileValidators?.includes(file.mimetype)) {
        return cb(new BadRequestException('In-valid file format'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize,
    },
  };
};
