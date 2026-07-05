# 我的图床

一个只用 GitHub Pages 托管的免费个人静态图床首页。没有后端、数据库、登录、注册、上传接口或第三方存储服务。

## 本地预览

先安装依赖：

```bash
npm install
```

启动预览：

```bash
npm run dev
```

打包检查：

```bash
npm run build
```

## 放图片的位置

把图片文件放到：

```txt
public/images/
```

例如：

```txt
public/images/xia-yunzhi-01.jpg
```

Vite 构建后，这张图会变成站点里的：

```txt
/images/xia-yunzhi-01.jpg
```

## 添加图片信息

打开：

```txt
src/data/images.ts
```

新增一条记录：

```ts
{
  id: "004",
  title: "xia-yunzhi-01",
  fileName: "xia-yunzhi-01.jpg",
  category: "角色图",
  path: "/images/xia-yunzhi-01.jpg",
}
```

当前分类写死为：

- 全部
- 角色图
- 参考图
- 网站素材

如果要新增分类，需要同时修改 `src/data/images.ts` 里的类型，以及 `src/App.tsx` 里的 `categories`。

## 隐藏图片和真正删除图片

页面卡片上的“从页面隐藏”只会在当前浏览器里隐藏这张图片。它会把图片的 `id` 保存到浏览器的 `localStorage`，不会删除 GitHub 仓库里的图片文件，也不会修改 `src/data/images.ts`。

如果误点了隐藏，可以点击页面上的“恢复隐藏图片”，恢复当前浏览器里隐藏的图片。

如果你想真正删除一张图片，需要手动删除两处：

1. 删除 `public/images/` 里的图片文件。
2. 删除 `src/data/images.ts` 里对应的图片记录。

删除后重新提交并部署，GitHub Pages 上才会真正不再包含这张图片。

## 修改站点地址

打开：

```txt
src/config.ts
```

把占位地址改成你的真实 GitHub Pages 地址：

```ts
export const SITE_BASE_URL = "https://你的GitHub用户名.github.io/仓库名";
```

例如仓库叫 `image-bed`，GitHub 用户名叫 `yourname`，则改成：

```ts
export const SITE_BASE_URL = "https://yourname.github.io/image-bed";
```

复制按钮会复制：

```txt
https://你的GitHub用户名.github.io/仓库名/images/图片名.jpg
```

## GitHub Pages 部署

项目已经包含 `.github/workflows/deploy.yml`，适合用 GitHub Actions 部署到 GitHub Pages。

操作步骤：

1. 把这个项目提交到你的 GitHub 仓库。
2. 在 GitHub 仓库页面进入 `Settings`。
3. 进入 `Pages`。
4. `Build and deployment` 的 `Source` 选择 `GitHub Actions`。
5. 推送到 `main` 分支后，GitHub 会自动构建并发布。

如果你的默认分支不是 `main`，请把 `.github/workflows/deploy.yml` 里的 `branches: ["main"]` 改成你的分支名。

## GitHub Pages 路径配置

`vite.config.ts` 会在 GitHub Actions 里自动读取仓库名，并设置正确的 GitHub Pages 路径。

如果你想在本地手动模拟仓库路径构建，可以这样运行：

```bash
VITE_BASE_PATH=/仓库名/ npm run build
```

## 注意

- 这不是上传系统，新增图片需要手动把图片放进 `public/images/`，再在 `src/data/images.ts` 里加记录。
- 不要把私密图片放进仓库；GitHub Pages 发布后图片是公开可访问的。
- 图片总量不大时很适合这样做，几十张、1GB 以内的个人图床足够简单省心。
