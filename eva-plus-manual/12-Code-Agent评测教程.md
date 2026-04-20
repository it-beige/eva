# Code Agent评测教程

**作者**: 老姜、芮奇、半石等  
**更新时间**: 04-17 09:56

---

**Code Agent**: 应用于软件工程和编程领域,利用大型语言模型(LLM)的推理能力,能够接收自然语言指令,并能**动态地指导自身流程和工具的使用**,以完成复杂的、多步骤的编程任务,包括代码的生成、修改、调试和测试等。如cursor、通义灵码等。

---

## 一、整体使用逻辑说明

要发起Code Agent评测,就需要:

1. 在Eva+定义管理自己的个人Code Agent应用,详见**二、AI应用接入**
2. 引入Eva+管理的市面常见Code评测用Benchmark,或者导入自建的code评测集,详见**三、评测集管理**
3. 基于管理的应用及评测集发起评测任务,详见**四、评测任务定义及结果分析**

---

## 二、AI应用接入

### 2.1 UI操作

1. 进入AI应用管理页面,点击**新增AI应用**
2. 在唤出的抽屉中可以选择:
   - 引入Eva+管理的公共应用
   - 自定义应用,为保障自建应用可以顺利被平台读取并在沙箱运行,自定义应用需要按照Eva+的规范进行编写git仓库后传入
3. 应用创建完成后,如果存在配置信息,可以选择应用卡片页的详情进行编辑
4. 如果需要基于当前AI应用发起评测,除了可以在评测任务模块通过新增点选,也可以在应用管理直接选择【评测】

### 2.2 git仓库规范

**样例仓库**: https://code.alibaba-inc.com/evaplus-agents-public/evaplus-agent-demo/tree/main

#### 2.2.1 文件&目录说明

**meta.yaml**: 定义install.sh脚本和start.sh执行需要的参数规则。

```yaml
# agent展示名称
name: iflow-cli
description: 阿里巴巴集团自研iFlow-CLI
# 定义这个agent需要使用到的配置信息有哪些
settings:
  API_KEY:
    title: API KEY
    description: iflow的api key
    type: string
    required: true
    default: your-token
  BASE_URL:
    title: Base Url
    description: 模型调用的base_url
    type: string
    required: true
    default: https://api.open.ai/v1
```

**install.sh**: 执行agent的安装脚本,将agent安装到当前case虚拟机执行环境中。

**start.sh**: 运行agent,执行实际的任务。

**约定输入**: PROMPT_FILE参数为约定参数,标识PROMPT内容的文件目录。

**约定输出**: 保障Agent能正常运行即可。

#### 2.2.2 agent版本号管理

使用git branch进行版本管理,所有以versions/{versionId}(比如versions/v1.0.2)形式命名的branch均被会在evaplus的产品上作为版本进行管理。

#### 2.2.3 需支持的系统

主流要适配的系统有:ubuntu:24.04。

### 2.3 内置应用

- https://code.alibaba-inc.com/evaplus-agents-public/evaplus-agent-iflow-cli
- https://code.alibaba-inc.com/evaplus-agents-public/qwen-code
- https://code.alibaba-inc.com/evaplus-agents-public/claude-code-inner

---

## 三、评测集管理

### 3.1 UI操作

1. 进入评测集管理页面,点击**新建评测数据集**
2. 在唤出的抽屉中选择code类型:
   - 引用公共评测集,即引入Eva+内置的市面Benchmark
   - 自定义评测集,需要按照规范创建好评测集后上传git地址
3. 创建好的评测集,可以点击查看git仓库详情
4. 如果需要基于当前评测集或者评测数据项发起评测,也可以在评测集模块直接选择【发起评测】

### 3.2 git仓库规范

#### 3.2.1 文件&目录说明

根目录下创建meta.yaml文件和cases文件夹,cases文件夹中存放评测用例。

**meta.yaml**: 用于定义评测集描述信息。

#### 3.2.2 评测用例文件说明

**task.yaml**: 用于描述当前评测用例的相关信息,重点关注instruction和image参数。

**run-tests.sh**: 当前评测用例的执行文件,执行结果需按照约定输出规范写入"/tests/validation-result.json"文件。

约定输出的json规范:

- score是评测分数
- reason是原因描述

### 3.3 内置评测集

- https://code.alibaba-inc.com/evaplus-datasets-public/terminal-bench
- https://code.alibaba-inc.com/evaplus-datasets-public/terminal-bench-2.0
- https://code.alibaba-inc.com/evaplus-datasets-public/terminal-bench-head
- https://code.alibaba-inc.com/evaplus-datasets-public/swebench-multilingual
- https://code.alibaba-inc.com/evaplus-datasets-public/swebench-pro
- https://code.alibaba-inc.com/evaplus-datasets-public/swebench-train-data
- https://code.alibaba-inc.com/evaplus-datasets-public/swebench-verified

---

## 四、评测任务创建及结果

### 4.1 评测任务创建

1. 进入评测任务管理页面,点击**新建评测任务**
2. 在唤出的页面中选择Code agent类型:
   - 填入评测任务名称
   - 选择评测集以及具体的评测项(默认全部评测项)
   - 选择AI应用及版本
   - 配置信息
3. 配置完成后点击确认即可发起评测

### 4.2 评测任务详情查看

1. 评测任务管理页可以查看所有任务的运行状态及平均分,同时支持查看运行日志
2. 点击评测任务可以查看具体的任务项详情
