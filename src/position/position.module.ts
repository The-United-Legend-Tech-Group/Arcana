import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Position, PositionSchema } from './schemas/position.schema';


@Module({
    imports: [
    MongooseModule.forFeature([{ name: Position.name, schema: PositionSchema }]),
  ],
})
export class PositionModule {}
