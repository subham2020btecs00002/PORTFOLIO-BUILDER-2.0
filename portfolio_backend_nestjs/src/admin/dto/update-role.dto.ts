import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['admin', 'user'])
  role: string;
}
