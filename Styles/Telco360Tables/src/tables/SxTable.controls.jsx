import React from 'react';
import PropTypes from 'prop-types';

import { SxSearchField, SxDropdownMenu, SxExportButton, SxImportButton, SxAddButton, SxReloadButton, withSxMetadataInspector } from '@telco360/components';
import SxColumnToggler from './utils/SxColumnToggler';

import { exportCsv } from './SxTable.helpers';
import withCsvModal from './SxTable.csvModal';


const CsvExport = withSxMetadataInspector(SxExportButton);

const SxTableControls = ({ 
    tableId,
    actionsId,
    title,
    fullTreatedData,
    actionsList,
    customTableControls,
    renderFilterOpenBtn,
    canSearch,
    onSearch,
    canReload,
    reloadData,
    onClear,
    canExport,
    columnToggler,
    onColumnToggle,
    hiddenCols,
    togglerExcludedColDataFields,
    flatCols,
    canAdd,
    doValidateCanAdd,
    openForm,
    msg,
    remote,
    getDataExportCsv,
    showCsvConfirmModal,
    doImport,
    allowedFormats }) =>
    <>
        {customTableControls && Array.isArray(customTableControls) &&
            customTableControls.map((customControl, i) => { return <React.Fragment key={i}>{customControl}</React.Fragment> })
        }
        {actionsList &&
            <SxDropdownMenu
                containerId={tableId}
                id={actionsId}
                aria-label={`${title} Actions`}
                actionsList={actionsList}
                isInGrid={false}
                alignRight={true}
                label={<i className="cis-ellipsis" />}
            />
        }
        {renderFilterOpenBtn?.()
        }
        {canReload &&
            <SxReloadButton 
                key={"button-reload"}
                name={"button-reload"}
                onReload={reloadData}
            />
        }
        {canSearch &&
            <SxSearchField
                onSearch={onSearch}
                onClear={onClear}
                id={`table-${title}-searchField`}
            />
        }
        {typeof doImport === 'function' &&
            <SxImportButton asIcon={true} onSubmit={doImport} allowedFormats={allowedFormats} />
        }
        {canExport &&
            <CsvExport
                containerId={tableId}
                id={"7975ba0c-70a2-43cc-8231-7721facfdb10"}
                onExport={() => {
                    showCsvConfirmModal({
                        onClickYes: (data) => {
                            exportCsv(
                                flatCols.map(c => ({ ...c, hidden: !hiddenCols[c.dataField] ? true : false })),
                                fullTreatedData,
                                undefined,
                                remote,
                                getDataExportCsv,
                                data.separator,
                                data.incColTitle,
                                data.onlyVisible,
                                data.rawData
                            );
                        }
                    });
                }}
                exportCsv={msg.tooltip.exportCsv}
            />
        }
        {columnToggler &&
            typeof hiddenCols !== 'undefined' && //Vue l'étrange manière comment SxColumnToggler a du être monté pour être compatible avec RBT2, il ne doit aps être rendered avant que la liste des colonnes ne soit construite.
            <SxColumnToggler
                columns={flatCols}
                toggles={hiddenCols}
                onColumnToggle={onColumnToggle}
                toggleCols={msg.tooltip.toggleCols}
                excludedColDataFields={togglerExcludedColDataFields}
            />
        }
        {canAdd &&
            <SxAddButton
                handleClick={(e) => {
                    e.preventDefault();
                    if (doValidateCanAdd?.() ?? true) {
                        openForm?.();
                    }
                }}
            />
        }
    </>;

SxTableControls.displayName = "SxTableControls";

SxTableControls.propTypes = {
    actionsList: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).isRequired,
            isActive: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]).isRequired,
            label: PropTypes.string.isRequired,
            onClick: PropTypes.func,
        }),
    ),
    canAdd: PropTypes.bool,
    canExport: PropTypes.bool,
    canSearch: PropTypes.bool,
    columnToggler: PropTypes.bool,
    customTableControls: PropTypes.array,
    doValidateCanAdd: (props, _propName, _component, _location) => {
        if (props.canAdd && typeof props.doValidateCanAdd !== 'function') {
            return new Error("Error validating props provided to SxTableControls.  When canAdd is true, doValidateCanAdd must be a function.");
        }
    },
    flatCols: PropTypes.array,
    fullTreatedData: PropTypes.array.isRequired,
    getDataExportCsv: PropTypes.func,
    hiddenCols: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    msg: PropTypes.shape({
        tooltip: PropTypes.shape({
            exportCsv: PropTypes.string,
            toggleCols: PropTypes.string,
        }),
    }),
    onClear: (props, _propName, _component, _location) => {
        if (props.canSearch && typeof props.onSearch !== 'function') {
            return new Error("Error validating props provided to SxTableControls.  When canSearch is true, onClear must be a function.");
        }
    },
    onColumnToggle: (props, _propName, _component, _location) => {
        if (props.columnToggler && typeof props.onColumnToggle !== 'function') {
            return new Error("Error validating props provided to SxTableControls.  When columnToggler is true, onColumnToggle must be a function.");
        }
    },
    onSearch: (props, _propName, _component, _location) => {
        if (props.canSearch && typeof props.onSearch !== 'function') {
            return new Error("Error validating props provided to SxTableControls.  When canSearch is true, onSearch must be a function.");
        }
    },
    openForm: PropTypes.func,
    remote: PropTypes.bool,
    renderFilterOpenBtn: PropTypes.func,
    title: PropTypes.string,
    togglerExcludedColDataFields: PropTypes.array,
    doImport: PropTypes.func,
    allowedFormats: PropTypes.array
};

export default withCsvModal(SxTableControls);