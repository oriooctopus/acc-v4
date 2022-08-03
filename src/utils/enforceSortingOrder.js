const sublessonLessonLinkFields = ["lesson_id", "sublesson_id"];
// had trouble with serializing these so removing them for now
const temporaryDataFix = ["created_at", "updated_at", "published_at"];
const fieldsToIgnore = ["id", ...sublessonLessonLinkFields];

const getLastInsertedRowId = async (tableName) => {
  const result = await strapi.db.connection.raw(`
    SELECT currval(pg_get_serial_sequence('${tableName}', 'id'));
  `);
  return result.rows[0].currval;
};

const createNewChildEntity = async (row, entityTableName) => {
  const fieldsToRetain = Object.keys(row).filter(
    (field) => !fieldsToIgnore.includes(field)
  );

  const valuesString = fieldsToRetain
    .map((field) => {
      const value = row[field];
      if (value instanceof Date || temporaryDataFix.includes(field)) {
        return "now()::timestamp";
      } else if (typeof value === "string") {
        return `'${value.replace(/'/g, "''").replace(/\?/, "\\?")}'`;
      } else if (value === undefined || value === null) {
        return "null";
      }

      return value;
    })
    .join(",");

  const fieldsString = fieldsToRetain.map((field) => `"${field}"`).join(",");

  return await strapi.db.connection.raw(`
    INSERT INTO ${entityTableName} (${fieldsString}) VALUES (${valuesString});
  `);
};

// for this we probably just need to pass in the old ids, which we already have
const removePreviousEntities = async (orderedEntityIds, entityTableName) => {
  await strapi.db.connection.raw(`
    DELETE FROM ${entityTableName}
    WHERE id IN (${orderedEntityIds.join(", ")});
  `);
};

module.exports = async ({
  entityTableName,
  updateComponents = true,
  // Array of the new 'sort' order for the child relations
  orderedEntityIds,
}) => {
  if (!orderedEntityIds || !orderedEntityIds.length) {
    return;
  }

  const { rows: orderedChildEntities } = await strapi.db.connection.raw(`
    SELECT *
    FROM ${entityTableName} child
    WHERE id IN (${orderedEntityIds.join(", ")});
  `);

  if (!orderedChildEntities.length) {
    return;
  }

  const newEntityIds = [];

  for (const entityId of orderedEntityIds) {
    const childEntity = orderedChildEntities.find(({ id }) => id === entityId);
    await createNewChildEntity(childEntity, entityTableName);

    const newRowId = await getLastInsertedRowId(entityTableName);
    newEntityIds.push(newRowId);

    // Points the associated component to the newly created id instead of the old one
    if (updateComponents) {
      await strapi.db.connection.raw(`
        UPDATE ${entityTableName}_components
        SET entity_id = ${newRowId}
        WHERE entity_id = ${childEntity.id}
      `);
    }
  }

  await removePreviousEntities(orderedEntityIds, entityTableName);

  return newEntityIds;
};
