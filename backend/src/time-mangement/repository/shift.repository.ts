import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shift, ShiftDocument } from '../models/shift.schema';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class ShiftRepository extends BaseRepository<ShiftDocument> {
  constructor(@InjectModel(Shift.name) model: Model<ShiftDocument>) {
    super(model);
  }

  findByName(name: string) {
    return this.find({ name } as any);
  }
}
