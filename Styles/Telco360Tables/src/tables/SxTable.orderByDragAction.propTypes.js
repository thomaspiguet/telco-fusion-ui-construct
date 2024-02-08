

const orderByDragOnAfterUpdatePropTypesValidator = (props, propName, componentName) => {
    if (('undefined' !== typeof props[propName]) &&
        ('function' !== typeof props[propName])) {
        return new Error(`Invalid prop '${propName}' of type '${typeof props[propName]}' supplied to ${componentName}, expected 'function'.`);
    }
    if (('function' !== typeof props[propName]) &&
        ('string' === typeof props['orderByDragValueDataField']) &&
        ("" !== props['orderByDragValueDataField']?.trim?.())) {
        return new Error(`Invalid prop '${propName}' of type '${typeof props[propName]}' supplied to ${componentName}, the prop '${propName}' must be a valid function when the prop '${'OrderByDragValueDataField'}' is not empty string.`);
    }
    if ('function' === typeof props[propName]) {
        if (('undefined' === typeof props['orderByDragValueDataField']) ||
            (null === props['orderByDragValueDataField']) ||
            ("" === props['orderByDragValueDataField']?.trim?.())) {
            return new Error(`Invalid prop '${'OrderByDragValueDataField'}' with value '${props['OrderByDragValueDataField']}' supplied to component ${componentName}, the prop '${'OrderByDragValueDataField'}' must be a valid string value when the prop '${propName}' is provided as function.`);
        }
    }
    return null;
};

const orderByDragValueDataFieldPropTypesValidator = (props, propName, componentName) => {
    const errorMessages = [];
    if (('undefined' !== typeof props[propName]) &&
        ('string' !== typeof props[propName])) {
        errorMessages.push(`Invalid prop '${propName}' of type '${typeof props[propName]}' supplied to ${componentName}, expected 'string'.`);
    }
    if (('string' === typeof props[propName]) &&
        ("" !== props[propName]?.trim?.())) {
        if (true === props['canSearch']) {
            errorMessages.push(`Invalid prop '${'canSearch'}' with value 'true' supplied to component ${componentName}, the prop '${'canSearch'}' must be 'false' when the prop '${propName}' is not empty string.`);
        }
        props['columns']?.forEach?.(column => {
            if (true === column?.sort) {
                errorMessages.push(`Invalid prop 'columns[${column?.dataField}].sort' with value 'true' supplied to component ${componentName}, the prop 'columns[${column?.dataField}].sort' must be 'false' when the prop '${propName}' is not empty string.`);
            }
        });
        if (Array.isArray(props['filteredData'])) {
            errorMessages.push(`Invalid prop '${'filteredData'}' of type array supplied to component ${componentName}, the prop '${'filteredData'}' must be 'undefined' when the prop '${propName}' is not empty string.`);
        }
        if (true === props['usePagination']) {
            errorMessages.push(`Invalid prop '${'usePagination'}' with value 'true' supplied to component ${componentName}, the prop '${'usePagination'}' must be 'false' when the prop '${propName}' is not empty string.`);
        }
    }

    if (0 !== errorMessages.length) {
        const errorMessage = errorMessages
            .join('\n');
        return new Error(errorMessage);
    } else {
        return null;
    }
};


export { orderByDragOnAfterUpdatePropTypesValidator, orderByDragValueDataFieldPropTypesValidator };