import React from 'react';

import SxRowDragDrop from './fields/SxRowDragDrop';


const sxTableOrderByDragActionDefaultMsg = {
    ariaLabel: {
        orderByDragAction: "Ordonner via glisser-déposer",
    },
    headerColumnLabel: {
        orderByDragAction: "Ordre",
    },
};


/// Obtenir la définition de la colonne factice d'une table utiliser pour ordonner des lignes via le glisser-déposer 𑁔🤏.
const getOrderByDragActionColumnDefinition = (
    keyField,
    dirtyField,
    isSelectedField,
    data,
    orderByDragValueDataField,
    handleOrderOnDropIncluded,
    msg = sxTableOrderByDragActionDefaultMsg,
) => {
    return {
        dataField: 'orderByDragAction',
        text: msg.headerColumnLabel.orderByDragAction,
        isDummyField: true,
        dirtyField: dirtyField,
        editable: false,
        searchable: false,
        csvExport: false,
        sort: false,
        formatter: (_cell, row, _components, formatExtraData) => (
            <SxRowDragDrop
                aria-label={msg?.ariaLabel?.orderByDragAction}
                keyField={keyField}
                orderingField={orderByDragValueDataField}
                row={row}
                rows={formatExtraData.rows}
                onDrop={handleOrderOnDropIncluded}
            />
        ),
        formatExtraData: {
            rows: data?.filter?.(d => d[isSelectedField]),
        },
        headerStyle: (_colum, _colIndex) => {
            return { width: '15%' };
        },
    };
};


export { sxTableOrderByDragActionDefaultMsg };
export { getOrderByDragActionColumnDefinition };