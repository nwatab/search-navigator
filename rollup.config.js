import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import fs from 'fs';
import path from 'path';


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
    }
  };
}

export default {
  input: 'src/content.ts',
  output: {
    file: 'dist/content.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    typescript(),
    terser(), 
    copyPlugin({ src: 'manifest.json', dest: 'dist' })
  ]
};
