const { camelCase, pascalCase } = require('change-case-commonjs');
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
  generateIdentifierType: (c, d) => {
    // Id columns are already prefixed with the table name, so we don't need to add it here
    const name = pascalCase(`${d.name}_${c.name}`);

    return {
      declarationType: 'typeDeclaration',
      name,
      exportAs: 'named',
      typeDefinition: [`number`],
      comment: [`Identifier type for ${d.name}`],
    };
  },
  preRenderHooks: [kanelKysely.makeKyselyHook(), camelCaseHook],
};
