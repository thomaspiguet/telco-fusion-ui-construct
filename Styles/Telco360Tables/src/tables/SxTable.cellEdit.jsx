import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Input } from 'reactstrap';

import sxTableColumnTypes from "./SxTable.columnTypes";
import sxTableColumnPropTypes from './SxTable.columnPropTypes';

import { helpers, SxTimeSelect, SxSelect, SxNumInput, SxDateTimePicker, SxDatePicker, SxCheckbox, withConfigs } from '@telco360/components';

const SxTableCellEdit = ({ id, keyField, dirtyField, colDef, data, row, rowIndex, colIndex, onDataChange, onValidate, extraData, dataChangeDelegator, validationDelegator, onSetInternVal, className }) => {
    const [value, setValue] = useState(row[colDef.dataField]);
    const [internalVal, setInternalVal] = useState();

    useEffect(() => {
        setValue(row[colDef.dataField]);
    }, [row, colDef.dataField]);

    useEffect(() => {
        dataChangeDelegator?.(async (newValue, updatedModifiedData) => (updateDataFromDelegator(newValue, updatedModifiedData)));
    }, []);

    useEffect(() => {
        validationDelegator?.(async (newRowData, completeData) => onValidate((newRowData || row)[colDef.dataField], newRowData || row, colDef, internalVal, true, completeData));
    }, [colDef, internalVal, row, onValidate, validationDelegator]);

    const updateDataFromDelegator = (async (newValue, updatedModifiedData) =>
        onDataChange?.(row[colDef.dataField], newValue, row, colDef,
            updatedModifiedData,
            internalVal, true)
    );

    const updateData = useCallback(async (newValue) => {
        await onDataChange?.(row[colDef.dataField], newValue, row, colDef,
            data.map(d => d[keyField] === row[keyField] ?
                {
                    ...d,
                    [colDef.dataField]: newValue,
                    [dirtyField]: true,
                } :
                d),
            internalVal);
    }, [onDataChange, row, colDef, data, internalVal, dirtyField, keyField]);

    useEffect(() => {
        onSetInternVal(internalVal);
    }, [internalVal]);
    
    const field = () => {
        if (colDef.editorRenderer) {
            return colDef.editorRenderer?.({
                onUpdate: updateData,
                valDelegator: delegate => setInternalVal(() => delegate)
            }, row[colDef.dataField], row, colDef, rowIndex, colIndex, extraData);
        };

        switch (colDef.type) {
            case sxTableColumnTypes.Select:
                return <SxSelect
                    aria-label={colDef.dataField}
                    value={row[colDef.dataField]}
                    options={colDef.options}
                    getOptions={colDef.getOptions}
                    onChange={updateData}
                    clearable={false}
                    {...colDef.fieldProps}
                />

            case sxTableColumnTypes.Checkbox:
                return <SxCheckbox
                    name={colDef.dataField}
                    value={row[colDef.dataField]}
                    onChange={e => updateData(e.target.checked)}
                    {...colDef.fieldProps}
                />

            case sxTableColumnTypes.DateTime:
                return <SxDateTimePicker 
                    aria-label={`${colDef.dataField}-${colDef.type.name}`}
                    value={row[colDef.dataField]}
                    onUpdate={updateData}
                    validation={colDef.validation}
                    preventDefault={true}
                    {...colDef.fieldProps}
                />
            case sxTableColumnTypes.Date:
                return <SxDatePicker
                    aria-label={`${colDef.dataField}-${colDef.type.name}`}
                    value={row[colDef.dataField]}
                    onChange={updateData}
                    {...colDef.fieldProps}
                />

            case sxTableColumnTypes.Number:
                return <SxNumInput
                    name={`${colDef.dataField}-${colDef.type.name}`}
                    value={row[colDef.dataField]}
                    onChange={(e) => { updateData(e.target.valueAsNumber); }}
                    onBlur={(e) => { updateData(e.target.valueAsNumber); }}
                    ignoreGroup
                    {...colDef.fieldProps}
                />
            case sxTableColumnTypes.Time:
                return <SxTimeSelect
                    aria-label={`${colDef.dataField}-${colDef.type.name}`}
                    name={`${colDef.dataField}-${colDef.type.name}`}
                    hours={(helpers.Convert.UtcToDatetime(row[colDef.dataField]))?.getHours?.()?.toString() ?? new Date().getHours().toString()}
                    minutes={(helpers.Convert.UtcToDatetime(row[colDef.dataField]))?.getMinutes?.()?.toString() ?? new Date().getMinutes().toString()}
                    onChange={(newValue) => {
                        let tmp = row[colDef.dataField] ? new Date(row[colDef.dataField]) : new Date();
                        tmp.setHours(newValue.hours);
                        tmp.setMinutes(newValue.minutes);
                        updateData(tmp);
                    }}
                    {...colDef.fieldProps}
                />

            default:
                return <Input
                    key={id}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={async (e) => {
                        if (value !== row[colDef.dataField]) {
                            await updateData(value);
                        }
                    }}
                />;
        };
    };

    return <div className={className}>{field()}</div>
};

SxTableCellEdit.propTypes = {
    colDef: PropTypes.shape(
        sxTableColumnPropTypes
    ).isRequired,
    colIndex: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    dirtyField: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    keyField: PropTypes.string.isRequired,
    onDataChange: PropTypes.func.isRequired,
    onValidate: PropTypes.func.isRequired,
    row: PropTypes.object.isRequired,
    rowIndex: PropTypes.number.isRequired,
    extraData: PropTypes.object,
    dataChangeDelegator: PropTypes.func,
    validationDelegator: PropTypes.func,
};

SxTableCellEdit.defaultProps = {
};

SxTableCellEdit.displayName = "SxTableCellEdit";

export default withConfigs(SxTableCellEdit);