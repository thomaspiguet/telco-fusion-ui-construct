import React from 'react';
import PropTypes from 'prop-types';

import SxTable from './SxTable';
import { SxTableEditableNoPending } from './SxTableEditable';
import { SxTooltipButton, withUrlRight } from '@telco360/components';

const SxTableEditableNoPendingWithRight = withUrlRight(SxTableEditableNoPending);
const SxTableWithRight = withUrlRight(SxTable);

const SxDualTablesPresenter = (props) => {
    return (
        <div className="form-horizontal">
            <div className="container-fluid">
                <div className="container-fluid float-grids">
                    <div
                        aria-label="SxDualTables Available Table"
                        className="grid-element"
                    >
                        {(props.availableIsEditable)
                            ? <SxTableEditableNoPendingWithRight
                                id={`SxDualTablesPresenter-SxTableEditableNoPending-Available`}
                                keyField={props.keyField}
                                selectRow={props.selectRowAvailable}

                                data={props.availableData}
                                onDataChangeDelegator={props.onDataChangeAvailableDelegator}
                                canAdd={false} //Valeur par défaut

                                { //Attention, permet un override des props précédemment reçu.
                                ...props.availableTableProps
                                }
                            />
                            : <SxTableWithRight
                                id={`SxDualTablesPresenter-SxTable-Available`}
                                keyField={props.keyField}
                                selectRow={props.selectRowAvailable}

                                data={props.availableData}
                                onDataChangeDelegator={props.onDataChangeAvailableDelegator}
                                canAdd={false} //Valeur par défaut

                                { //Attention, permet un override des props précédemment reçu.
                                ...props.availableTableProps
                                }
                            />
                        }
                    </div>
                    <div className="buttons">
                        <div className="mb-2">
                            <SxTooltipButton
                                disabled={!(typeof props.selectRowAvailable.selected === 'undefined' || props.selectRowAvailable.selected.length > 0)}
                                btnProps={{
                                    color: "primary",
                                    onClick: props.addButtonHandler
                                }}
                                btnText={props.msg.button.dualTableAdd}
                                tooltipText={props.msg.tooltip.add}
                            />
                        </div>
                        <div>
                            <SxTooltipButton
                                disabled={!(typeof props.selectRowIncluded.selected === 'undefined' || props.selectRowIncluded.selected.length > 0)}
                                btnProps={{
                                    color: "primary",
                                    className: "mb-3 mb-xl-0",
                                    onClick: props.removeButtonHandler
                                }}
                                btnText={props.msg.button.dualTableRemove}
                                tooltipText={props.msg.tooltip.delete}
                            />
                        </div>
                    </div>
                    <div
                        aria-label="SxDualTables Included Table"
                        className="grid-element"
                    >
                        {(props.includedIsEditable)
                            ? <SxTableEditableNoPendingWithRight
                                id={`SxDualTablesPresenter-SxTableEditableNoPending-Included`}
                                keyField={props.keyField}
                                selectRow={props.selectRowIncluded}

                                data={props.includedData}
                                onDataChangeDelegator={props.onDataChangeSelectedDelegator}
                                canAdd={false} //Valeur par défaut

                                {  //Attention, permet un override des props précédemment reçu.
                                ...props.includedTableProps
                                }
                            />
                            : <SxTableWithRight
                                id={`SxDualTablesPresenter-SxTable-Included`}
                                keyField={props.keyField}
                                selectRow={props.selectRowIncluded}

                                data={props.includedData}
                                onDataChangeDelegator={props.onDataChangeSelectedDelegator}
                                canAdd={false} //Valeur par défaut

                                {  //Attention, permet un override des props précédemment reçu.
                                ...props.includedTableProps
                                }
                            />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
};


SxDualTablesPresenter.propTypes = {
    keyField: PropTypes.string.isRequired,

    availableTableProps: PropTypes.object.isRequired,
    includedTableProps: PropTypes.object.isRequired,
    addButtonHandler: PropTypes.func.isRequired,
    removeButtonHandler: PropTypes.func.isRequired,

    availableData: PropTypes.array,
    includedData: PropTypes.array,

    selectRowAvailable: PropTypes.object,
    selectRowIncluded: PropTypes.object,

    availableIsEditable: PropTypes.bool,
    includedIsEditable: PropTypes.bool,
    msg: PropTypes.object,
};

export default SxDualTablesPresenter;