import PropTypes from 'prop-types';

const columnPropTypesMain = {
    action: PropTypes.func,
    actionOnFail: PropTypes.func,
    cellClasses: PropTypes.string,
    centerCellVertical: PropTypes.bool,
    dataField: (props, _propertyName, _component, _location) => {
        let dataFieldType = typeof props.dataField;
        if ((dataFieldType !== 'string' || (dataFieldType === 'string' && props.dataField.length === 0)) && !props.isDummyField) {
            if (typeof props.formatter !== 'function' && (!Array.isArray(props.columns) || props.columns.length === 0)) {
                return new Error("Error validating props for SxTable.  The properties formatter or columns are required if no dataField is provided.");
            } else if (typeof props.validation === 'function') {
                return new Error("Error validating props for SxTable.  The property validation must be omitted if no dataField is provided.");
            }
        }
    },
    editable: PropTypes.bool,
    editorRenderer: PropTypes.func,
    exportFormatter: PropTypes.func,
    filterValue: PropTypes.func,
    fieldProps: PropTypes.object,
    formatter: PropTypes.func,
    getOptions: PropTypes.func,
    headerClasses: PropTypes.string,
    headerStyle: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.object,
    ]),
    hidden: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.func
    ]),
    isCentered: PropTypes.bool,
    isDummyField: PropTypes.bool,
    isLinkKey: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.bool,
    ]),
    isOnlyText: PropTypes.bool,         //Permet d'indiquer que la cellule contient uniquement du text même lorsqu'un formatteur est définit.
    mandatory: PropTypes.bool,
    onDrop: PropTypes.func,
    options: PropTypes.array,
    resizable: PropTypes.bool,
    sort: PropTypes.bool,
    sortValue: PropTypes.func,
    summary: PropTypes.shape({
        calc: PropTypes.func,
        colSpan: PropTypes.number,
        value: PropTypes.node,
        isCentered: PropTypes.bool,
    }),
    text: PropTypes.string,
    toggle: PropTypes.bool,
    tooltip: PropTypes.func,
    truncateCell: PropTypes.bool,
    truncateHead: PropTypes.bool,
    type: PropTypes.shape({
        name: PropTypes.string.isRequired,
        renderValue: PropTypes.func,
    }),
    validation: PropTypes.func,
};

const sxTableColumnPropTypes = {
    ...columnPropTypesMain,
    columns: PropTypes.arrayOf(
        PropTypes.shape(
            columnPropTypesMain
        )),
};


export default sxTableColumnPropTypes;