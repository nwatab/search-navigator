import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import postcss from 'postcss';
import scss from 'rollup-plugin-scss';
import copy from 'rollup-plugin-copy';
import autoprefixer from 'autoprefixer';

// Get environment from ENV variable (defaults to 'dev' if not set)
const ENV = process.env.ENV || 'dev';
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
      copy({
        targets: [
          { src: 'manifest.json', dest: 'dist' },
          { src: 'icons/*.png', dest: 'dist' },
        ],
      }),
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
      copy({
        targets: [
          { src: 'src/popup.html', dest: 'dist' },
          { src: 'src/popup.css', dest: 'dist' },
        ],
      }),
    ].filter(Boolean), // Filter out false values
  },
];
