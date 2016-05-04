/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const merge = require('webpack-merge');

const TARGET = process.env.npm_lifecycle_event;
const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, 'www');

/* eslint-enable */
const common = {
    entry: {
        app: [path.join(APP_PATH, './app/app.js')],
        vendor: [
            'angular',
            'angular-ui-router',
            'angular-animate',
            'angular-sanitize',
            'angular-storage',
            'restangular',
            'ng-file-upload',
        ],
    },
    output: {
        path: BUILD_PATH,
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            {test: /\.js$/, exclude: /(node_modules|lib)/, loader: 'ng-annotate!babel?stage=0'},
            {test: /\.json$/, loader: 'json'},
            {test: /\.(png|jpg)$/, loader: 'url?limit=25000'},
            {test: /\.html$/, exclude: /node_modules/, loader: 'html!html-minify'},
            {test: /\.(ttf|eot|svg|otf)(\?v=\d(\.\d){2})?$/, loader: 'file'},
            {test: /\.woff(2)?(\?v=\d(\.\d){2})?$/, loader: 'url?limit=10000&minetype=application/font-woff'},
        ],
    },
    postcss: [autoprefixer],
    plugins: [
        new webpack.ProvidePlugin({
            _: 'lodash',
        }),
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
    ],
};

if (TARGET === 'start') {
    module.exports = merge(common, {
        devTool: 'eval-source-map',
        devServer: {
            historyApiFallback: true,
            hot: true,
            inline: true,
            progress: true,
            contentBase: 'www',
            port: 8080,
            host: 'localhost',
            // proxy: {
            //     '/apis/**': {
            //         target: 'http://www.cyt-rain.cn:3001',
            //         changeOrigin: true,
            //     },
            // },
        },
        module: {
            loaders: [
                {test: /\.css$/, exclude: /(lib)/, loader: 'style!css!postcss-loader'},
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': '"development"',
            }),
            new webpack.HotModuleReplacementPlugin(),
        ],
    });
}

if (TARGET === 'build') {
    module.exports = merge(common, {
        module: {
            loaders: [{
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader'),
            }],
        },
        plugins: [
            new ExtractTextPlugin('[name].css', {
                disable: false,
                allChunks: true,
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': '"production"',
            }),
        ],
    });
}
