import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withConfigs } from '@telco360/components'
import { Helpers as commonHelpers } from '@telco360/commonjs';

import { getOrderByDragActionColumnDefinition } from './SxTable.orderByDragAction';
import SxDualTablesPresenter from './SxDualTables.presenter';


const cte = {
    grid_cfg: {
        selected_background_color: '#E2F0FF',
    }
};

const sxDualTablesDefaultMsg = {
    ariaLabel: {
        orderByDragAction: "Ordonner via glisser-déposer",
    },
    button: {
        dualTableAdd: ">",
        dualTableRemove: "<",
    },
    headerColumnLabel: {
        orderByDragAction: "Ordre",
    },
    tooltip: {
        add: "Ajouter",
        delete: "Enlever",
    },
};

class SxDualTables extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedAvailable: [],
            selectedIncluded: [],

            /*
             Utilisé pour contourner ce qui me semble être un bug avec les tables RBT2.
             Les valeurs utilisé pour les colonnes ne sont parfois pas rafraichit lorsque la valeur d'un formatExtraData est changé.
             Ceci est donc utilisé pour provoquer un refresh de la table sans la colonne d'ordering et ensuite re faire un refresh normal pour mettre le tout à jour correctement.
             Si les listes deviennent un jour trop longue, il faudra trouver une solution alternative pour les performances.
            */
            fakeRender: false,
        };
    };

    delegateOnDataChangeAvailable = () => { };
    delegateOnDataChangeSelected = () => { };

    handleOrderOnDropIncluded = (rows) => {
        let gridData = commonHelpers.deepClone(this.props.data);

        //On fusionne les données retournées par le dragAndDrop component avec les reste des données de l'autre grid.
        gridData = gridData.map((r) => {
            var res = rows.filter((r2) => { return r[this.props.keyField] === r2[this.props.keyField] })[0];

            if (typeof res !== 'undefined') {
                let tmp = r;
                tmp[this.props.orderByDragValueDataField] = res[this.props.orderByDragValueDataField];

                //Si une ligne a été déplacé, toutes les rows doivent être considéré comme dirty.
                if (typeof this.props.dirtyField !== 'undefined') {
                    tmp[this.props.dirtyField] = true;
                }

                return tmp;
            }
            else {
                return r;
            }
        }).sort((a, b) => {
            return a[this.props.orderByDragValueDataField] - b[this.props.orderByDragValueDataField];
        });
        this.props.orderByDragOnAfterUpdate(gridData);
    };

    handleOnSelectIncluded = (row, isSelect) => {
        if (isSelect) {
            this.setState({
                selectedIncluded: [...this.state.selectedIncluded, row]
            });
        } else {
            this.setState({
                selectedIncluded: this.state.selectedIncluded.filter((r) => { return r !== row })
            });
        }
    };

    handleOnSelectAllIncluded = (isSelect, rows) => {
        if (isSelect) {
            this.setState({
                selectedIncluded: rows,
            })
        }
        else {
            this.setState({
                selectedIncluded: [],
            });
        }
    };

    handleOnSelectAvailable = (row, isSelect) => {
        if (isSelect) {
            this.setState({
                selectedAvailable: [...this.state.selectedAvailable, row]
            });
        } else {
            this.setState({ selectedAvailable: this.state.selectedAvailable.filter((r) => { return r !== row }) });
        }
    };

    handleOnSelectAllAvailable = (isSelect, rows) => {
        if (isSelect) {
            this.setState({
                selectedAvailable: rows,
            })
        }
        else {
            this.setState({
                selectedAvailable: [],
            });
        }
    };


    addButtonOnClick = () => {
        let rowsToTransfer = this.state.selectedAvailable;

        if (typeof (this.props.data) === 'undefined') {         //Signifie que les données sont géré par le component utilisant la dual grid. Donc rien à faire ici.
            this.props.addButtonHandler(rowsToTransfer);
        }
        else {
            let gridData = commonHelpers.deepClone(this.props.data);

            gridData.forEach(row => {
                if (this.state.selectedAvailable.some(r => r[this.props.keyField] === row[this.props.keyField])) {
                    row[this.props.isSelectedField] = true;

                    if (typeof this.props.dirtyField !== 'undefined') {
                        row[this.props.dirtyField] = true;
                    }

                    if (typeof this.props.orderByDragValueDataField !== 'undefined') {
                        row[this.props.orderByDragValueDataField] = this.props.data.filter(r2 => r2[this.props.isSelectedField]).length
                    }
                }
            });

            if (typeof this.props.orderByDragValueDataField !== 'undefined') {
                gridData.sort((a, b) => { return a[this.props.orderByDragValueDataField] - b[this.props.orderByDragValueDataField] })       //On mets la liste en ordre selon l'ordering
                    .filter(d => d[this.props.isSelectedField])                                                                             //Pour chacun des éléments allant dans la table avec l'ordering d'actif
                    .forEach((r, i) => { r[this.props.orderByDragValueDataField] = i; });                                                   //On ajuste l'ordering pour avoir des valeurs continues.
            }

            this.props.addButtonHandler(rowsToTransfer, gridData);
        }
        this.delegateOnDataChangeAvailable();

        this.setState({
            selectedAvailable: [],
            fakeRender: true,
        }, () => {
            if (typeof this.props.orderByDragValueDataField !== 'undefined') {
                this.setState({ fakeRender: false });
            }
        });
    };

    removeButtonOnClick = () => {
        let rowsToTransfer = this.state.selectedIncluded;
        let showWarning = false;
        let blockedRows = [];

        if (typeof (this.props.data) === 'undefined') {    //Signifie que les données sont géré par le component utilisant la dual grid. Donc rien à faire ici.
            this.props.removeButtonHandler(rowsToTransfer);
        } else {
            let gridData = commonHelpers.deepClone(this.props.data);
            gridData.forEach(row => {
                if (this.state.selectedIncluded.some(r => r[this.props.keyField] === row[this.props.keyField])) {
                    if (typeof (this.props.isFixField) !== 'undefined' &&
                        row[this.props.isFixField]) {
                        showWarning = true;
                        blockedRows.push(row);
                    } else {
                        row[this.props.isSelectedField] = false;

                        if (typeof this.props.dirtyField !== 'undefined') {
                            row[this.props.dirtyField] = true;
                        }

                        if (typeof this.props.orderByDragValueDataField !== 'undefined') {
                            row[this.props.orderByDragValueDataField] = -1;
                        }
                    }
                }
            });

            if (typeof (this.props.showFixWarnFunc) === 'function'
                && showWarning) {
                this.props.showFixWarnFunc(blockedRows);
            }

            if (typeof this.props.orderByDragValueDataField !== 'undefined') {
                gridData.sort((a, b) => { return a[this.props.orderByDragValueDataField] - b[this.props.orderByDragValueDataField] })   //On mets la liste en ordre selon l'ordering
                    .filter(d => d[this.props.isSelectedField])                                                                         //Pour chacun des éléments allant dans la table avec l'ordering d'actif
                    .forEach((r, i) => { r[this.props.orderByDragValueDataField] = i; });                                               //On ajuste l'ordering pour avoir des valeurs continues.
            }

            this.props.removeButtonHandler(rowsToTransfer, gridData);
        }
        this.delegateOnDataChangeSelected()

        this.setState({
            selectedIncluded: [],
            fakeRender: true,
        }, () => {
            if (typeof this.props.orderByDragValueDataField !== 'undefined') {
                this.setState({ fakeRender: false });
            }
        });
    };

    selectRowIncluded = {
        mode: 'checkbox',
        clickToSelect: false,
        bgColor: this.props.cte.grid_cfg.selected_background_color,

        onSelect: this.handleOnSelectIncluded,
        onSelectAll: this.handleOnSelectAllIncluded,
    };

    selectRowAvailable = {
        mode: 'checkbox',
        clickToSelect: false,
        bgColor: this.props.cte.grid_cfg.selected_background_color,

        onSelect: this.handleOnSelectAvailable,
        onSelectAll: this.handleOnSelectAllAvailable,
    };

    render() {
        this.selectRowIncluded.selected = this.state.selectedIncluded.map((r) => { return r[this.props.keyField]; });
        this.selectRowAvailable.selected = this.state.selectedAvailable.map((r) => { return r[this.props.keyField]; });

        let availableTableProps = {
            name: "available-table",
            dirtyField: this.props.dirtyField,
            ...this.props.availableTableProps,
        };

        let includedTableProps = { ...this.props.includedTableProps, dirtyField: this.props.dirtyField, };
        if (typeof this.props.orderByDragValueDataField !== 'undefined' && !this.state.fakeRender) {
            includedTableProps = {
                ...this.props.includedTableProps,
                name: "included-table",
                columns: [
                    ...this.props.includedTableProps.columns,
                    getOrderByDragActionColumnDefinition(
                        this.props.keyField,
                        this.props.dirtyField,
                        this.props.isSelectedField,
                        this.props.data,
                        this.props.orderByDragValueDataField,
                        this.handleOrderOnDropIncluded,
                        { //msg
                            ariaLabel: {
                                orderByDragAction: this.props.msg.ariaLabel.orderByDragAction,
                            },
                            headerColumnLabel: {
                                orderByDragAction: this.props.msg.headerColumnLabel.orderByDragAction,
                            },
                        },
                    ),
                ],
                orderByDragOnAfterUpdate: this.props.orderByDragOnAfterUpdate,
                orderByDragValueDataField: this.props.orderByDragValueDataField,
            };
        }

        return <SxDualTablesPresenter
            keyField={this.props.keyField}

            msg={this.props.msg}

            availableTableProps={availableTableProps}
            includedTableProps={includedTableProps}
            addButtonHandler={this.addButtonOnClick}
            removeButtonHandler={this.removeButtonOnClick}

            availableData={(this.props.data || []).filter(elem => !elem[this.props.isSelectedField])}
            includedData={typeof this.props.orderByDragValueDataField !== 'undefined' ?
                (this.props.data || []).filter(elem => elem[this.props.isSelectedField]).sort((a, b) => { return a[this.props.orderByDragValueDataField] - b[this.props.orderByDragValueDataField] }) :
                (this.props.data || []).filter(elem => elem[this.props.isSelectedField])
            }

            availableIsEditable={this.props.availableIsEditable}
            includedIsEditable={this.props.includedIsEditable}

            selectRowAvailable={this.selectRowAvailable}
            selectRowIncluded={this.selectRowIncluded}

            onDataChangeAvailableDelegator={delegate => this.delegateOnDataChangeAvailable = delegate}
            onDataChangeSelectedDelegator={delegate => this.delegateOnDataChangeSelected = delegate}
        />
    }
};

SxDualTables.propTypes = {
    keyField: PropTypes.string.isRequired,                              //Détermine le champs à utiliser pour comparer les rows entre les deux grids. Ne devrai pas être différent du keyField de chacune  des deux grids mais peu l'être si nécessaire.

    includedTableProps: PropTypes.object.isRequired,
    availableTableProps: PropTypes.object.isRequired,
    addButtonHandler: PropTypes.func.isRequired,
    removeButtonHandler: PropTypes.func.isRequired,

    includedIsEditable: PropTypes.bool,                                 //Indique si la table des éléments disponibles est editable.
    availableIsEditable: PropTypes.bool,                                //Indique si la table des éléments sélectionnés est editable.

    //Les props suivants sont utilisé dans les cas où on gère les données à l'intérieur du component SxDualTables.
    data: PropTypes.array,                                              //Data total (des deux grids), utilisé lorsque la gestiond es données est faite à l'intérieur du component.

    isSelectedField: PropTypes.string,                                  //Détermine le champ de la row à changer pour indiquer si elle est sélectionné. Nécessaire lorsque la sélection est géré à l'intérieur du component.
    dirtyField: PropTypes.string,                                       //Détermine le champ à utiliser pour indiquer les rows dirty.
    isFixField: PropTypes.string,                                       //Détermine le champ à utiliser pour indiquer les rows ne pouvant pas être retiré de la sélection.

    showFixWarnFunc: PropTypes.func,                                    //Fonction à exécuter pour montrer à l'utilisateur qu'un remove a été bloqué par le isFixedField.
    orderByDragOnAfterUpdate: PropTypes.func,                           //Fonction de callback appelée après avoir ordonné les lignes sélectionnées via le glisser-déposer.
    orderByDragValueDataField: PropTypes.string,                        //Champs sur lequel se baser pour ordonner les lignes sélectionnées via le glisser-déposer.
    cte: PropTypes.object,
    msg: PropTypes.object,
};

SxDualTables.defaultProps = {
    isSelectedField: "isIncluded",
    dirtyField: "isDirty",
    isFixField: "isFixed",
    cte: cte,
    msg: sxDualTablesDefaultMsg,
};

SxDualTables.displayName = "SxDualTables";

export { cte };
export { sxDualTablesDefaultMsg };
export default withConfigs(SxDualTables);