import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import {
  Project,
  AIApplication,
  AppVersion,
  User,
  EvalSet,
  EvalMetric,
  Prompt,
} from '../entities';
import * as allEntities from '../entities';
import {
  EvalSetType,
  EvalSetSourceType,
  MetricType,
  MetricScope,
  UserRole,
  ProjectSource,
} from '@eva/shared';

// 生成6位shortId
function generateShortId(): string {
  return crypto.randomBytes(3).toString('hex').toLowerCase();
}

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'eva',
    entities: Object.values(allEntities),
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Database connected');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. 创建演示用户 (demo)
    const userRepository = dataSource.getRepository(User);
    const existingDemo = await userRepository.findOne({
      where: { employeeId: 'demo' },
    });

    let adminUser: User;
    if (!existingDemo) {
      adminUser = userRepository.create({
        name: 'Demo User',
        employeeId: 'demo',
        role: UserRole.ADMIN,
        avatar: null,
      });
      await userRepository.save(adminUser);
      console.log('Created demo user:', adminUser.name);
    } else {
      adminUser = existingDemo;
      console.log('Demo user already exists:', adminUser.name);
    }

    // Create additional demo users
    const demoUsers: User[] = [adminUser];
    const demoUserData = [
      { name: '张三', employeeId: 'user001', role: UserRole.USER },
      { name: '李四', employeeId: 'user002', role: UserRole.USER },
      { name: '王五', employeeId: 'user003', role: UserRole.USER },
      { name: '赵六', employeeId: 'user004', role: UserRole.USER },
    ];
    for (const u of demoUserData) {
      const existing = await userRepository.findOne({ where: { employeeId: u.employeeId } });
      if (!existing) {
        const user = userRepository.create(u);
        await userRepository.save(user);
        demoUsers.push(user);
        console.log('Created user:', user.name);
      } else {
        demoUsers.push(existing);
      }
    }

    // 2. 创建默认项目
    const projectRepository = dataSource.getRepository(Project);
    const existingProject = await projectRepository.findOne({
      where: { name: '默认项目' },
    });

    let defaultProject: Project;
    if (!existingProject) {
      defaultProject = projectRepository.create({
        name: '默认项目',
        pid: crypto.randomBytes(4).toString('hex'),
        description: '系统自动创建的默认项目',
        source: ProjectSource.DIRECT,
        createMode: 'direct',
        userCount: 2,
        encryption: {
          keyName: crypto.randomUUID(),
          issueCode: crypto.randomBytes(16).toString('hex'),
          generated: true,
        },
        admins: [adminUser],
        users: [demoUsers[1]],
      });
      await projectRepository.save(defaultProject);
      console.log('Created default project:', defaultProject.name);
    } else {
      defaultProject = existingProject;
      console.log('Default project already exists:', defaultProject.name);
    }

    // Create additional demo projects
    const demoProjects = [
      { name: '智能客服评测项目', description: '用于智能客服系统的评测与优化', source: ProjectSource.IDEALAB, createMode: 'linked', appCode: 'smart-cs' as string | null, platform: 'IDEALAB' as string | null, linkedApp: 'smart-cs' as string | null, jointApps: null as string[] | null },
      { name: '代码生成评测项目', description: '代码生成Agent的评测与对比', source: ProjectSource.DIRECT, createMode: 'direct', appCode: null as string | null, platform: null as string | null, linkedApp: null as string | null, jointApps: null as string[] | null },
      { name: '文档分析联合项目', description: '文档分析与摘要生成的联合评测', source: ProjectSource.JOINT, createMode: 'joint', appCode: null as string | null, platform: null as string | null, linkedApp: null as string | null, jointApps: ['doc-summary', 'smart-cs'] as string[] | null },
      { name: 'Demo演示项目', description: '用于演示和测试的项目', source: ProjectSource.DEMO, createMode: 'direct', appCode: null as string | null, platform: null as string | null, linkedApp: null as string | null, jointApps: null as string[] | null },
    ];
    for (const pd of demoProjects) {
      const existing = await projectRepository.findOne({ where: { name: pd.name } });
      if (!existing) {
        const p = projectRepository.create({
          ...pd,
          pid: crypto.randomBytes(4).toString('hex'),
          userCount: 3,
          encryption: {
            keyName: crypto.randomUUID(),
            issueCode: crypto.randomBytes(16).toString('hex'),
            generated: true,
          },
          admins: [adminUser, demoUsers[1]],
          users: [demoUsers[2], demoUsers[3]],
        });
        await projectRepository.save(p);
        console.log('Created project:', p.name);
      }
    }

    // 3. 创建示例 AI Application
    const appRepository = dataSource.getRepository(AIApplication);
    const versionRepository = dataSource.getRepository(AppVersion);

    const sampleApps = [
      {
        name: '智能客服助手',
        description: '基于大模型的智能客服系统，支持多轮对话和意图识别',
        icon: 'https://cdn.example.com/icons/customer-service.png',
        latestVersion: '1.2.0',
        gitRepoUrl: 'https://github.com/example/customer-service-assistant',
      },
      {
        name: '代码生成器',
        description: 'AI驱动的代码生成工具，支持多种编程语言',
        icon: 'https://cdn.example.com/icons/code-generator.png',
        latestVersion: '2.0.1',
        gitRepoUrl: 'https://github.com/example/code-generator',
      },
      {
        name: '文档分析助手',
        description: '智能文档分析和摘要生成工具',
        icon: 'https://cdn.example.com/icons/doc-analyzer.png',
        latestVersion: '0.9.5',
        gitRepoUrl: null,
      },
    ];

    for (const appData of sampleApps) {
      const existingApp = await appRepository.findOne({
        where: { name: appData.name, projectId: defaultProject.id },
      });

      if (!existingApp) {
        const app = appRepository.create({
          ...appData,
          projectId: defaultProject.id,
        });
        await appRepository.save(app);
        console.log('Created AI Application:', app.name);

        // 创建版本记录
        const version = versionRepository.create({
          appId: app.id,
          version: appData.latestVersion,
          config: {
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2048,
          },
        });
        await versionRepository.save(version);
        console.log('Created version for', app.name, ':', version.version);
      } else {
        console.log('AI Application already exists:', appData.name);
      }
    }

    // 4. 创建示例评测集
    const evalSetRepository = dataSource.getRepository(EvalSet);
    const sampleEvalSets = [
      {
        name: '通用对话评测集',
        type: EvalSetType.TEXT,
        description: '包含多轮对话、意图识别等评测数据',
        dataCount: 1000,
        sourceType: EvalSetSourceType.PUBLIC,
      },
      {
        name: '代码生成评测集',
        type: EvalSetType.CODE,
        description: '代码生成、代码补全评测数据',
        dataCount: 500,
        sourceType: EvalSetSourceType.CUSTOM,
      },
      {
        name: '客服场景评测集',
        type: EvalSetType.TEXT,
        description: '客服场景对话评测数据',
        dataCount: 2000,
        sourceType: EvalSetSourceType.ONLINE_EXTRACT,
      },
    ];

    for (const evalSetData of sampleEvalSets) {
      const existingEvalSet = await evalSetRepository.findOne({
        where: { name: evalSetData.name },
      });

      if (!existingEvalSet) {
        const evalSet = evalSetRepository.create({
          ...evalSetData,
          createdBy: adminUser.name,
        });
        await evalSetRepository.save(evalSet);
        console.log('Created EvalSet:', evalSet.name);
      } else {
        console.log('EvalSet already exists:', evalSetData.name);
      }
    }

    // 5. 创建示例评测指标
    const metricRepository = dataSource.getRepository(EvalMetric);
    const sampleMetrics = [
      {
        name: '回答准确性',
        description: '评估模型回答的准确程度',
        type: MetricType.LLM,
        scope: MetricScope.PUBLIC,
        prompt: '请评估以下回答的准确性，给出0-10分的评分...',
      },
      {
        name: '响应相关性',
        description: '评估回答与问题的相关程度',
        type: MetricType.LLM,
        scope: MetricScope.PUBLIC,
        prompt: '请评估以下回答与问题的相关性...',
      },
      {
        name: '代码通过率',
        description: '评估生成代码的测试通过率',
        type: MetricType.CODE,
        scope: MetricScope.PERSONAL,
        codeRepoUrl: 'https://github.com/example/code-evaluator',
        codeBranch: 'main',
      },
    ];

    for (const metricData of sampleMetrics) {
      const existingMetric = await metricRepository.findOne({
        where: { name: metricData.name },
      });

      if (!existingMetric) {
        const metric = metricRepository.create({
          ...metricData,
          createdBy: adminUser.name,
          updatedBy: adminUser.name,
        });
        await metricRepository.save(metric);
        console.log('Created EvalMetric:', metric.name);
      } else {
        console.log('EvalMetric already exists:', metricData.name);
      }
    }

    // 6. 创建示例 Prompt
    const promptRepository = dataSource.getRepository(Prompt);
    const samplePrompts = [
      {
        name: '通用问答Prompt',
        content: '你是一个 helpful 的 AI 助手。请回答用户的问题。\n\n用户问题：{{question}}',
        description: '用于通用问答场景的Prompt模板',
        metadata: { tags: ['通用', '问答'], category: 'general' },
      },
      {
        name: '代码生成Prompt',
        content: '你是一个专业的程序员。请根据需求生成高质量的代码。\n\n需求：{{requirement}}\n语言：{{language}}',
        description: '用于代码生成场景的Prompt模板',
        metadata: { tags: ['代码', '生成'], category: 'code' },
      },
    ];

    for (const promptData of samplePrompts) {
      const existingPrompt = await promptRepository.findOne({
        where: { name: promptData.name },
      });

      if (!existingPrompt) {
        const prompt = promptRepository.create({
          ...promptData,
          createdBy: adminUser.name,
        });
        await promptRepository.save(prompt);
        console.log('Created Prompt:', prompt.name);
      } else {
        console.log('Prompt already exists:', promptData.name);
      }
    }

    await queryRunner.commitTransaction();
    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
