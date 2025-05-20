import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { resolve } from 'path';
export const validationFile = {
  image: ['image/gif', 'image/jpeg', 'image/png'],
  file: ['plain/text', 'application/json'],
};

export const localMulterOptions = ({
  path = 'public',
  validation = [],
  fileSize = 1024 * 1024 * 10, // 10MB
}: {
  path?: string;
  validation?: string[];
  fileSize?: number;
}): MulterOptions => {
  const basePath = `uploads/${path}`;

  return {
    storage: diskStorage({
      destination: (req, _file, cb) => {
        const userId = req['user']?._id;
        const fullPath = resolve(`./${basePath}/${userId}`);

        if (!existsSync(fullPath)) {
          mkdirSync(fullPath, { recursive: true });
        }

        cb(null, fullPath);
      },
      filename: (req, file, cb) => {
        const filename = Date.now() + '_' + file.originalname;
        const userId = req['user']?._id;
        file['finalPath'] = `${basePath}/${userId}/${filename}`;
        cb(null, filename);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (!validation?.includes(file.mimetype)) {
        return cb(new BadRequestException('In-valid file format'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize,
    },
  };
};
