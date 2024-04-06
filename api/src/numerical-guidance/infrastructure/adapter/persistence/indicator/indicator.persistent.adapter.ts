import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LoadIndicatorsPort } from 'src/numerical-guidance/application/port/persistence/indicator/load-indicators.port';
import { IndicatorDto } from 'src/numerical-guidance/application/query/indicator/basic/dto/indicator.dto';
import { Repository } from 'typeorm';
import { IndicatorEntity } from './entity/indicator.entity';
import { IndicatorMapper } from './mapper/indicator.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { LoadIndicatorPort } from '../../../../application/port/persistence/indicator/load-indicator.port';
import { IndicatorsDto } from '../../../../application/query/indicator/basic/dto/indicators.dto';
import { TypeORMError } from 'typeorm/error/TypeORMError';
import { LoadIndicatorListPort } from '../../../../application/port/persistence/indicator/load-indicator-list.port';
import { IndicatorType } from '../../../../../utils/type/type-definition';
import { BondsMapper } from './mapper/bonds.mapper';
import { BondsEntity } from './entity/bonds.entity';

@Injectable()
export class IndicatorPersistentAdapter implements LoadIndicatorPort, LoadIndicatorsPort, LoadIndicatorListPort {
  constructor(
    @InjectRepository(IndicatorEntity)
    private readonly indicatorEntityRepository: Repository<IndicatorEntity>,
    @InjectRepository(BondsEntity)
    private readonly bondsEntityRepository: Repository<BondsEntity>,
  ) {}

  // TODO: seeding하고 페이지네이션 작업 추가
  // TODO: 다하면 나머지 전체 다
  async loadIndicatorList(type: IndicatorType) {
    type;
    const bondsEntities = await this.bondsEntityRepository.find();

    return BondsMapper.mapEntitiesToDto(bondsEntities);
  }

  async loadIndicator(id: string): Promise<IndicatorDto> {
    try {
      const indicatorEntity = await this.indicatorEntityRepository.findOneBy({ id });
      this.nullCheckForEntity(indicatorEntity);
      return IndicatorMapper.mapEntityToDto(indicatorEntity);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException({
          HttpStatus: HttpStatus.NOT_FOUND,
          error: `[ERROR] id: ${id} 지표를 찾을 수 없습니다.`,
          message: '정보를 불러오는 중에 문제가 발생했습니다. 다시 시도해주세요.',
          cause: error,
        });
      } else if (error instanceof TypeORMError) {
        throw new BadRequestException({
          HttpStatus: HttpStatus.BAD_REQUEST,
          error: `[ERROR] 지표를 불러오는 도중에 오류가 발생했습니다.
          1. id 값이 uuid 형식을 잘 따르고 있는지 확인해주세요.`,
          message: '정보를 불러오는 중에 문제가 발생했습니다. 다시 시도해주세요.',
          cause: error,
        });
      } else {
        throw new InternalServerErrorException({
          HttpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '[ERROR] 지표를 불러오는 중에 예상치 못한 문제가 발생했습니다.',
          message: '서버에 오류가 발생했습니다. 잠시후 다시 시도해주세요. 잠시후 다시 시도해주세요.',
          cause: error,
        });
      }
    }
  }

  async loadIndicators(): Promise<IndicatorsDto> {
    try {
      const indicatorEntities = await this.indicatorEntityRepository.find();

      return IndicatorMapper.mapEntitiesToDto(indicatorEntities);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException({
          HttpStatus: HttpStatus.NOT_FOUND,
          error: `[ERROR] 지표들를 찾을 수 없습니다.`,
          message: '정보를 불러오는 중에 문제가 발생했습니다. 다시 시도해주세요.',
          cause: error,
        });
      } else if (error instanceof TypeORMError) {
        throw new BadRequestException({
          HttpStatus: HttpStatus.BAD_REQUEST,
          error: `[ERROR] 지표를 불러오는 도중에 entity 오류가 발생했습니다.`,
          message: '정보를 불러오는 중에 문제가 발생했습니다. 다시 시도해주세요.',
          cause: error,
        });
      } else {
        throw new InternalServerErrorException({
          HttpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
          error: '[ERROR] 지표를 불러오는 중에 예상치 못한 문제가 발생했습니다.',
          message: '서버에 오류가 발생했습니다. 잠시후 다시 시도해주세요.',
          cause: error,
        });
      }
    }
  }

  private nullCheckForEntity(entity) {
    if (entity == null) throw new NotFoundException();
  }
}
