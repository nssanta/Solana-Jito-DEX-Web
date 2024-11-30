const path = require('path');
const webpack = require('webpack');

module.exports = {
    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules',
        ],
        fallback: {
            "path": require.resolve("path-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "crypto": require.resolve("crypto-browserify"),
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    // Другие настройки webpack, если есть
};
