import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FLOW_REPOSITORY } from '../modules/flow/domain/repositories/flow.repository.interface';
import type { IFlowRepository } from '../modules/flow/domain/repositories/flow.repository.interface';
import { getInitialSeedFlows } from '../modules/flow/infrastructure/persistence/seeds/seed-flows.data';

async function runSeed() {
  console.log('[Seeder] Conectando con la base de datos...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const flowRepository = app.get<IFlowRepository>(FLOW_REPOSITORY);

    console.log('[Seeder] Limpiando flujos existentes...');
    await flowRepository.deleteAll();

    console.log('[Seeder] Sembrando los 10 flujos corporativos...');
    const initialFlows = getInitialSeedFlows();
    for (const flow of initialFlows) {
      await flowRepository.save(flow);
    }

    console.log(`[Seeder] ${initialFlows.length} flujos corporativos sembrados con exito.`);
  } catch (error) {
    console.error('[Seeder] Error al sembrar datos:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeed();

