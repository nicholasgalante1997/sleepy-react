import path from "node:path";
import webpack, { Configuration } from "webpack";

type CreateWebpackConfigurationOptions = {
  entry: Configuration["entry"];
};

export default function (
  options: CreateWebpackConfigurationOptions,
): webpack.Configuration {
  return {
    mode: "production",
    devtool: false,
    entry: options.entry,
    output: {
      clean: false,
      path: path.resolve(process.cwd(), "dist", "js"),
      filename: "[name].[contenthash].js",
      module: true,
      chunkFormat: "module",
    },
    experiments: {
      outputModule: true,
    },
    target: ["web", "es2022"],
    module: {
      rules: [
        {
          test: /\.m?js/,
          type: "javascript/auto",
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.(png|jpg|jpeg|webp)$/,
          type: 'asset/resource'
        }
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
      alias: {
        "@": path.resolve(process.cwd(), "src"),
      },
      fallback: {
        path: false,
        process: false,
        fs: false,
      },
    },
    plugins: [
      new webpack.ProvidePlugin({ process: "process/browser" }),
      new webpack.EnvironmentPlugin({ ...process.env }),
      new webpack.ProgressPlugin(),
    ],
  };
}
