import { helpers } from '@telco360/components';

const sxTableColumnTypes = {
    Action: {name: "action"},
    Checkbox: { name: "checkbox" },
    DragDrop: { name: "dragdrop" },
    Date: {
        name: "date", renderValue: (colDef, value) => {
            return value ?
                helpers.Date.formatterFromUtc(
                    value,
                    colDef.fieldProps?.format ?? helpers.Date.format.dateDefault) : '';
        }
    },
    DateTime: {
        name: "dateTime", renderValue: (colDef, value) => {
            return value ?
                helpers.Date.formatterFromUtc(
                    value,
                    colDef.fieldProps?.format ?? helpers.Date.format.dateTimeDefault) : '';
        }
    },
    Number: {
        name: "number", renderValue: (_colDef, value) =>
            value?.toLocaleString() ?? ""
    },
    Select: {
        name: "select", renderValue: (colDef, value) => {
            const valueCompare = colDef.valueCompare ?? ((a, b) => { return a === b; });
            return colDef.options?.find((x) => valueCompare(x.value, value))?.label || null;
        }
    },
    Text: {name: "text"},
    Time: {
        name: "time", renderValue: (colDef, value) => {

            return value ?
                helpers.Date.formatterFromUtc(
                    value,
                    colDef.fieldProps?.format ?? helpers.Date.format.timeDefault) : '';
        }
    }
};

export default sxTableColumnTypes;