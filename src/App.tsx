import { useMemo, useState } from "react";
import { SITE_BASE_URL, SITE_DESCRIPTION, SITE_TITLE } from "./config";
import { ImageItem, images } from "./data/images";

const categories = ["全部", "角色图", "参考图", "网站素材"] as const;
const HIDDEN_IMAGE_IDS_KEY = "personal-image-library:hidden-image-ids";

type CategoryFilter = (typeof categories)[number];
type NewImageCategory = ImageItem["category"];

type NewImageDraft = {
  title: string;
  fileName: string;
  category: NewImageCategory;
};

function getImageUrl(image: ImageItem) {
  const base = SITE_BASE_URL.replace(/\/$/, "");
  const path = image.path.startsWith("/") ? image.path : `/${image.path}`;
  return `${base}${path}`;
}

function getImageAssetUrl(image: ImageItem) {
  const meta = import.meta as ImportMeta & { env?: { BASE_URL?: string } };
  const base = meta.env?.BASE_URL || "/";
  return `${base}${image.path.replace(/^\//, "")}`;
}

function escapeRecordValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getImageRecordCode(draft: NewImageDraft) {
  const safeFileName = draft.fileName.trim() || "your-image.jpg";
  const fileTitle = safeFileName.replace(/\.[^.]+$/, "");
  const safeTitle = draft.title.trim() || fileTitle || "your-image-title";
  const safeId =
    fileTitle
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "new-image-id";

  return `{
  id: "${escapeRecordValue(safeId)}",
  title: "${escapeRecordValue(safeTitle)}",
  fileName: "${escapeRecordValue(safeFileName)}",
  category: "${draft.category}",
  path: "/images/${escapeRecordValue(safeFileName)}",
}`;
}

function loadHiddenImageIds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(HIDDEN_IMAGE_IDS_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function saveHiddenImageIds(ids: string[]) {
  window.localStorage.setItem(HIDDEN_IMAGE_IDS_KEY, JSON.stringify(ids));
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Some embedded browsers expose clipboard.writeText but still reject it.
      // Fall through to the older copy path.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Copy failed");
  }
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("全部");
  const [searchText, setSearchText] = useState("");
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(null);
  const [copyResult, setCopyResult] = useState<{ id: string; ok: boolean } | null>(null);
  const [recordCopyResult, setRecordCopyResult] = useState<"idle" | "ok" | "error">("idle");
  const [isRecordHelperOpen, setIsRecordHelperOpen] = useState(false);
  const [newImageDraft, setNewImageDraft] = useState<NewImageDraft>({
    title: "",
    fileName: "",
    category: "角色图",
  });
  const [hiddenImageIds, setHiddenImageIds] = useState<string[]>(loadHiddenImageIds);

  const hiddenImageIdSet = useMemo(() => new Set(hiddenImageIds), [hiddenImageIds]);
  const hiddenImages = useMemo(
    () => images.filter((image) => hiddenImageIdSet.has(image.id)),
    [hiddenImageIdSet],
  );

  const filteredImages = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return images.filter((image) => {
      const isHidden = hiddenImageIdSet.has(image.id);
      const matchesCategory = activeCategory === "全部" || image.category === activeCategory;
      const matchesSearch =
        keyword.length === 0 ||
        image.fileName.toLowerCase().includes(keyword) ||
        image.title.toLowerCase().includes(keyword);

      return !isHidden && matchesCategory && matchesSearch;
    });
  }, [activeCategory, hiddenImageIdSet, searchText]);

  const newImageRecordCode = useMemo(() => getImageRecordCode(newImageDraft), [newImageDraft]);

  const handleCopy = async (image: ImageItem) => {
    try {
      await copyText(getImageUrl(image));
      setCopyResult({ id: image.id, ok: true });
    } catch {
      setCopyResult({ id: image.id, ok: false });
    }

    window.setTimeout(() => setCopyResult(null), 1600);
  };

  const handleHideImage = (image: ImageItem) => {
    setHiddenImageIds((currentIds) => {
      if (currentIds.includes(image.id)) {
        return currentIds;
      }

      const nextIds = [...currentIds, image.id];
      saveHiddenImageIds(nextIds);
      return nextIds;
    });
  };

  const handleRestoreHiddenImages = () => {
    saveHiddenImageIds([]);
    setHiddenImageIds([]);
  };

  const handleCopyRecordCode = async () => {
    try {
      await copyText(newImageRecordCode);
      setRecordCopyResult("ok");
    } catch {
      setRecordCopyResult("error");
    }

    window.setTimeout(() => setRecordCopyResult("idle"), 1600);
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Image Library</p>
          <h1 aria-label={SITE_TITLE}>
            我的<span>图床</span>
          </h1>
          <p className="description">{SITE_DESCRIPTION}</p>
          <p className="hero-note">Personal visual assets for websites, characters and references.</p>
        </div>
        <div className="stats-card" aria-label="图片统计">
          <div className="stats-badge" aria-hidden="true">IMG</div>
          <span>{filteredImages.length}</span>
          <strong>张图片</strong>
          <small>{hiddenImages.length > 0 ? `${hiddenImages.length} 张已隐藏` : "当前页面可见"}</small>
        </div>
      </section>

      <section className="control-panel" aria-label="筛选和管理图片">
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              className={activeCategory === category ? "tab active" : "tab"}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
        <label className="search-box">
          <span>搜索</span>
          <input
            aria-label="搜索文件名"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="搜索文件名..."
            type="search"
            value={searchText}
          />
        </label>
      </section>

      <section className="notice-bar" aria-label="隐藏说明">
        <div>
          <strong>轻量管理</strong>
          <p>隐藏只会在当前浏览器移出页面展示，不会删除 GitHub 仓库里的图片文件。</p>
        </div>
        <div className="notice-actions">
          <button onClick={() => setIsRecordHelperOpen((isOpen) => !isOpen)} type="button">
            添加图片记录
          </button>
          <button
            disabled={hiddenImages.length === 0}
            onClick={handleRestoreHiddenImages}
            type="button"
          >
            恢复隐藏图片
          </button>
        </div>
      </section>

      {isRecordHelperOpen && (
        <section className="record-helper" aria-label="新增图片记录助手">
          <div className="helper-copy">
            <p className="helper-kicker">新增图片说明</p>
            <h2>添加图片记录</h2>
            <p>
              这个助手只生成 `src/data/images.ts` 里的记录代码，不会上传图片，不会读取本地文件，
              也不会修改 GitHub 仓库。
            </p>
            <ol>
              <li>先把图片文件放到 `public/images/`。</li>
              <li>再到 `src/data/images.ts` 添加右侧生成的记录。</li>
              <li>用 GitHub Desktop 提交并 push。</li>
              <li>GitHub Pages 会自动重新部署并更新页面。</li>
            </ol>
          </div>
          <div className="helper-form">
            <label>
              <span>标题 title</span>
              <input
                onChange={(event) =>
                  setNewImageDraft((draft) => ({ ...draft, title: event.target.value }))
                }
                placeholder="xia-yunzhi-01"
                value={newImageDraft.title}
              />
            </label>
            <label>
              <span>文件名 fileName</span>
              <input
                onChange={(event) =>
                  setNewImageDraft((draft) => ({ ...draft, fileName: event.target.value }))
                }
                placeholder="xia-yunzhi-01.jpg"
                value={newImageDraft.fileName}
              />
            </label>
            <label>
              <span>分类 category</span>
              <select
                onChange={(event) =>
                  setNewImageDraft((draft) => ({
                    ...draft,
                    category: event.target.value as NewImageCategory,
                  }))
                }
                value={newImageDraft.category}
              >
                <option value="角色图">角色图</option>
                <option value="参考图">参考图</option>
                <option value="网站素材">网站素材</option>
              </select>
            </label>
            <pre>{newImageRecordCode}</pre>
            <button className="copy-button" onClick={handleCopyRecordCode} type="button">
              {recordCopyResult === "ok"
                ? "已复制"
                : recordCopyResult === "error"
                  ? "复制失败"
                  : "复制记录代码"}
            </button>
          </div>
        </section>
      )}

      {filteredImages.length > 0 ? (
        <section className="image-grid" aria-label="图片列表">
          {filteredImages.map((image) => {
            const fullUrl = getImageUrl(image);
            const copyState = copyResult?.id === image.id ? copyResult : null;

            return (
              <article className="image-card" key={image.id}>
                <button
                  className="image-preview"
                  onClick={() => setPreviewImage(image)}
                  type="button"
                  aria-label={`放大预览 ${image.fileName}`}
                >
                  <img alt={image.title} src={getImageAssetUrl(image)} loading="lazy" />
                </button>
                <div className="card-body">
                  <div className="card-title-row">
                    <div>
                      <h2>{image.fileName}</h2>
                      <p>{image.title}</p>
                    </div>
                    <span>{image.category}</span>
                  </div>
                  <div className="link-row">
                    <code>{fullUrl}</code>
                    <button className="copy-button" onClick={() => handleCopy(image)} type="button">
                      {copyState?.ok ? "已复制" : copyState ? "复制失败" : "复制链接"}
                    </button>
                  </div>
                  <button className="hide-button" onClick={() => handleHideImage(image)} type="button">
                    从页面隐藏
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="empty-state">
          <h2>没有找到图片</h2>
          <p>换一个分类或搜索词试试，也可以恢复已隐藏的图片。</p>
        </section>
      )}

      <footer className="page-footer">
        <span>Personal Image Library</span>
        <span>Built with GitHub Pages</span>
      </footer>

      {previewImage && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="图片预览">
          <button className="lightbox-backdrop" onClick={() => setPreviewImage(null)} type="button" />
          <div className="lightbox-panel">
            <div className="lightbox-header">
              <div>
                <h2>{previewImage.fileName}</h2>
                <p>{getImageUrl(previewImage)}</p>
              </div>
              <button className="close-button" onClick={() => setPreviewImage(null)} type="button">
                关闭
              </button>
            </div>
            <img alt={previewImage.title} src={getImageAssetUrl(previewImage)} />
          </div>
        </div>
      )}
    </main>
  );
}
