import {
  MongooseModule,
  Prop,
  raw,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
import { IAttachmentTypes } from 'src/common/multer/cloud.service';
import { ICategory } from 'src/modules/category/category.interface';

@Schema({
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Category implements ICategory {
  declare _id: Types.ObjectId;

  @Prop({
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
    unique: true,
  })
  name: string;
  @Prop({
    minlength: 2,
    maxlength: 50,
    trim: true,
  })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy?: Types.ObjectId;

  @Prop({ type: String })
  folderId: string;

  @Prop(
    raw({
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    }),
  )
  logo: IAttachmentTypes;
}
export type CategoryDocument = HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);
export const categoryModel = MongooseModule.forFeatureAsync([
  {
    name: Category.name,
    imports: [],
    useFactory() {
      CategorySchema.pre('save', function (next) {
        if (this.isModified('name')) {
          this.slug = slugify(this.name, { trim: true });
        }
        return next();
      });
      CategorySchema.pre('updateOne', function (next) {
        const update = this.getUpdate() as any;

        if (update?.name) {
          update.slug = slugify(update.name, { trim: true });
        } else if (update?.$set?.name) {
          update.$set.slug = slugify(update.$set.name, { trim: true });
        }

        next();
      });

      return CategorySchema;
    },
  },
]);
