import React from 'react';
import PropTypes from 'prop-types';

import { Input } from 'reactstrap';

import { isColHidden } from './SxTable.helpers';
import SxTableCellWrapper from './SxTable.cellWrapper';
import sxTableColumnPropTypes from './SxTable.columnPropTypes';
import { withSxMetadataInspector, SxExpandIcon } from '@telco360/components';


const getHeaderClasses = (col, colIdx) =>
    typeof col.headerClasses === 'function' ?
        col.headerClasses(col, colIdx) :
        typeof col.headerClasses !== 'undefined' ?
            col.headerClasses :
            '';

const getHeaderStyle = (col, colIdx) =>
    typeof col.headerStyle === 'function' ? col.headerStyle(col, colIdx) : col.headerStyle;


const selectColStyle = {
    width: "25px"
};

const removeColStyle = {
    width: "55px"
};

const _SxTableHeader = ({ children, ...props }) =>
    <SxTableCellWrapper
        {...props}
    >
        {children}
    </SxTableCellWrapper>;

const SxTableHeader = withSxMetadataInspector(_SxTableHeader);

const SxTableColHeaders = ({
    canRemoveLine,
    canSelectAll,
    clonableLines,
    colDefs,
    data,
    expandHeader,
    icons,
    id,
    lvl = 0,
    msg,
    onExpand,
    onSortClick,
    rowsExpand,
    selectRow,
    sortCol,
}) => 
    <>
        {colDefs.filter(c => !isColHidden(c) && typeof c.columns !== 'undefined').length > 0 ?
            <>
                <tr key={`${id}-header-row-${lvl}`} className='card-header'>
                    {
                        selectRow?.mode === "checkbox" ?
                            <th style={selectColStyle} /> :
                            null
                    }
                    {
                        colDefs.filter(c => typeof c.columns !== 'undefined')
                            .map((c, i) =>
                                <th key={`${id}-header-row-${lvl}-${c.text}`} className={getHeaderClasses(c, i)} style={getHeaderStyle(c, i)} colSpan={c.columns.length}>
                                    <SxTableHeader
                                        text={c.text}
                                        id={c.id}
                                        containerId={id}
                                        truncate={c.truncateHead}
                                        collapseWhiteSpace={c.collapseWhiteSpace}
                                        cellIsTextOnly={true}
                                    >
                                        {c.text}
                                    </SxTableHeader>
                                </th>)
                    }
                    {
                        canRemoveLine === true ?
                            <th style={removeColStyle}></th> : null
                    }
                </tr>
                {
                    <SxTableColHeaders
                        id={id}
                        canSelectAll={canSelectAll}
                        colDefs={colDefs.filter(c => !isColHidden(c) && typeof c.columns !== 'undefined').flatMap(c => c.columns)}
                        icons={icons}
                        msg={msg}
                        onSortClick={onSortClick}
                        sortCol={sortCol}
                        selectRow={selectRow}
                        data={data}
                        lvl={lvl + 1}
                    />
                }
            </> :
            <tr className='card-header'>
                {
                    selectRow?.mode === "checkbox" ?
                        <th style={selectColStyle}>
                            <div className="d-flex justify-content-center align-items-center w-100">
                                {true === canSelectAll ?
                                    <Input
                                        type="checkbox"
                                        className="m-0"
                                        checked={selectRow.selected != null && data?.length > 0 && data?.length === selectRow.selected.length}
                                        onChange={(e) => {
                                            selectRow.onSelectAll?.(e.target.checked, data, e);
                                        }}
                                    /> :
                                    <></>
                                }
                            </div>
                        </th> :
                        null
                }
                {
                    expandHeader ?
                        <th onClick={() => onExpand()} style={selectColStyle}>
                            <div className="d-flex justify-content-center align-items-center w-100">
                                <SxExpandIcon
                                    isExpanded={rowsExpand.length > 0}
                                />
                            </div>
                        </th> :
                        null
                }
                {
                    colDefs
                        .map((colDef, index) =>
                            <th
                            className={`${getHeaderClasses(colDef, index)} ${colDef.resizable === true ? "resizableColumn" : ""}`}
                                key={`${id}-header-${lvl}-${colDef.text}`}
                                style={getHeaderStyle(colDef, index)}
                            >
                                <SxTableHeader
                                    text={colDef.text}
                                    id={colDef.id}
                                    containerId={id}
                                    truncate={colDef.truncateHead}
                                    collapseWhiteSpace={colDef.collapseWhiteSpace}
                                    cellIsTextOnly={true}
                                >
                                    {colDef.sort ?
                                        <span
                                            aria-label={msg?.ariaLabel?.sortColumn}
                                            className={`${colDef.dataField === sortCol?.dataField ? sortCol.order.icon : icons.sort.none} btn float-right m-0 mr-1 p-0`}
                                            key={`${id}-header-span-${lvl}-${colDef.text}`}
                                            onClick={() => onSortClick(colDef.dataField)}
                                        /> :
                                        <></>}
                                    {colDef.text}
                                </SxTableHeader>
                            </th>)
                }
                {
                    clonableLines ? <th style={removeColStyle} id={`${id}-header-duplicateLine`}></th> : null
                }
                {
                    canRemoveLine === true ?
                        <th style={removeColStyle} id={`${id}-header-removeLine`}></th> : null
                }
            </tr>
        }
    </>;

SxTableColHeaders.propTypes = {
    canRemoveLine: PropTypes.bool,
    canSelectAll: PropTypes.bool,
    colDefs: PropTypes.arrayOf(
        PropTypes.shape(
            sxTableColumnPropTypes
        )).isRequired,
    data: PropTypes.array,
    expandHeader: PropTypes.bool,
    icons: PropTypes.shape({
        sort: PropTypes.shape({
            none: PropTypes.string.isRequired,             // Repr�sente la classe pour l'ic�ne repr�sentant aucun tri s�lectionn�.
        }).isRequired,
    }).isRequired,
    id: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    lvl: PropTypes.number,
    msg: PropTypes.shape({
        ariaLabel: PropTypes.shape({
            sortColumn: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
    onExpand: (props, _propName, _component, _location) => {
        if (props.expandHeader && typeof props.onExpand !== 'function') {
            return new Error("Error validating props provided to SxTableColHeaders.  The onExpand property must be a function if expandHeader is true.")
        }
    },
    onSortClick: PropTypes.func.isRequired,
    rowsExpand: (props, _propName, _component, _location) => {
        if (props.expandHeader) {
            if (!Array.isArray(props.rowsExpand)) {
                return new Error("Error validating props provided to SxTableColHeaders.  The rowsExpand property must be an array if expandHeader is true.");
            }
        } else if (typeof props.rowsExpand !== 'undefined' && !Array.isArray(props.rowsExpand)) {
            return new Error("Error validating props provided to SxTableColHeaders.  The rowExpand property can be undefined or an array.");
        }
    },
    selectRow: PropTypes.shape({
        mode: PropTypes.string.isRequired,
        onSelectAll: PropTypes.func,
        selected: PropTypes.array,
    }),
    sortCol: PropTypes.shape({
        dataField: PropTypes.string,
        order: PropTypes.shape({
            icon: PropTypes.string.isRequired
        }).isRequired,
    }),
};

SxTableColHeaders.defaultProps = {
    canSelectAll: true,
    expandHeader: false,
};

SxTableColHeaders.displayName = "SxTableColHeaders";

export default SxTableColHeaders;