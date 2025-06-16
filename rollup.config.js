import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import scss from 'rollup-plugin-scss';
import autoprefixer from 'autoprefixer';

// Get environment from ENV variable (defaults to 'dev' if not set)
const ENV = process.env.ENV || 'dev';

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

// Create separate configs for each entry point
export default [
  {
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
      // Only apply terser with compression in production mode
      ENV === 'prod' &&
        terser({
          compress: {
            drop_console: true,
          },
        }),
      copyPlugin({ src: 'manifest.json', dest: 'dist' }),
      copyPlugin({ src: 'icons/icon16x16.png', dest: 'dist' }),
      copyPlugin({ src: 'icons/icon32x32.png', dest: 'dist' }),
      copyPlugin({ src: 'icons/icon48x48.png', dest: 'dist' }),
      copyPlugin({ src: 'icons/icon128x128.png', dest: 'dist' }),
      copyPlugin({ src: 'src/popup.html', dest: 'dist' }),
    ].filter(Boolean), // Filter out false values
  },
  {
    input: 'src/background.ts',
    output: {
      file: 'dist/background.js',
      format: 'iife',
      sourcemap: true,
    },
    plugins: [
      typescript(),
      // Only apply terser with compression in production mode
      ENV === 'prod' &&
        terser({
          compress: {
            drop_console: true,
          },
        }),
    ].filter(Boolean), // Filter out false values
  },
  {
    input: 'src/popup.ts',
    output: {
      file: 'dist/popup.js',
      format: 'iife',
      sourcemap: true,
    },
    plugins: [
      typescript(),
      // Only apply terser with compression in production mode
      ENV === 'prod' &&
        terser({
          compress: {
            drop_console: true,
          },
        }),
    ].filter(Boolean), // Filter out false values
  },
];
