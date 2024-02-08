import React from 'react';
import { SxBooleanLabel } from "@telco360/components";
import sxTableColumnTypes from "./SxTable.columnTypes";
import ColumnAction from './fields/ColumnAction';
import SxRowDragDrop from './fields/SxRowDragDrop';

const renderValue = (val, column) => {
    let str = typeof val === 'string' ?
        val :
        val?.toString();
    return str === null || typeof str === 'undefined' || str.match(/^ *$/) !== null ?
        <br /> :         //Nous ne voulons jamais qu'une cellule soit complètement vide pour que les lignes aient toujours une hauteur minimale.
        (column.maxLines > 0 && column.collapseWhiteSpace === false) ? <div className={'sxTable-maxLines'} style={{ "--maxLines": column.maxLines }}>{str}</div> :
        str;
};

const SxTableCellFormatter = ({ tableId, column, value, row, rows }) => {
    switch (column.type) {
        case sxTableColumnTypes.Checkbox:
            return <SxBooleanLabel
                value={value}
                name={column.text}
                aria-label={column["aria-label"] ?? column.text}
                {...column.fieldProps}
            />
        case sxTableColumnTypes.Action:
            return <ColumnAction
                id={column.id}
                containerId={tableId}
                column={column}
                row={row}
                value={value}
                {...column.fieldProps}
            />
        case sxTableColumnTypes.DragDrop:
            return <SxRowDragDrop
                keyField={column.id}
                orderingField={column.dataField}
                row={row}
                rows={rows}
                onDrop={column.onDrop}
            />
        case sxTableColumnTypes.Number:
        case sxTableColumnTypes.DateTime:
        case sxTableColumnTypes.Date:
        case sxTableColumnTypes.Time:
        case sxTableColumnTypes.Select:
            return <div aria-label={`${column.dataField}-${column.type.name}`}>{column.type.renderValue(column, value)}</div>;
        default: return renderValue(value, column);
    }
};

export default SxTableCellFormatter;