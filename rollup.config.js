import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import path from 'path';

// カスタムコピー用プラグイン
function copyPlugin({ src, dest }) {
  return {
    name: 'copy-plugin',
    writeBundle() {
      // コピー先ディレクトリが存在しなければ作成
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const destPath = path.join(dest, path.basename(src));
      fs.copyFileSync(src, destPath);
      console.log(`Copied ${src} -> ${destPath}`);
    }
  };
}

export default {
  input: 'src/content.ts',
  output: {
    file: 'dist/content.js',
    format: 'iife', // コンテンツスクリプトは即時実行関数形式 (IIFE) で読み込むと安全です
    sourcemap: true
  },
  plugins: [
    typescript(),
    copyPlugin({ src: 'manifest.json', dest: 'dist' })
  ]
};
