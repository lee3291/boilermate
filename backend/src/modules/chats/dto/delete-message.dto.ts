// technically won't need userId as we can extract userId from the guard authorization
export class DeleteMessageDto {
  userId: string;
  forEveryone: boolean;
}
