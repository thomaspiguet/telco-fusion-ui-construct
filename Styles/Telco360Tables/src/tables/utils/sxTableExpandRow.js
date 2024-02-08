import React from 'react';

import { SxTableEditableNoPending } from '../SxTableEditable';
import SxTable from '../SxTable';
import { withSxGetData } from '@telco360/components';


const SxTableWithGetData = withSxGetData(SxTable);

const sxTableExpandRow = {

    getTableEditable: function (hasNoChildList, dataColumn, { lazyLoading = true, keyField, columns, ...props }) {
        const expandRow =
        {
            renderer: (row, rowIndex, setExpandValidation, onValErrorEnd, onValErrorStart) => {
                return <SxTableEditableNoPending
                    keyField={keyField}
                    name={`table-${row[keyField]}`}
                    id={`id-${row[keyField]}`}
                    data={row[dataColumn]}
                    columns={columns}
                    onDataChange={(oldValue, newValue, subRow, column, modifiedData) => props.onDataChange(oldValue, newValue, subRow, column, modifiedData, row, rowIndex)}
                    canAddLine={props.canAddLine}
                    onAddLine={() => props.onAddLine(row, rowIndex)}
                    {...props.overrideProps}
                    canWrite={props.canWrite}
                    onValErrorStart={onValErrorStart}
                    onValErrorEnd={onValErrorEnd}
                    validateDelegator={delegate => setExpandValidation(delegate)}
                />
            },
            lazyLoading: lazyLoading,
            nonExpandable: props.canAddLine ? [] : hasNoChildList,
            parentClassName: 'sxtable-row-expended',
        };
        return expandRow;
    },

    getTable: function (hasNoChildList, dataColumn, { lazyLoading = true, keyField, ...props }) {
        const expandRow =
        {
            renderer: (row, rowIndex) => {
                return <SxTable
                    keyField={keyField}
                    name={`table-${rowIndex}`}
                    id={`id-${rowIndex}`}
                    data={row[dataColumn]}
                    columns={props.columns}
                    {...props.overrideProps}
                />
            },
            lazyLoading: lazyLoading,
            nonExpandable: hasNoChildList,
            parentClassName: 'sxtable-row-expended',
        };
        return expandRow;
    },

    getCustom: function (hasNoChildList, Component2Display, { lazyLoading = true, keyField, ...props }) {
        const expandRow =
        {
            renderer: (row, rowIndex, setExpandValidation, onValErrorEnd, onValErrorStart) => {
                return <Component2Display
                    {...props}
                    tableParentRow={row}
                    tableParentIndex={rowIndex}
                    onValErrorStart={onValErrorStart}
                    onValErrorEnd={onValErrorEnd}
                    validateDelegator={delegate => setExpandValidation(delegate)}
                />
            },
            lazyLoading: lazyLoading,
            nonExpandable: hasNoChildList,
            parentClassName: 'sxtable-row-expended',
        };
        return expandRow;
    },

    getSxTableWithGetData : function ({ lazyLoading = true, keyField, columns, getData, ...props }) {
        const expandRow =
        {
            renderer: (row, _rowIndex, setExpandValidation, onValErrorEnd, onValErrorStart) => 
                <SxTableWithGetData
                    keyField={keyField}
                    name={`table-${row[keyField]}`}
                    id={`id-${row[keyField]}`}
                    columns={columns}
                    getData={() => getData(row)}
                    onValErrorStart={onValErrorStart}
                    onValErrorEnd={onValErrorEnd}
                    validateDelegator={delegate => setExpandValidation(delegate)}

                    {...props.overrideProps}
                />
            ,
            lazyLoading: lazyLoading,
            parentClassName: 'sxtable-row-expended',
        };
        return expandRow;

    },
};

sxTableExpandRow.displayName = 'SxTableExpandRow';

export default sxTableExpandRow;