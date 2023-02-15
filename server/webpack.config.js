import path from "path";
import nodeExternals from "webpack-node-externals";

export default {
  mode: "production",
  entry: "./server.js",
  target: "node",
  externals: [nodeExternals()],
  output: {
    path: path.resolve("build"),
    filename: "bundle.js",
    libraryTarget: "commonjs",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".mjs"],
  },
  experiments: {
    topLevelAwait: true,
  },
};
