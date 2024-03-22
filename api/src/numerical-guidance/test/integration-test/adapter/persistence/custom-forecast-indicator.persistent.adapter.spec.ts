import { HttpModule } from '@nestjs/axios';
import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { AuthService } from 'src/auth/auth.service';
import { MemberEntity } from 'src/auth/member.entity';
import { CustomForecastIndicator } from 'src/numerical-guidance/domain/custom-forecast-indicator';
import { CustomForecastIndicatorPersistentAdapter } from 'src/numerical-guidance/infrastructure/adapter/persistence/custom-forecast-indicator/custom-forecast-indicator.persistent.adapter';
import { CustomForecastIndicatorEntity } from 'src/numerical-guidance/infrastructure/adapter/persistence/custom-forecast-indicator/entity/custom-forecast-indicator.entity';
import { DataSource } from 'typeorm';
import { IndicatorEntity } from 'src/numerical-guidance/infrastructure/adapter/persistence/indicator/entity/indicator.entity';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
}));

describe('CustomForecastIndicatorPersistentAdapter', () => {
  let environment;
  let dataSource: DataSource;
  let customForecastIndicatorPersistentAdapter: CustomForecastIndicatorPersistentAdapter;
  const seeding = async () => {
    const memberRepository = dataSource.getRepository(MemberEntity);
    await memberRepository.insert({ id: 10 });

    const customForecastIndicatorRepository = dataSource.getRepository(CustomForecastIndicatorEntity);
    await customForecastIndicatorRepository.insert({
      id: '0d73cea1-35a5-432f-bcd1-27ae3541ba73',
      customForecastIndicatorName: '예측지표',
      type: 'customForecastIndicator',
      targetIndicatorId: '26929514-237c-11ed-861d-0242ac120011',
      grangerVerification: [],
      cointJohansenVerification: [],
      sourceIndicatorIdsAndWeights: [],
    });

    await customForecastIndicatorRepository.insert({
      id: '0d73cea1-35a5-432f-bcd1-27ae3541ba74',
      customForecastIndicatorName: '삭제용예측지표',
      type: 'customForecastIndicator',
      targetIndicatorId: '0d73cea1-35a5-432f-bcd1-27ae3541ba74',
      grangerVerification: [],
      cointJohansenVerification: [],
      sourceIndicatorIdsAndWeights: [],
    });

    const indicatorRepository = dataSource.getRepository(IndicatorEntity);
    await indicatorRepository.insert({
      id: '26929514-237c-11ed-861d-0242ac120011',
      name: 'LG전자',
      ticker: '066570',
      type: 'k-stock',
      market: 'KOSPI',
    });
    await indicatorRepository.insert({
      id: '26929514-237c-11ed-861d-0242ac120012',
      name: '삼성SDI',
      ticker: '006400',
      type: 'k-stock',
      market: 'KOSPI',
    });
  };

  beforeEach(async () => {
    environment = await new PostgreSqlContainer().start();

    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        HttpModule.registerAsync({
          useFactory: () => ({
            timeout: 10000,
            maxRedirects: 5,
          }),
        }),
        TypeOrmModule.forFeature([CustomForecastIndicatorEntity, MemberEntity, IndicatorEntity]),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: () => ({
            type: 'postgres',
            retryAttempts: 20,
            retryDelay: 5000,
            host: environment.getHost(),
            port: environment.getPort(),
            username: environment.getUsername(),
            password: environment.getPassword(),
            database: environment.getDatabase(),
            entities: [CustomForecastIndicatorEntity, MemberEntity, IndicatorEntity],
            synchronize: true,
          }),
        }),
      ],
      providers: [CustomForecastIndicatorPersistentAdapter, AuthService],
    }).compile();
    customForecastIndicatorPersistentAdapter = module.get(CustomForecastIndicatorPersistentAdapter);
    dataSource = module.get<DataSource>(DataSource);
    await seeding();
  }, 100000);

  afterAll(async () => {
    await environment.stop();
  });

  it('예측지표 생성하고 생성한 id로 예측지표 확인', async () => {
    // given
    const customForecastIndicator: CustomForecastIndicator = CustomForecastIndicator.createNew(
      '예측지표 이름',
      'f5206520-da94-11ee-b91b-3551e6db3bbd',
    );
    const memberId = 10;

    // when
    const resultId = await customForecastIndicatorPersistentAdapter.createCustomForecastIndicator(
      customForecastIndicator,
      memberId,
    );
    const resultCustomForecastIndicator: CustomForecastIndicator =
      await customForecastIndicatorPersistentAdapter.loadCustomForecastIndicator(resultId);

    // then
    expect(customForecastIndicator.customForecastIndicatorName).toEqual(
      resultCustomForecastIndicator.customForecastIndicatorName,
    );
  });

  it('예측지표 생성 - 회원을 찾지 못한 경우', async () => {
    // given
    const customForecastIndicator: CustomForecastIndicator = CustomForecastIndicator.createNew(
      '예측지표 이름',
      'f5206520-da94-11ee-b91b-3551e6db3bbd',
    );
    const invalidMemberId = 100;

    // when
    // then
    await expect(async () => {
      await customForecastIndicatorPersistentAdapter.createCustomForecastIndicator(
        customForecastIndicator,
        invalidMemberId,
      );
    }).rejects.toThrow(
      new NotFoundException({
        HttpStatus: HttpStatus.NOT_FOUND,
        error: `[ERROR] memberId: ${invalidMemberId} 해당 회원을 찾을 수 없습니다.`,
        message: '서버에 오류가 발생했습니다. 잠시후 다시 시도해주세요.',
        cause: Error,
      }),
    );
  });

  it('예측지표 id로 예측지표 불러오기 - db에 존재하지 않을 경우', async () => {
    // given
    const invalidId = 'a46240d3-7d15-48e7-a9b7-f490bf9ca6e3';

    //when
    //then
    await expect(async () => {
      await customForecastIndicatorPersistentAdapter.loadCustomForecastIndicator(invalidId);
    }).rejects.toThrow(
      new NotFoundException({
        HttpStatus: HttpStatus.NOT_FOUND,
        error: `[ERROR] 해당 예측지표를 찾을 수 없습니다.`,
        message: '정보를 불러오는 중에 문제가 발생했습니다. 다시 시도해주세요.',
        cause: Error,
      }),
    );
  });

  it('예측지표 삭제하기', async () => {
    // given
    const customForecastIndicatorId: string = '0d73cea1-35a5-432f-bcd1-27ae3541ba74';

    // when
    await customForecastIndicatorPersistentAdapter.deleteCustomForecastIndicator(customForecastIndicatorId);

    // then
    await expect(async () => {
      await customForecastIndicatorPersistentAdapter.loadCustomForecastIndicator(customForecastIndicatorId);
    }).rejects.toThrow(
      new NotFoundException({
        HttpStatus: HttpStatus.NOT_FOUND,
        error: `[ERROR] customForecastIndicatorId: ${customForecastIndicatorId} 해당 예측지표를 찾을 수 없습니다.`,
        message: '정보를 불러오는 중에 문제가 발생했습니다. 다시 시도해주세요.',
        cause: Error,
      }),
    );
  });

  it('예측지표 삭제하기 - DB에 삭제할 데이터가 없는 경우', async () => {
    // given
    const invalidId: string = '0d73cea1-35a5-432f-bcd1-27ae3541b100';

    // when // then
    await expect(async () => {
      await customForecastIndicatorPersistentAdapter.deleteCustomForecastIndicator(invalidId);
    }).rejects.toThrow(
      new NotFoundException({
        HttpStatus: HttpStatus.NOT_FOUND,
        error: `[ERROR] customForecastIndicatorId: ${invalidId} 해당 예측지표를 찾을 수 없습니다.`,
        message: '정보를 불러오는 중에 문제가 발생했습니다. 다시 시도해주세요.',
        cause: Error,
      }),
    );
  });

  it('예측지표 삭제하기 - id 형식이 올바르지 않은 경우', async () => {
    // given
    const invalidId: string = 'notUUID';

    // when // then
    await expect(async () => {
      await customForecastIndicatorPersistentAdapter.deleteCustomForecastIndicator(invalidId);
    }).rejects.toThrow(
      new BadRequestException({
        HttpStatus: HttpStatus.BAD_REQUEST,
        error: `[ERROR] 예측지표를 삭제하는 도중에 entity 오류가 발생했습니다.
        1. id 값이 uuid 형식을 잘 따르고 있는지 확인해주세요.`,
        message: '정보를 불러오는 중에 문제가 발생했습니다. 다시 시도해주세요.',
        cause: Error,
      }),
    );
  });
});
