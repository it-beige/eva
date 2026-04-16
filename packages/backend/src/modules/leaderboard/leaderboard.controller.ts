import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import {
  QueryLeaderboardDto,
  PaginatedLeaderboardResponse,
  LeaderboardSummary,
} from './dto/query-leaderboard.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
@ApiTags('Leaderboard')
@ApiBearerAuth('access-token')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * 获取排行榜数据
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryLeaderboardDto,
  ): Promise<PaginatedLeaderboardResponse> {
    return this.leaderboardService.findAll(query);
  }

  /**
   * 获取排行榜汇总统计
   */
  @Get('summary')
  @HttpCode(HttpStatus.OK)
  async getSummary(): Promise<LeaderboardSummary> {
    return this.leaderboardService.getSummary();
  }
}
