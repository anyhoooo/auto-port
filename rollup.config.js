import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

let jsConfig = {
    input: 'src/index.js',
    output: [{
        name: 'auto-port',
        file: 'lib/auto-port.es.js',
        format: 'es'
    }, {
        name: 'auto-port.js',
        file: 'lib/auto-port.cjs.js',
        format: 'cjs'
    }],
    plugins: [
        resolve(),
        json(),
        babel(),
        commonjs({
            include: /node_modules/
        }),
    ],
};

export default [jsConfig];