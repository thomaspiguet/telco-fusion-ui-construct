import { saveAs } from 'file-saver';
import sxTableColumnTypes from "./SxTable.columnTypes";
import { getItemRight } from '@telco360/components'

export const getVisibleCols = (colDefs, toggledCols, metadata) => {
    const filterCol = (c) => !c.hidden || toggledCols?.[c.dataField] ?
        toggledCols?.[c.dataField] !== false : false;

    return colDefs.filter(cd => typeof cd.columns === 'undefined' ?
        getItemRight(cd, metadata).canRead && filterCol(cd) :
        getVisibleCols(cd.columns, toggledCols, metadata).length > 0) //Filtre les group de colonne n'ayant aucune colonne de visible.
        .map(cd => typeof cd.columns === 'undefined' ?
            cd :
            { ...cd, columns: getVisibleCols(cd.columns, toggledCols, metadata) });   //Retire les sous colonnes non visibles
};

export const getFlatColumns = (colDefs, metadata) => {
    return colDefs.filter(c => getItemRight(c, metadata).canRead)
    .map(c =>
        typeof c.columns === 'undefined' ?
            c :
            getFlatColumns(c.columns)
    ).flat();
};

export { getItemRight } ;

export const searchAllProperties = (colDefs, row, newLineField, value = "") => {
    if (row[newLineField] === true) return true;
    return colDefs.some(def => {
        if (typeof row[def.dataField] === 'boolean') return false; //Ne pas appliquer la recherche sur les valeurs booléennes
        return ((def.filterValue?.(row[def.dataField], row) ??
            row[def.dataField]?.toString())?.toLowerCase()?.includes(value.toString().toLowerCase()));
    });
};

export const exportCsv = async (colDefs, data, fileName = "spreadsheet.csv", remote = false, getDataExportCsv, separator = ";", incColTitle = true, onlyVisible = true, rawData = false, quoteStrings = true) => {
    let csvData = incColTitle ? colDefs.filter(cd => !onlyVisible || !cd.hidden).map(c => `"${c.text}"`).join(separator) + '\r\n' : "";
    let localData = remote ? await (getDataExportCsv?.()?.()) : data;
    csvData += localData.map(d =>
        colDefs.filter(cd => !onlyVisible || !cd.hidden).map(c => {
            let value = (!rawData && typeof c.exportFormatter === "function") ?
                c.exportFormatter(d)?.toString() :
                (!rawData && typeof c.type?.renderValue === 'function') ?
                    c.type.renderValue(c, d[c.dataField]) :
                    d[c.dataField];

            let type = c.type === sxTableColumnTypes.Select ? typeof value : typeof d[c.dataField];

            return (quoteStrings && type === "string") ? `"${value}"` : value;
        }).join(separator)
    ).join('\r\n');
    let blob = new Blob([String.fromCharCode(0xFEFF), csvData], { type: 'text/plain' });
    saveAs(blob, fileName);
};

export const isColHidden = (colDef) =>
    typeof colDef.hidden === 'function' ? colDef.hidden() : colDef.hidden;