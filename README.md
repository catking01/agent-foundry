# 群智工坊：Agent Foundry

**一个 AI 公司模拟经营游戏。**

你经营一家 AI 公司，管理 8 个 AI 员工和 5 个车间，把客户订单从接单一路推进到交付。
所有 AI 员工都是确定性模拟的——不调用真实 LLM，不联网，不需要后端。

---

## 这是什么

群智工坊是一个**确定性的组织模拟沙盒**。你管理一群模拟的 AI 员工，他们通过车间流水线处理客户订单：

```
接单 → 规划 → 工程实现 → 验证 → 审计 → 交付
```

游戏探索的核心问题是：**多 agent 并行路线、artifact 质量、证据完整性、overclaim 风险、组织信任**之间的结构性关系。

## 这不是什么

- ❌ **不是**真实的 AI 公司运行时
- ❌ **不是**真实的 LLM agent（所有员工都是确定性模拟）
- ❌ **没有**验证 Runtime Lab
- ❌ **没有**证明真实多 agent 科研能力
- ❌ **没有**连接任何外部 API 或后端

---

## 快速开始

```bash
npm ci               # 安装依赖
npm run dev          # 启动开发服务器 → http://localhost:5173
npm run test         # 运行全部测试（253 个）
npm run build        # 生产构建 → dist/
```

在线试玩：

```
https://catking01.github.io/agent-factory/
```

---

## 怎么玩

### 第一次玩（跟着左侧教程走）

1. 点顶部 **Orders** 标签 → 找一个 Available 订单 → 点 **Accept**
2. 看右下角 **AI Workers** 浮窗 → 员工会自动开始工作
3. 点 **Tick →** 推进时间，或点 **▶ Auto** 自动运行
4. 车间自动跑完 Planning → Engineering → Validation → Audit → Delivery
5. 订单交付后获得收入

### 看懂关键指标

| 指标 | 含义 | 危险线 |
|---|---|---|
| **Cash（现金）** | 付工资 + 维护费 | < -8000 破产 |
| **Reputation（声誉）** | 客户信任度 | ≤ 10 崩溃 |
| **Evidence（证据完整性）** | 交付物是否支撑其声明 | ≤ 20 崩溃 |

### 策略差异

- **速度优先**：接所有单，跳过审计 → 赚钱快，但证据崩盘
- **质量优先**：严格验证 + 审计 → 事故少，但成本高易破产
- **并行激进**：每个订单开 2-3 条路线竞争 → 成本极高，复杂订单质量好
- **平衡策略**：适度并行 + 验证审计 → 信任指标最好

### 多路线并行

接单后在 Orders 标签选 **2 Routes** 或 **3 Routes**——多个员工各自产出方案，
系统按 **质量 + 证据 - 缺陷 - overclaim** 评分选出最优。成本更高，但复杂任务成功率更高。

### Debugger 调试器

顶部 **Debugger** 标签可以：
- 输入任意 seed / 策略 / 时间范围，查看模拟结果
- 看钱花在哪（工资、维护、并行路线、升级）
- 看负面事件（哪个 tick 出了 audit fail、late delivery）
- 看关键 artifact（哪些产出有 overclaim 风险）
- 看信任时间线（声誉 + 证据如何下降）

### Agent 工作浮窗

右下角 **AI Workers** 浮窗始终可见，实时显示：
- 多少员工在工作 / 空闲 / 疲劳 / 阻塞
- 每个员工当前任务、车间、剩余工作量
- 各车间排队 / 活跃任务数
- 最近事件日志

---

## 可选功能：本地 AI 影子审计

如果你本地安装了 [Ollama](https://ollama.com)，可以启用可选的 LLM 语义审计：

```bash
AGENT_FOUNDRY_ENABLE_OLLAMA=1 npm run test:ollama
```

LLM 会评估 artifact 是否存在语义层面的 overclaim 或 evidence gap，但：
- **永远不会**修改游戏状态
- **永远不会**影响交付
- **永远不会**改变 replay hash
- **仅作为**只读的 advisory 信号

---

## 技术栈

React 18 · TypeScript · Vite · Vitest · Recharts（调试器图表）· 可选 Ollama（仅本地，需手动开启）

## 项目结构

```
src/sim/     — 确定性模拟引擎（types, tick, workshops, agents,
               artifacts, validation, audit, economy, replay, rng）
src/game/    — 玩家操作、selector、存档
src/data/    — 初始员工、车间、订单、场景、策略配置
src/ui/      — React 组件（Dashboard, OrderBoard, AgentPanel,
               DebuggerPanel, Agent HUD, Tutorial, Shadow Advisory）
src/ai/      — 可选本地 Ollama 影子审计（永不修改 GameState）
tests/       — 单元 + 集成 + 平衡 + UI 测试
```

## 边界声明

详见 `verification/G22/KNOWN_LIMITATIONS.md` 和 `verification/G22/NON_CLAIMS.md`。
从 G0 到 G24 的完整证据链见 `verification/` 目录。

## 许可证

MIT
