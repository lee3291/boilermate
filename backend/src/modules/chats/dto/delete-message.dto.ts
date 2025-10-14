// technically won't need userId as we can extract userId from the guard authorization
export class DeleteMessageDto {
  userId: string;
  forEveryone: string; // used to be boolean but have to change because of params only have string
}
