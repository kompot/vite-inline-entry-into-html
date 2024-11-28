import fs from "fs";
import path from "path";

import {
  Plugin,
  OutputBundle,
  OutputOptions,
  NormalizedOutputOptions,
} from "rollup";

interface InjectBuildResultsOptions {
  tagType?: "script" | "style";
  position?: "head" | "body";
  assetFilter?: (asset: OutputBundle[keyof OutputBundle]) => boolean;
}

export function injectBuildResults(
  options: InjectBuildResultsOptions = {}
): Plugin {
  const {
    tagType = "script",
    position = "head",
    assetFilter = () => true,
  } = options;

  let extractedAssets: OutputBundle[keyof OutputBundle][] = [];

  return {
    name: "inject-build-results",
    // enforce: "post",
    // apply: "build",

    generateBundle(_: NormalizedOutputOptions, bundle: OutputBundle) {
      // Filter the assets based on the provided assetFilter function
      extractedAssets = Object.values(bundle).filter(
        (chunk) => chunk.type === "chunk" && assetFilter(chunk)
      );
    },

    writeBundle(outputOptions: OutputOptions) {
      const htmlFilePath = path.resolve(outputOptions.dir || "", "index.html");

      if (!fs.existsSync(htmlFilePath)) {
        this.error(`index.html not found at ${htmlFilePath}`);
        return;
      }

      let htmlContent = fs.readFileSync(htmlFilePath, "utf-8");

      // Generate tags based on the extracted assets
      const tags = extractedAssets
        .map((asset) => {
          const src = (asset as { fileName: string }).fileName; // Ensure `fileName` exists
          if (tagType === "script") {
            const assetFilePath = path.resolve(outputOptions.dir || "", src);
            const scriptContent = fs.readFileSync(assetFilePath);
            return `<script type="module">${scriptContent}</script>`;
          } else if (tagType === "style") {
            return `<link rel="stylesheet" href="${src}">`;
          }
          return "";
        })
        .join("\n");

      // Inject the tags into the specified position
      if (position === "head") {
        htmlContent = htmlContent.replace("</head>", `${tags}\n</head>`);
      } else if (position === "body") {
        htmlContent = htmlContent.replace("</body>", `${tags}\n</body>`);
      }

      // Write back the modified HTML
      fs.writeFileSync(htmlFilePath, htmlContent, "utf-8");
    },
  };
}
