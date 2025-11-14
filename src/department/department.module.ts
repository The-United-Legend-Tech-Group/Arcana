import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from './schemas/department.schema';

@Module({
    imports: [
    MongooseModule.forFeature([{ name: Department.name, schema: DepartmentSchema }]),
  ],
})
export class DepartmentModule {}
