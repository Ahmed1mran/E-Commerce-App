import {
  FilterQuery,
  Model,
  PopulateOptions,
  Types,
  UpdateWriteOpResult,
} from 'mongoose';

export interface IPaginate<T> {
  count: number;
  pageSize: number;
  pages: number;
  page: number;
  documents: T[] | [];
}
export abstract class DatabaseRepository<TDocument> {
  protected constructor(protected readonly model: Model<TDocument>) {}
  async findOne({
    filter,
    populate,
  }: {
    filter?: FilterQuery<TDocument>;
    populate?: PopulateOptions[];
  }): Promise<TDocument | null> {
    return await this.model.findOne(filter || {}).populate(populate || []);
  }
  async findById({
    categoryId,
    populate,
  }: {
    categoryId?: Types.ObjectId;
    populate?: PopulateOptions[];
  }): Promise<TDocument | null> {
    return await this.model.findById(categoryId).populate(populate || []);
  }
  async create(data: Partial<TDocument>): Promise<TDocument> {
    return await this.model.create(data);
  }
  async updateOne({
    filter,
    data,
  }: {
    filter: FilterQuery<TDocument>;
    data: any;
  }): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(filter, data);
  }
  async findOneAndUpdate({
    filter,
    data,
  }: {
    filter: FilterQuery<TDocument>;
    data: any;
  }): Promise<TDocument | null> {
    return await this.model.findOneAndUpdate(filter, data, { new: true });
  }
  async find({
    filter,
    select,
    sort,
    page,
    populate,
  }: {
    filter?: FilterQuery<TDocument>;
    select?: string;
    sort?: string;
    page?: number;
    populate?: PopulateOptions[];
  }): Promise<TDocument[] | [] | IPaginate<TDocument>> {
    let query = this.model.find(filter || {});
    if (select) {
      select = select.replaceAll(',', ' ');
      query = query.select(select);
    }
    if (sort) {
      sort = sort.replaceAll(',', ' ');
      query = query.sort(sort);
    }
    if (populate) {
      query = query.populate(populate);
    }
    if (!page) {
      return await query.exec();
    }
    const limit = 10;
    const skip = (page - 1) * limit;
    const count = await this.model.countDocuments(filter || {});
    const pages = Math.ceil(count / limit);
    const documents = await query.skip(skip).limit(limit).exec();
    return {
      count,
      pageSize: limit,
      pages,
      page,
      documents,
    };
  }
}
