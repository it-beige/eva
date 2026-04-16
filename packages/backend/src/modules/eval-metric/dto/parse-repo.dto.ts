import { IsString, IsNotEmpty } from 'class-validator';

export class ParseRepoDto {
  @IsString()
  @IsNotEmpty({ message: '代码仓库地址不能为空' })
  codeRepoUrl: string;

  @IsString()
  @IsNotEmpty({ message: '代码分支不能为空' })
  codeBranch: string = 'master';
}
