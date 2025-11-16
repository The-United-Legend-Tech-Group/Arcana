import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileChangeRequest, ProfileChangeRequestSchema } from './schema/profile-change.schema';

@Module({
    imports: [
    MongooseModule.forFeature([{ name: ProfileChangeRequest.name, schema: ProfileChangeRequestSchema }]),
  ],
})
export class ProfileChangeRequestModule {}
