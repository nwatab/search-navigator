import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import scss from 'rollup-plugin-scss';
import autoprefixer from 'autoprefixer';

function copyPlugin({ src, dest }) {
  return {
    name: 'copy-plugin',
    writeBundle() {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      const destPath = path.join(dest, path.basename(src));
      fs.copyFileSync(src, destPath);
      console.log(`Copied ${src} -> ${destPath}`);
    },
  };
}

export default {
  input: 'src/content.ts',
  output: {
    file: 'dist/content.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    typescript(),
    scss({
      fileName: 'style.css',
      processor: () => postcss([autoprefixer()]),
      outputStyle: 'compressed',
    }),
    terser({
      compress: {
        drop_console: true,
      },
    }),
    copyPlugin({ src: 'manifest.json', dest: 'dist' }),
  ],
};
