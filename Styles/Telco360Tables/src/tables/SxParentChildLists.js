import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'reactstrap';

import SxTable from './SxTable';

import { withSxGetData, withSxDataFilter, withUrlRight, withConfigs } from '@telco360/components';

const cte = {
    grid_cfg: {
        selected_background_color: '#E2F0FF',
    }
};

const SxTableLocal = withUrlRight(withSxGetData(SxTable));
const SxTableLocalFilter = withUrlRight(withSxGetData(withSxDataFilter(SxTable)));

class SxParentChildLists extends Component {
    constructor(props) {
        super(props);

        this.state = {
            clickedRow: null,
            refreshSubs: true,

            gridsData: {},
        }
    }

    handleLoad = (gridData, gridId) => {
        let { gridsData } = this.state;

        if (this.state.clickedRow === null &&
            gridData.length > 0 &&
            gridId.includes("parentG")) {
            this.setState(prevState => ({               //Lors du premier chargement, on sélectionne la première ligne de la liste parent automatiquement et on refresh les listes.
                clickedRow: gridData[0],
                refreshSubs: !prevState.refreshSubs
            }));
        }

        gridsData[gridId] = gridData;

        this.setState({
            gridsData: gridsData,
        });
    }

    generateTableComponent = (tblProps) => {
        if (typeof tblProps.searchFieldsDefinitions === "undefined") {
            return SxTableLocal;
        }
        else {
            return SxTableLocalFilter;
        }
    }

    handleRowSelect = (row) => {
        if (row[this.props.keyField] !== this.state.clickedRow[this.props.keyField]) {
            this.setState(prevState => ({
                clickedRow: row,
                refreshSubs: !prevState.refreshSubs
            }));
        }
    }


    selectRow = {
        mode: 'radio',
        bgColor: this.props.cte.grid_cfg.selected_background_color,
        onSelect: this.handleRowSelect,
    };

    getTitle = (tblProps) => {
        let title = "";
        if (typeof tblProps.title !== 'undefined') { // Si le titre de la table enfant est défini nous l'afficherons ici
            title = tblProps.title;
            if (typeof this.state.clickedRow[tblProps.fieldInTitle] !== 'undefined') { // Si une colonne de la table parent est identifié comme faisant partie du titre de la grille, nous ajouterons la valeur de la rangé sélectionné ici
                title += ' ' + this.state.clickedRow[tblProps.fieldInTitle];
            }
        }
        return title;
    }

    renderChildLists = () => {
        if (Array.isArray(this.props.childTablesProps[0])) {              //Plusieurs rows de tables enfants de définit
            return this.props.childTablesProps.map((row, rowI) => {
                return <Row key={rowI}>
                    {
                        row.map((tblProps, tblI) => {
                            let SxTableLocalComponent = this.generateTableComponent(tblProps);

                            return <Col key={tblI}>
                                <SxTableLocalComponent
                                    {...tblProps}
                                    id={`${this.constructor.name}-SxTableLocalComponent-${tblI}`}
                                    name={`table-${tblI}`}
                                    title={this.getTitle(tblProps)}
                                    getData={tblProps.getData.bind(this, this.state.clickedRow ? this.state.clickedRow[this.props.keyField] : 0, this, "ChildGetData")}
                                    refresh={this.state.refreshSubs}
                                    handleLoad={(gridData) => { this.handleLoad(gridData, "childG-" + rowI + "." + tblI) }}
                                    columns={tblProps.columns}
                                    cardBodyClassName={"childTableStyle"}

                                />
                            </Col>;
                        })
                    }
                </Row>
            });
        }
        else {                  //Une seule row de tables enfants de définit
            return (<Row>
                {
                    this.props.childTablesProps.map((tblProps, tblI) => {
                        let SxTableLocalComponent = this.generateTableComponent(tblProps);

                        let title = tblProps.title
                            ? tblProps.title + " " + (tblProps.fieldInTitle
                                ? (typeof this.state.clickedRow[tblProps.fieldInTitle] !== 'undefined'
                                    ? this.state.clickedRow[tblProps.fieldInTitle]
                                    : "")
                                : "")
                            : ""

                        return <Col key={tblI}>
                            <SxTableLocalComponent
                                {...tblProps}
                                id={`${this.constructor.name}-SxTableLocalComponent-${tblI}`}
                                name={`table-${tblI}`}
                                title={title}
                                getData={tblProps.getData.bind(this, this.state.clickedRow ? this.state.clickedRow[this.props.keyField] : 0, this, "ChildGetData2")}
                                refresh={this.state.refreshSubs}
                                handleLoad={(gridData) => { this.handleLoad(gridData, "childG-" + tblI) }}
                                columns={tblProps.columns}
                                cardBodyClassName={"childTableStyle"}
                            />
                        </Col>;
                    })
                }
            </Row>)
        }
    }

    render() {
        this.selectRow.selected = [this.state.clickedRow ? this.state.clickedRow[this.props.keyField] : 0];

        let SxTableLocalComponent = this.generateTableComponent(this.props.parentTableProps);

        return (<>
            <SxTableLocalComponent
                {...this.props.parentTableProps}
                id={`${this.constructor.name}-SxTableLocalComponent`}
                name="SxParentChildTable"
                selectRow={this.selectRow}
                handleLoad={(gridData) => { this.handleLoad(gridData, "parentG") }}
                columns={this.props.parentTableProps.columns}
                refresh={true}
            />
            {this.state.clickedRow &&
                this.renderChildLists()
            }
        </>);
    }
}

//Fonctions de validation custom des props à passer aux SxTables.
const validateParentTableProps = (propValue, key, componentName, _location, propFullName) => {
    if (key === 'selectRow' ||
        key === 'onRowClick' ||
        key === 'handleLoad' ||
        key === 'refresh') {
        return new Error('Invalid prop in ' + componentName + ' : ' + propFullName +' cannot be contained because it will be overriden.');
    } else if (key === 'columns') {
        let hasError = false;
        propValue[key].forEach((col) => {
            if ((col.injectFilter &&
                (typeof (col.filter) !== 'undefined' || typeof (col.filterRenderer) !== 'undefined'))) {
                hasError = true;
            }
        });
        if (hasError) {
            return new Error('Invalid prop in ' + componentName + '  : ' + propFullName +' cannot contain columns defined with injectFilter = true with a filter and filterRenderer defined since they will be overriden.');
        }
    }
}
const validateChildTablesProps = (propValue, key, componentName, location, propFullName) => {
    var result;
    try {
        if (Array.isArray(propValue[key])) {
            propValue[key].forEach((t) => {
                Object.keys(t).forEach((k) => {
                    result = validateParentTableProps(t, k, componentName, location, propFullName + "." + k);

                    if (typeof (result) !== 'undefined') {
                        throw result;
                    }
                    else if (typeof (t.getData) !== 'function') {
                        throw new Error('Invalid prop in ' + componentName + ' : ' + propFullName + "." + k + ' must be a function.');
                    }
                });
            });
        }
        else {
            Object.keys(propValue[key]).forEach((k) => {
                result = validateParentTableProps(propValue[key], k, componentName, location, propFullName + "." + k );

                if (typeof (result) !== 'undefined') {
                    throw result;
                }
                else if (typeof (propValue[key].getData) !== 'function') {
                    throw new Error('Invalid prop in ' + componentName + ' : ' + propFullName + "." + k + ' must be a function.');
                }
            });
        }
    }
    catch (ex) {
        console.error(ex.message);          //Solution de contournement car le message semble être perdu lorsqu'il devient géré par la mécanique interne de react.
        return ex;
    }
}

SxParentChildLists.propTypes = {
    id: PropTypes.string.isRequired,                    //Nom unique (non visible) utilisé pour définir un identifant unique (id) pour les champs
    keyField: PropTypes.string.isRequired,              //Nom du champ faisant le lien entre la table parent et les table enfants.
    parentTableProps: PropTypes.objectOf(validateParentTableProps),

    childTablesProps: PropTypes.oneOfType([
        PropTypes.arrayOf(validateChildTablesProps)
    ]).isRequired,
    cte: PropTypes.object,
};

SxParentChildLists.defaultProps = {
    cte: cte,
};

SxParentChildLists.displayName = "SxParentChildLists";

export { cte };
export default withConfigs(SxParentChildLists);