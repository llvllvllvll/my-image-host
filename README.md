# 我的图床

一个使用 GitHub Pages 托管的个人图床仓库。当前推荐用 PicGo 把图片真正上传到 GitHub 仓库的 `img/` 目录，再用 GitHub Pages 公开链接引用图片。

没有后端、数据库、登录系统、上传接口、Supabase、Cloudflare R2 或第三方 API。GitHub token 只保存在你本机的 PicGo 配置里，不写进本项目。

## PicGo 上传方案

仓库信息：

```txt
GitHub 用户名：llvllvllvll
仓库名：my-image-host
分支：main
图片目录：img/
```

上传成功后的优先链接格式：

```txt
https://llvllvllvll.github.io/my-image-host/img/图片名.jpg
```

备用 jsDelivr CDN 格式：

```txt
https://cdn.jsdelivr.net/gh/llvllvllvll/my-image-host@main/img/图片名.jpg
```

jsDelivr 在不同地区、运营商和时段的访问表现可能不同，国内不保证一定稳定。优先使用 GitHub Pages 链接；只有在你的实际访问测试中 CDN 更快、更稳时，再考虑备用格式。

## 下载 PicGo

打开 PicGo 官方 GitHub Releases 页面，下载适合你电脑系统的安装包：

```txt
https://github.com/Molunerfinn/PicGo/releases
```

macOS 用户一般选择 `.dmg` 文件；如果是 Apple Silicon 芯片，优先选 arm64 版本。

## 生成 GitHub Token

在 GitHub 创建 Personal Access Token classic：

1. 打开 GitHub。
2. 进入右上角头像菜单。
3. 进入 `Settings`。
4. 进入 `Developer settings`。
5. 进入 `Personal access tokens`。
6. 选择 `Tokens (classic)`。
7. 点击 `Generate new token`。
8. 选择 `Generate new token (classic)`。
9. 设置一个较短或合理的过期时间。
10. 因为这个仓库是公开仓库，权限优先只勾选 `public_repo`。
11. 不要勾选 `delete_repo`、`admin:org`、`gist` 等不需要的权限。
12. 生成后复制 token，只粘贴到 PicGo 本地配置里。

如果 `public_repo` 上传失败，再检查仓库是否真的是 public、token 是否过期、PicGo 配置是否填错。不要直接把更大权限当作默认选择。

## PicGo GitHub 图床配置

在 PicGo 里选择 GitHub 图床，按下面填写：

```txt
repo: llvllvllvll/my-image-host
branch: main
path: img/
customUrl: https://llvllvllvll.github.io/my-image-host
```

`token` 填你刚刚在 GitHub 生成的 Personal Access Token classic。

配置完成后，可以拖拽一张图片到 PicGo 测试。上传成功后，链接应该类似：

```txt
https://llvllvllvll.github.io/my-image-host/img/example.jpg
```

如果刚上传完短时间打不开，先等 GitHub Pages 或浏览器缓存刷新一会儿，再重试。

## 安全提示

- Token 只填在 PicGo 本地配置里。
- 不要把 token 发给 Codex。
- 不要把 token 写进 `README.md`、代码、网页配置或任何项目文件。
- 不要把 token 上传到 GitHub。
- 如果 token 泄露，立刻到 GitHub 删除或重新生成。

## 网页展示页

这个项目仍然保留“我的图床”网页，但它只作为展示页使用，不提供真实上传功能，也不会假装能上传。

网页展示的数据来自：

```txt
src/data/images.ts
```

如果你想让 PicGo 上传到 `img/` 的图片也出现在网页展示页里，需要手动在 `src/data/images.ts` 增加记录，例如：

```ts
{
  id: "004",
  title: "example",
  fileName: "example.jpg",
  category: "网站素材",
  path: "/img/example.jpg",
}
```

然后用 GitHub Desktop 提交并 push。GitHub Pages 重新部署后，网页展示页才会更新。

## 本地预览

安装依赖：

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

## 隐藏图片和真正删除图片

页面卡片上的“从页面隐藏”只会在当前浏览器里隐藏这张图片。它会把图片的 `id` 保存到浏览器的 `localStorage`，不会删除 GitHub 仓库里的图片文件，也不会修改 `src/data/images.ts`。

如果误点了隐藏，可以点击页面上的“恢复隐藏图片”。

如果你想真正删除图片，需要手动删除仓库里的图片文件，例如：

```txt
img/图片名.jpg
```

如果这张图也显示在网页展示页里，还要删除 `src/data/images.ts` 里的对应记录。

## GitHub Pages 部署

项目包含 `.github/workflows/deploy.yml`，适合用 GitHub Actions 部署到 GitHub Pages。

推送到 `main` 分支后，GitHub Actions 会自动构建并发布。

GitHub Pages 地址：

```txt
https://llvllvllvll.github.io/my-image-host/
```

PicGo 上传图片的常用直链：

```txt
https://llvllvllvll.github.io/my-image-host/img/图片名.jpg
```

## GitHub Pages 路径配置

`vite.config.ts` 会在 GitHub Actions 里自动读取仓库名，并设置正确的 GitHub Pages 路径。

如果你想在本地手动模拟仓库路径构建，可以这样运行：

```bash
VITE_BASE_PATH=/my-image-host/ npm run build
```
