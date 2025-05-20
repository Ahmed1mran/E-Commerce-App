import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CloudService,
  IAttachmentTypes,
} from 'src/common/multer/cloud.service';
import { CategoryDocument } from 'src/DB/model/category.model';
import { UserDocument } from 'src/DB/model/User.model';
import { CategoryRepositoryService } from 'src/DB/repository/Category.repository.service';
import { CreateCategoryDto } from './dto/create.dto';
import { FilterQuery, Types } from 'mongoose';
import { CategoryFilterQueryDto, updateCategoryDto } from './dto/update.dto';
import { ICategory } from './category.interface';
import { IPaginate } from 'src/DB/repository/database.repository';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepositoryService: CategoryRepositoryService,
    private readonly cloudService: CloudService,
  ) {}

  async create(
    user: UserDocument,
    body: CreateCategoryDto,
    file: Express.Multer.File,
  ): Promise<{ message: 'Done' }> {
    console.log({ file, body, user });
    const { name } = body;

    if (await this.categoryRepositoryService.findOne({ filter: { name } })) {
      throw new ConflictException('Category already exists');
    }
    const folderId = String(
      Math.floor(Math.random() * (999999 - 100000 + 1) + 100000),
    );
    const { secure_url, public_id } = await this.cloudService.uploadFile(
      file.path,
      {
        folder: `${process.env.APP_NAME}/category/${folderId}`,
      },
    );
     await this.categoryRepositoryService.create({
      name,
      logo: {
        secure_url,
        public_id,
      },
      folderId,
      createdBy: user._id,
    });
    return { message: 'Done' };
  }
  async update(
    _user: UserDocument,
    categoryId: Types.ObjectId,
    body?: updateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<{ message: 'Done' }> {
    if (!body && !file) {
      throw new BadRequestException('In-valid provided data');
    }

    const category = await this.categoryRepositoryService.findOne({
      filter: { _id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const name = body?.name;
    if (
      name &&
      (await this.categoryRepositoryService.findOne({
        filter: { name, _id: { $ne: categoryId } },
      }))
    ) {
      throw new ConflictException('Category already exists');
    }

    let logo: IAttachmentTypes | undefined;
    if (file) {
      const { secure_url, public_id } = await this.cloudService.uploadFile(
        file.path,
        {
          folder: `${process.env.APP_NAME}/category/${category.folderId}`,
        },
      );
      logo = { secure_url, public_id };
    }

    const updateCategory = await this.categoryRepositoryService.updateOne({
      filter: { _id: categoryId },
      data: {
        ...(name && { name }),
        ...(logo && { logo }),
      },
    });

    if (updateCategory.modifiedCount && logo) {
      await this.cloudService.destroyFile(category.logo.public_id);
    }

    return { message: 'Done' };
  }
  async findById(
    categoryId: Types.ObjectId,
  ): Promise<{ message: 'Done'; data: { category: ICategory } }> {
    const category = await this.categoryRepositoryService.findById({
      categoryId,
      populate: [{ path: 'createdBy', select: 'username email' }],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return { message: 'Done', data: { category } };
  }
  async find(query: CategoryFilterQueryDto): Promise<{
    message: string;
    data: { categories: ICategory[] | [] | IPaginate<ICategory> };
  }> {
    let filter: FilterQuery<CategoryDocument> = {};
    if (query?.name) {
      filter = {
        $or: [
          { name: { $regex: `${query.name}`, $options: 'i' } },
          { slug: { $regex: `${query.name}`, $options: 'i' } },
        ],
      };
    }
    const categories = await this.categoryRepositoryService.find({
      filter,
      select: query.select,
      sort: query.sort,
      page: query.page,
      populate: [{ path: 'createdBy' }],
    });
    return { message: 'Done', data: { categories } };
  }
}
