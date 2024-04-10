import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StockEntity } from '../../../infrastructure/adapter/persistence/indicator/entity/stock.entity';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { IndicatorController } from '../../../api/indicator/indicator.controller';
import { IndicatorEntity } from '../../../infrastructure/adapter/persistence/indicator/entity/indicator.entity';
import { BondsEntity } from '../../../infrastructure/adapter/persistence/indicator/entity/bonds.entity';
import { CryptoCurrenciesEntity } from '../../../infrastructure/adapter/persistence/indicator/entity/crypto-currencies.entity';
import { ETFEntity } from '../../../infrastructure/adapter/persistence/indicator/entity/etf.entity';
import { ForexPairEntity } from '../../../infrastructure/adapter/persistence/indicator/entity/forex-pair.entity';
import { FundEntity } from '../../../infrastructure/adapter/persistence/indicator/entity/fund.entity';
import { IndicesEntity } from '../../../infrastructure/adapter/persistence/indicator/entity/indices.entity';
import { IndicatorPersistentAdapter } from '../../../infrastructure/adapter/persistence/indicator/indicator.persistent.adapter';
import { AuthGuard } from '../../../../auth/auth.guard';
import { HttpExceptionFilter } from '../../../../utils/exception-filter/http-exception-filter';
import * as request from 'supertest';
import * as fs from 'fs';
import { GetIndicatorListQueryHandler } from '../../../application/query/indicator/get-indicator-list.query.handler';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => ({}),
}));

const filePath = './src/numerical-guidance/test/data/indicator-list-stocks.json';
const data = fs.readFileSync(filePath, 'utf8');
const testIndicatorList = JSON.parse(data);

describe('Indicator E2E Test', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let DBenvironment;

  const seeding = async () => {
    const stockEntityRepository = dataSource.getRepository(StockEntity);
    await stockEntityRepository.clear();
    await stockEntityRepository.insert(testIndicatorList);
  };

  beforeAll(async () => {
    DBenvironment = await new PostgreSqlContainer().start();
    const [module] = await Promise.all([
      Test.createTestingModule({
        imports: [
          CqrsModule,
          ConfigModule.forRoot({
            isGlobal: true,
          }),
          TypeOrmModule.forFeature([
            IndicatorEntity,
            BondsEntity,
            CryptoCurrenciesEntity,
            ETFEntity,
            ForexPairEntity,
            FundEntity,
            IndicesEntity,
            StockEntity,
          ]),
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: () => ({
              type: 'postgres',
              retryAttempts: 20,
              retryDelay: 5000,
              host: DBenvironment.getHost(),
              port: DBenvironment.getPort(),
              username: DBenvironment.getUsername(),
              password: DBenvironment.getPassword(),
              database: DBenvironment.getDatabase(),
              entities: [
                IndicatorEntity,
                BondsEntity,
                CryptoCurrenciesEntity,
                ETFEntity,
                ForexPairEntity,
                FundEntity,
                IndicesEntity,
                StockEntity,
              ],
              synchronize: true,
            }),
          }),
          HttpModule.registerAsync({
            useFactory: () => ({
              timeout: 10000,
              maxRedirects: 5,
            }),
          }),
        ],
        controllers: [IndicatorController],
        providers: [
          GetIndicatorListQueryHandler,
          {
            provide: 'LoadIndicatorPort',
            useClass: IndicatorPersistentAdapter,
          },
          {
            provide: 'LoadIndicatorsPort',
            useClass: IndicatorPersistentAdapter,
          },
          {
            provide: 'LoadIndicatorListPort',
            useClass: IndicatorPersistentAdapter,
          },
        ],
      }).compile(),
    ]);
    dataSource = module.get<DataSource>(DataSource);
    await seeding();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalGuards(new AuthGuard());
    await app.init();
  }, 30000);

  afterAll(async () => {
    await DBenvironment.stop();
    await app.close();
  });

  it('/get 지표 List를 불러온다.', async () => {
    return request(app.getHttpServer())
      .get(`/api/numerical-guidance/indicator/list`)
      .query({
        type: 'stocks',
        cursorToken: 1,
      })
      .set('Content-Type', 'application/json')
      .expect(HttpStatus.OK);
  });
});