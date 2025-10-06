/**
 * Delete request - if forEveryone is true, delete for everyone; otherwise mark hidden for the requesting user
 */
export class DeleteMessageDto {
  forEveryone?: boolean = false;
}
