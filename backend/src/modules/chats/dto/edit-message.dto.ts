// technically shouldn't need userId as can use guard authorization to extract userId
export class EditMessageDto {
  content: string;
  userId: string;
}
