import {
  MongooseModule,
  Prop,
  raw,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { MaxLength, MinLength } from 'class-validator';
import { Document, HydratedDocument, ObjectId, Types } from 'mongoose';
import slugify from 'slugify';
import { IAttachmentTypes } from 'src/common/multer/cloud.service';
import { IProduct, Size } from 'src/modules/product/product.interface';

@Schema({
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Product implements IProduct {
  declare _id: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  })
  name: string;
  @Prop({
    type: String,
    minlength: 2,
    maxlength: 50,
    trim: true,
  })
  slug: string;
  @Prop({
    type: Number,
    required: true,
  })
  originalPrice: number;
  @Prop({
    type: Number,
    required: true,
  })
  stock: number;
  @Prop({
    type: Number,
    required: false,
  })
  discountPercent?: number;
  @Prop({
    type: Number,
    // required: true,
  })
  finalPrice: number;
  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: String })
  folderId: string;

  @Prop(
    raw({
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    }),
  )
  image: IAttachmentTypes;
  @Prop(
    raw([
      {
        secure_url: { type: String },
        public_id: { type: String },
      },
    ]),
  )
  gallery?: IAttachmentTypes[];

  @Prop({ type: Array<Size> })
  size?: Size[];
  @Prop({ type: Array<String> })
  colors?: string[];
}
export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
export const ProductModel = MongooseModule.forFeatureAsync([
  {
    // name: 'Product',
    name: Product.name,
    imports: [],
    useFactory() {
      ProductSchema.pre('save', function (next) {
        if (
          this.isModified('discountPercent') ||
          this.isModified('originalPrice')
        ) {
          if (this.originalPrice == null) return next();

          const discount = this.discountPercent || 0;
          const result = Math.floor(
            this.originalPrice - (discount / 100) * this.originalPrice,
          );
          this.finalPrice = result >= 0 ? result : 0;
        }
        return next();
      });

      ProductSchema.pre('updateOne', function (next) {
        const update = this.getUpdate() as Record<string, any> | null;

        if (update?.name) {
          update.slug = slugify(update.name, { trim: true });
        }

        if (update?.discountPercent || update?.originalPrice) {
          const discount = update.discountPercent || 0;
          const original = update.originalPrice || 0;
          const result = Math.floor(original - (discount / 100) * original);
          update.finalPrice = result >= 0 ? result : 0;
        }

        return next();
      });

      return ProductSchema;
    },
  },
]);
