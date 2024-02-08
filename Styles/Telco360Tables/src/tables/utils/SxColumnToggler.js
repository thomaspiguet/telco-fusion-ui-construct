import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { ButtonDropdown, DropdownMenu, DropdownToggle, FormGroup, Input, Label } from 'reactstrap';
import { SxTooltip, SxIcon, withConfigs } from '@telco360/components';
import { Helpers as commonHelpers } from '@telco360/commonjs';

const msg = {
    tooltip: {
        toggleCols: 'Colonnes',
    }
};


/// Ce composant permet de sélectionner les colonnes affichées dans une grille de données.
const SxColumnToggler = ({
    columns,
    excludedColDataFields,
    toggles,
    onColumnToggle,
    toggleCols
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [_columns, setColumns] = useState(columns.filter(col => !excludedColDataFields.some(excludedDataField => excludedDataField === col.dataField)));
    const [_toggles, setToggles] = useState(commonHelpers.deepClone([toggles])[0]);

    const previewToggles = useRef();

    useEffect(() => {
        previewToggles.current = toggles;
    },[toggles]);

    if (previewToggles.current !== toggles){
        let tmp = _toggles;
        //Pour tout les toggles que nous avons dans le state qui ne match pas avec ce qui est dans les props, nous simulons un click pour le remettre dans le bon état.
        Object.keys(_toggles).forEach(k => {
            if (toggles.hasOwnProperty(k) && tmp[k] !== toggles[k]) {
                onColumnToggle(k);
            }
        });
    };
    
    useEffect(() => {
        setColumns(columns.filter(col => !excludedColDataFields.some(excludedDataField => excludedDataField === col.dataField)));
    },[excludedColDataFields]);

    const toggle = () => {
        setDropdownOpen(!dropdownOpen);
    };

    if (!_columns) return <></>

    return <ButtonDropdown isOpen={dropdownOpen} toggle={() => { toggle(); }} >
        <SxTooltip title={toggleCols}>
            <DropdownToggle 
                aria-label={toggleCols}
                color="none"
            >
                <SxIcon className="cis-columns"></SxIcon>
            </DropdownToggle>
        </SxTooltip>
        <DropdownMenu right>
            {
                _columns
                    .map(column => ({
                        ...column,
                        toggle: _toggles[column.dataField]
                    }))
                    .map(column => (
                        <FormGroup check className="checkbox" key={column.dataField}>
                            <Input className="form-check-input" type="checkbox" id={column.text} name={column.text}
                                checked={column.toggle ? true : false}
                                onChange={() => {
                                    var tmp = _toggles;
                                    tmp[column.dataField] = !tmp[column.dataField];
                                    setToggles(tmp);
                                    onColumnToggle(column.dataField);
                                }}
                            />
                            <Label check className="form-check-label" htmlFor={column.text}>{column.text}</Label>
                        </FormGroup>
                    ))
            }
        </DropdownMenu>
    </ButtonDropdown>
};


SxColumnToggler.propTypes = {
    columns: PropTypes.array.isRequired,
    excludedColDataFields: PropTypes.array,
    toggles: PropTypes.oneOfType([PropTypes.array,  PropTypes.object,]),
    onColumnToggle: PropTypes.func,
    toggleCols: PropTypes.string,
};

SxColumnToggler.defaultProps = {
    excludedColDataFields: [],
    toggleCols: msg.tooltip.toggleCols,
}
SxColumnToggler.displayName = "SxColumnToggler";

export{ msg };
export default withConfigs(SxColumnToggler);