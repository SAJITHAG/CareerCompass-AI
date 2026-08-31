// Mongoose Map fields store their keys as literal BSON field names, and
// MongoDB has never allowed "." (or a leading "$") inside a field name —
// "." is reserved for addressing nested paths. Skill names are free text
// though, and plenty of real ones contain a dot ("React.js", "Node.js",
// "Express.js", "D3.js"...), so using a raw skill string as a Map key
// throws the moment one of those is saved.
//
// These two helpers are the single place that encoding happens, so the
// write side (userController.js) and read side (client) always agree on
// the same rule. Nothing about the skill's displayed name changes — this
// only affects the internal Map key.
export const encodeSkillKey = (skill) =>
  skill.replace(/\./g, "%2E").replace(/^\$/, "%24");

export const decodeSkillKey = (key) =>
  key.replace(/%2E/g, ".").replace(/^%24/, "$");
