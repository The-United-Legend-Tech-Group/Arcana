import { IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto {
    @IsString()
    @IsNotEmpty()
    message: string;
}

export class ChatResponseDto {
    response: string;
    timestamp: Date;
}
