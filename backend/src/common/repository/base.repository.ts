import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  HydratedDocument,
  PopulateOptions,
} from 'mongoose';

export interface IRepository<T extends Document> {
  create(dto: Partial<T>): Promise<HydratedDocument<T>>;
  findOne(
    filter: FilterQuery<T>,
    populate?: PopulateOptions | PopulateOptions[],
  ): Promise<HydratedDocument<T> | null>;
  findById(
    id: string,
    populate?: PopulateOptions | PopulateOptions[],
  ): Promise<HydratedDocument<T> | null>;
  find(
    filter?: FilterQuery<T>,
    populate?: PopulateOptions | PopulateOptions[],
  ): Promise<HydratedDocument<T>[]>;
  update(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<HydratedDocument<T> | null>;
  updateById(
    id: string,
    update: UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<HydratedDocument<T> | null>;
  delete(filter: FilterQuery<T>): Promise<{ deletedCount?: number }>;
  deleteById(id: string): Promise<HydratedDocument<T> | null>;
}

export class BaseRepository<T extends Document> implements IRepository<T> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(dto: Partial<T>): Promise<HydratedDocument<T>> {
    const created = new this.model(dto);
    return created.save();
  }

  async findOne(
    filter: FilterQuery<T>,
    populate?: PopulateOptions | PopulateOptions[],
  ): Promise<HydratedDocument<T> | null> {
    const query = this.model.findOne(filter);
    if (populate) {
      query.populate(populate);
    }
    return query.exec();
  }

  async findById(
    id: string,
    populate?: PopulateOptions | PopulateOptions[],
  ): Promise<HydratedDocument<T> | null> {
    const query = this.model.findById(id);
    if (populate) {
      query.populate(populate);
    }
    return query.exec();
  }

  async find(
    filter: FilterQuery<T> = {},
    populate?: PopulateOptions | PopulateOptions[],
  ): Promise<HydratedDocument<T>[]> {
    const query = this.model.find(filter);
    if (populate) {
      query.populate(populate);
    }
    return query.exec();
  }

  async update(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: QueryOptions = { new: true },
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findOneAndUpdate(filter, update, options).exec();
  }

  async updateById(
    id: string,
    update: UpdateQuery<T>,
    options: QueryOptions = { new: true },
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findByIdAndUpdate(id, update, options).exec();
  }

  async delete(filter: FilterQuery<T>): Promise<{ deletedCount?: number }> {
    const result = await this.model.deleteMany(filter).exec();
    return { deletedCount: result.deletedCount };
  }

  async deleteById(id: string): Promise<HydratedDocument<T> | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
