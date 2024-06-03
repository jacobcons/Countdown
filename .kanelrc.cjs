const { camelCase } = require('change-case-commonjs');
const kanel = require('kanel');
const kanelKysely = require('kanel-kysely');

const camelCaseHook = (output) =>
  Object.fromEntries(
    Object.entries(output).map(([path, fileContents]) => [
      path,
      {
        ...fileContents,
        declarations: fileContents.declarations.map((declaration) =>
          declaration.declarationType === 'interface'
            ? {
                ...declaration,
                properties: declaration.properties.map((property) => ({
                  ...property,
                  name: camelCase(property.name),
                })),
              }
            : declaration,
        ),
      },
    ]),
  );

module.exports = {
  connection: process.env.DB_URL,
  outputPath: './src/db/types',
  preRenderHooks: [kanelKysely.makeKyselyHook(), camelCaseHook],
};
