import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import postcss from 'postcss';
import scss from 'rollup-plugin-scss';
import copy from 'rollup-plugin-copy';
import autoprefixer from 'autoprefixer';
import { readFileSync } from 'fs';

// Function to extract constants from the TypeScript constants file
function getConstants() {
  const constantsContent = readFileSync('./src/constants.ts', 'utf8');
  const constants = {};

  // Parse the constants from the TypeScript file
  const lines = constantsContent.split('\n');
  for (const line of lines) {
    const match = line.match(/export const (\w+) = ['"](.+?)['"];/);
    if (match) {
      constants[match[1]] = match[2];
    }
  }

  return constants;
}

// Transform function to replace placeholder constants with actual values
function replaceConstantsInHtml(contents) {
  const constants = getConstants();
  let transformed = contents.toString();

  // Replace any __CONSTANT_NAME__ placeholders with actual values
  Object.entries(constants).forEach(([constantName, value]) => {
    const regex = new RegExp(`__${constantName}__`, 'g');
    transformed = transformed.replace(regex, value);
  });

  return transformed;
}

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
          {
            src: 'src/popup.html',
            dest: 'dist',
            transform: replaceConstantsInHtml,
          },
          { src: 'src/popup.css', dest: 'dist' },
        ],
      }),
    ].filter(Boolean), // Filter out false values
  },
];
