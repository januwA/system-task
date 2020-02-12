const path = require("path");

module.exports = {
  mode: "production", // production or development
  entry: path.resolve(__dirname, "src/index.ts"),
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "ts-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: "system-task.js",
    path: path.resolve(__dirname, "dist"),
    library: "SystemTask",
    libraryTarget: "umd"
  }
};
