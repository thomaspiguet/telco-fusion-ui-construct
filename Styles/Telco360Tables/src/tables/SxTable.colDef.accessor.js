import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

// Les propriétés suivantes sont reconnues comme supportant les fonctions et sont ignorées par ce processus.
const ignoreProperties = [
    "columns",
    "dataField",
    "hidden",
    "id",
    "isLinkKey",
    "validator",
    // propriétés qui gèrent déjà les fonctions
    "action",
    "actionOnFail",
    "editorRenderer",
    "exportFormatter",
    "filterValue",
    "formatter",
    "headerClasses",
    "headerStyle",
    "onDrop",
    "renderValue",
    "tooltip",
    "validation",
    // propriétés qui ne devraient pas être modifiables par le code
    "fieldProps",
    "name",
    "options",
    "sort",
    "sortValue",
    "toggle",
    "type",
];

const isFieldEmpty = (fieldValue) => {
    return (
        fieldValue === null ||
        typeof fieldValue === 'undefined' ||
        (typeof fieldValue === 'number' &&
            isNaN(fieldValue)) ||
        (typeof fieldValue === 'string' &&
            fieldValue.trim() === ''
        )
    )
};

const colDefDefaultMessage = {
    error: {
        notNull: "La valeur ne peut pas être nulle.",
    },
};

const withTableColumnAccessors = (WrappedComponent) => {
    const processObject = (aColDef, data, extraData, msg) => {
        let newColDef = { ...aColDef };
        Object.keys(aColDef).forEach(aKey => {
            if (ignoreProperties.some(y => y === aKey)) {
                newColDef[aKey] = aColDef[aKey];
            } else {
                Object.defineProperty(newColDef, aKey, {
                    get: function () {
                        return typeof aColDef[aKey] === 'function' ? aColDef[aKey]?.(data, undefined, extraData) : aColDef[aKey];
                    },
                });
            }
        });
        if (newColDef.mandatory === true){
            newColDef.validator = (currentValue, row, column, data, extraData) => {
                if ((column.mandatory === true) && isFieldEmpty(currentValue)) {
                    return { valid: false, message: msg.error.notNull };
                } else {
                    return aColDef.validator?.(currentValue, row, column, data, extraData) ?? { valid: true };
                }
            }
        }
        return newColDef;
    };

    const SxTableColumnAccessors = ({ columns, data, extraData, msg, ...rest }) => {
        if (!Array.isArray(data)) {
            console.log("-------------------- Data is not an array, " + typeof data, { columns, data, extraData, ...rest });
        }
        const alteredColumns = useMemo(() => { 
            return columns.map((aColDef) => processObject(aColDef, data, extraData, msg));
        }, [data, JSON.stringify(extraData)]);

        return <WrappedComponent {...rest} data={data} extraData={extraData} columns={alteredColumns} />
    };
    SxTableColumnAccessors.displayName = "SxTableColumnAccessors";

    SxTableColumnAccessors.propTypes = {
        columns: PropTypes.arrayOf(PropTypes.object),
        data: PropTypes.array,
        extraData: PropTypes.object,
        msg: PropTypes.object
    };
    SxTableColumnAccessors.defaultProps = {
        msg: colDefDefaultMessage,
    };

    return SxTableColumnAccessors;
};

withTableColumnAccessors.displayName = "withTableColumnAccessors";

export default withTableColumnAccessors;