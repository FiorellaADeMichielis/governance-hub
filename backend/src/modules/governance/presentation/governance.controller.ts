import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { UserRole } from '../../auth/domain/enums/user-role.enum';
import { GetGovernanceRulesUseCase } from '../application/use-cases/get-governance-rules.use-case';
import { CreateGovernanceRuleUseCase } from '../application/use-cases/create-governance-rule.use-case';
import { ToggleRuleStatusUseCase } from '../application/use-cases/toggle-rule-status.use-case';
import { DeleteGovernanceRuleUseCase } from '../application/use-cases/delete-governance-rule.use-case';
import { SimulateGovernanceEvaluationUseCase } from '../application/use-cases/simulate-governance-evaluation.use-case';
import { CreateGovernanceRuleDto } from './dtos/create-governance-rule.dto';
import { SimulateEvaluationDto } from './dtos/simulate-evaluation.dto';

@ApiTags('Governance')
@Controller('governance')
export class GovernanceController {
  constructor(
    private readonly getRulesUseCase: GetGovernanceRulesUseCase,
    private readonly createRuleUseCase: CreateGovernanceRuleUseCase,
    private readonly toggleRuleUseCase: ToggleRuleStatusUseCase,
    private readonly deleteRuleUseCase: DeleteGovernanceRuleUseCase,
    private readonly simulateEvaluationUseCase: SimulateGovernanceEvaluationUseCase,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('rules')
  async getAllRules() {
    const rules = await this.getRulesUseCase.execute();
    return {
      data: rules.map((r) => ({
        id: r.getId(),
        name: r.getName(),
        description: r.getDescription(),
        targetField: r.getTargetField(),
        operator: r.getOperator(),
        expectedValue: r.getExpectedValue(),
        resultingStatus: r.getResultingStatus(),
        resultingRiskLevel: r.getResultingRiskLevel(),
        isActive: r.getIsActive(),
        priority: r.getPriority(),
        createdAt: r.getCreatedAt(),
        updatedAt: r.getUpdatedAt(),
      })),
      total: rules.length,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('rules')
  async createRule(@Body() dto: CreateGovernanceRuleDto) {
    const rule = await this.createRuleUseCase.execute(dto);
    return {
      id: rule.getId(),
      name: rule.getName(),
      isActive: rule.getIsActive(),
      message: 'Regla de gobernanza creada exitosamente',
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('rules/:id/toggle')
  async toggleRule(@Param('id') id: string) {
    const updatedRule = await this.toggleRuleUseCase.execute(id);
    return {
      id: updatedRule.getId(),
      name: updatedRule.getName(),
      isActive: updatedRule.getIsActive(),
      message: `Regla ${updatedRule.getIsActive() ? 'activada' : 'desactivada'} correctamente`,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('rules/:id')
  async deleteRule(@Param('id') id: string) {
    return this.deleteRuleUseCase.execute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('simulate')
  @HttpCode(HttpStatus.OK)
  async simulate(@Body() dto: SimulateEvaluationDto) {
    const result = await this.simulateEvaluationUseCase.execute(dto);
    return {
      context: dto,
      result,
    };
  }
}

