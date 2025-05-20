import { Injectable } from '@nestjs/common';
import {
  AdminAndResourceOptions,
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';

export interface IAttachmentTypes {
  secure_url: string;
  public_id: string;
}
@Injectable()
export class CloudService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
      secure: true,
    });
  }
  async uploadFile(
    path: string,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    const file = await cloudinary.uploader.upload(path, options);

    return file;
  }
  async uploadFiles(
    files: Express.Multer.File[],
    options?: UploadApiOptions,
  ): Promise<IAttachmentTypes[] | []> {
    const attachments: IAttachmentTypes[] = [];
    for (const file of files) {
      const { secure_url, public_id } = await this.uploadFile(
        file.path,
        options,
      );

      attachments.push({ secure_url, public_id });
    }
    return attachments;
  }

  async destroyFile(public_id: string): Promise<void> {
    return await cloudinary.uploader.destroy(public_id);
  }
  async destroyFiles(
    public_ids: string[],
    options?: AdminAndResourceOptions,
  ): Promise<void> {
    return await cloudinary.api.delete_resources(
      public_ids,
      options || {
        type: 'upload',
        resource_type: 'image',
      },
    );
  }
  async destroyFolderAssets(path: string): Promise<void> {
    return await cloudinary.api.delete_resources_by_prefix(path);
  }
}
