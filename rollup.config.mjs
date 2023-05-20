import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';

export default defineConfig({
    input: 'lib/index.ts',
    output: [
        {
            file: 'dist/index.common.js',
            format: 'commonjs'
        },
        {
            file: 'dist/index.esm.js',
            format: 'esm'
        }
    ],
    plugins: [
        nodeResolve(),
        esbuild({
            include: /\.[jt]sx?$/, // default, inferred from `loaders` option
            exclude: /node_modules/, // default
            target: 'es2015',
            tsconfig: 'tsconfig.json',
            loaders: {
                // Add .json files support
                // require @rollup/plugin-commonjs
                '.json': 'json',
            },
        })
    ],
    external: [
        'axios',
        'lodash-es'
    ]
});