/* eslint-disable */
var path = require('path');
var webpack = require('webpack');
/* eslint-enable */

module.exports = {
    context: path.join(__dirname, '/src'),
    entry: {
      app: ['./app/app.js'],
      vendor: [
        //  'angular-storage',
        //  'restangular',
        //  'ng-file-upload',
      ],
    },
    output: {
        path: path.join(__dirname, '/www'),
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader: 'uglify!ng-annotate!babel'},
            {test: /\.less$/, loader: 'style!css!autoprefixer-loader!less'},
            {test: /\.json$/, loader: 'json'},
            {test: /\.(png|jpg)$/, loader: 'url?limit=25000'},
            {test: /\.html$/, exclude: /node_modules/, loader: 'html!html-minify'},
            {test: /\.(ttf|eot|svg|otf)(\?v=\d(\.\d){2})?$/, loader: 'file'},
            {test: /\.woff(2)?(\?v=\d(\.\d){2})?$/, loader: 'url?limit=10000&minetype=application/font-woff'},
        ],
    },
    plugins: [
        //new webpack.ProvidePlugin({
        //    $: 'jquery',
        //    jQuery: 'jquery',
        //}),
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
    ],
};
