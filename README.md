# 《 hotload 》 node 热更新工具

hotload 解决在日常开发中，后端修改代码可能需要重启服务器，前端构建插件时，需要穿插编译操作等问题。

## 场景 1

后端修改代码可能需要重启服务器。
以下是一个后端代码的启动示例。

```javascript
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { home } from '@/controller/base-controller';
import { w } from 'modmgr';

const app = new Hono();
app.get('/', w(import('./controller.mjs')));

serve(app);
```

\_nodeModulePaths
\_resolveFilename
\_extensions
\_pathCache
\_cache
\_findPath
\_compile
