import webpack from 'webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../../release/app/package.json';

const configuration: webpack.Configuration = {
  externals: [...Object.keys(externals || {})],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              module: 'esnext',
            },
          },
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    library: {
      type: 'commonjs2',
    },
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert/'),
      os: require.resolve('os-browserify/browser'),
      util: require.resolve('util/'),
      child_process: false, // Set to false if you don't want to polyfill this module
    },
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      __dirname: JSON.stringify(__dirname),
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },
};

export default configuration;
