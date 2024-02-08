const stringListSeparator = ",";

/// Convertit de String vers le type.
const sxFieldTypesHelpersFromString = {
    string: (value) => value,
    stringList: (value) => value?.split?.(stringListSeparator) ?? value,
};

/// Convertit du type vers String.
const sxFieldTypesHelpersToString = {
    bool: (value) => value?.toString?.() ?? value,
    date: (value) => value?.toISOString?.() ?? value,
    dateTime: (value) => value?.toISOString?.() ?? value,
    number: (value) => value?.toString?.() ?? value,
    object: (value) => JSON.stringify(value),
    string: (value) => value,
    stringList: (value) => value?.join?.(stringListSeparator) ?? value,
};


export { sxFieldTypesHelpersFromString };
export { sxFieldTypesHelpersToString };