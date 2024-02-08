import React from 'react';
import { SxDropdownMenu } from '@telco360/components';


const ColumnAction = ({ id, containerId, column, row }) =>
    <SxDropdownMenu
        id={id}
        containerId={containerId}
        actionsList={(column?.columnActions?.filter?.((action) => !action?.filter || action?.filter?.(row)) || [])
            .map((action, idx) => {
                return {
                    id: action.id ?? idx,
                    key: "key" + action.id ?? idx,
                    isActive: typeof action.isActive === 'boolean' ? action.isActive :
                        typeof action.isActive === 'function' ? action.isActive(row) :
                            true,
                    label: action.label,
                    onClick: () => action.onClick(row)
                };
            })}
        dropdownToggleClassName="btn py-0 px-1 btn-primary"
        label={column.label ?? <i className="cis-ellipsis d-flex"></i>}
        isInGrid={true}
        alignRight={false}
        disabled={column.disabled}
        caret={column.caret ?? false}
        group={column.group ?? false}
    />;

export default ColumnAction;