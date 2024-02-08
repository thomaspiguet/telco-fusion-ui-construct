import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Helpers, usePrevious, useSelfRefCallback, useUpdate } from '@telco360/commonjs';

import { Input, Alert } from 'reactstrap';
import { vsprintf } from 'sprintf-js';

import { SxLoading, SxExpandIcon, SxButtonIcon, withSxMetadataInspectorContainer, withConfigs, SxNoDataIndicator, SxDataErrorIndicator, withModalFormLink } from '@telco360/components';

import { getVisibleCols, isColHidden, getFlatColumns, searchAllProperties, getItemRight } from './SxTable.helpers';
import { orderByDragOnAfterUpdatePropTypesValidator, orderByDragValueDataFieldPropTypesValidator } from './SxTable.orderByDragAction.propTypes';
import SxTableControls from './SxTable.controls';
import SxTableCellWrapper from './SxTable.cellWrapper';
import SxTableCellEdit from './SxTable.cellEdit';
import SxTableCellFormatter from './SxTable.cellFormatter';
import SxTableColHeaders from './SxTable.colHeaders';
import sxTableColumnPropTypes from './SxTable.columnPropTypes';
import sxTableColumnTypes from "./SxTable.columnTypes";
import SxTableEditControls from './SxTable.editControls';
import SxTablePaging from './SxTable.paging';
import SxTableSummary from './SxTable.summary';
import withTableColumnAccessors from './SxTable.colDef.accessor';


const icons = {
    filter: "fa fa-search fa-lg",
    clear: "fa fa-times mb-1",
    delete: "cis-trash",
    clone: "cis-clone",
    sort: {
        none: "cis-swap-vertical",
        ascending: "cis-sort-alpha-down",
        descending: "cis-sort-alpha-up",
    },
};

const sxTableDefaultMsg = {
    ariaLabel: {
        sortColumn: "Trier",
    },
    button: {
        cancel: "Annuler",
        save: "Sauvegarder",
    },
    label: {
        numberOfItem0: "Nombre d'items: %s",
    },
    tooltip: {
        exportCsv: "Exporter CSV",
        removeRow: "Supprimer",
        clone: "Dupliquer",
        toggleCols: "Colonnes",
    },
    csvModal: {
        title: "Désirez vous exporter les données au format CSV ?",
        separator: "Séparateur",
        rawData: "Données brutes",
        incColTitle: "Inclure titre colonne",
        onlyVisible: "Seulement colonnes visibles",
    },
};

//=============================================================================================
//ToDo AG_2022-03-14 : Faire un component générique pour le tri, à réutiliser dans SxTextArea.
/// Définit les types de tri.
const sortOrder = {
    none: {
        apply: (_elementA, _elementB) => 0,
        icon: icons.sort.none,
        nextSortOrder: () => sortOrder.ascending,
        text: "NONE"
    },
    ascending: {
        apply: (a, b) => typeof a === "string" && typeof b === "string"
            ? a?.localeCompare?.(b)
            : a > b ? 1 : a < b ? -1 : 0,
        icon: icons.sort.ascending,
        nextSortOrder: () => sortOrder.descending,
        text: "asc"
    },
    descending: {
        apply: (a, b) => typeof a === "string" && typeof b === "string"
            ? b?.localeCompare?.(a)
            : a < b ? 1 : a > b ? -1 : 0,
        icon: icons.sort.descending,
        nextSortOrder: () => sortOrder.none,
        text: "desc"
    },
};

if (Object.freeze) {
    Object.freeze(sortOrder);
}
//=============================================================================================


const focusInCurrentTarget = ({ relatedTarget, currentTarget }) => {
    if (relatedTarget === null) return false;

    let node = relatedTarget.parentNode;

    while (node !== null) {
        if (node === currentTarget) return true;
        node = node.parentNode;
    }

    return false;
};

const renderValue = (val, colDef) => {
    if (colDef?.type?.renderValue) {
        return colDef.type.renderValue(colDef, val);
    };
    let str = typeof val === 'string' ?
        val :
        val?.toString();

    return str === null || typeof str === 'undefined' || str.match(/^ *$/) !== null ?
        <br /> :         //Nous ne voulons jamais qu'une cellule soit complètement vide pour que les lignes aient toujours une hauteur minimale.
        str;
};

const SxTable = ({
    id,
    name,
    title,
    columns: columnsOriginals,
    data,
    extraData,
    striped,
    containerClassName = "",
    icons,
    canAdd,
    canSearch,
    canSelectAll,
    renderFilterOpenBtn,
    renderFilterBar,
    submitDelegator,
    cancelDelegator,
    validateDelegator,
    onValidateCanAdd,
    usePagination,
    columnToggler,
    togglerExcludedColDataFields,
    actionsId,
    actionsList,
    canExport,
    canReload,
    reloadData,
    renderFormLink,
    openForm,
    bordered,
    selectRow,
    keyField,
    remote,
    totalNbElements,
    pageSize,
    fixedPageSize,
    page,
    doPageChange,
    doPageSizeChange,
    doSortChange,
    defaultSort,
    doSearchChange,
    doSearchClear,
    editable,
    validateAllOnSave,
    noValidationOnSave,
    onDataChange,
    doUpdateData,
    canAddLine,
    onAddLine,
    canRemoveLine,
    onRemoveLine,
    clonableLines,
    canSave,
    onSave,
    onSaveSuccess,
    onCancel,
    dirtyField,
    newLineField,
    tryToLaunchPcModal,
    setIsDirtyPanel,
    msg,
    expandRow,
    customTableControls,
    onValErrorStart,
    onValErrorEnd,
    loading,
    getDataExportCsv,
    filteredData,
    doImport,
    allowedFormats,
    isLineDeletable,
    metadata,
    idField
}) => {

    const [sortCol, setSortCol] = useState({ order: sortOrder.none });
    const [search, setSearch] = useState();

    const [_page, setPage] = useState();
    const [_pageSize, setPageSize] = useState(pageSize);
    const [startIdx, setStartIdx] = useState();
    const [endIdx, setEndIdx] = useState();

    const [expandValidation, setExpandValidation] = useState([]);
    const [hiddenCols, setHiddenCols] = useState();

    const [filterBarData, setFilterBarData] = useState();
    const [fullTreatedData, setFullTreatedData] = useState([]);

    const [selectedRow, setSelectedRow] = useState();

    const [errors, setErrors] = useState([]);
    const [runningValsAndOperations, setRunningValsAndOperations] = useState([]);

    const [rowIsExpanded, setRowIsExpanded] = useState([]);
    const [rowDelegators, setRowDelegators] = useState({});
    const [validationQueue, setValidationQueue] = useState([]);
    const [processingEventId, setProcessingEventId] = useState(null);
    const [completedEventId, setCompletedEventId] = useState();

    const [internVals, setInternVals] = useState({});

    const prevData = usePrevious(data ?? []);
    const prevProcessingEventId = usePrevious(processingEventId);
    const tblRef = useRef();

//Petit "hack" pour ne pas avoir à mettre JSON.stringify(columns) dans tout les autres useEffect.    
const columns = useMemo(() => columnsOriginals
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [JSON.stringify(columnsOriginals)]);

    const flatCols = useMemo(() => {
        if (typeof columns !== 'undefined') {
            return getFlatColumns(columns, metadata);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[JSON.stringify(columns), metadata]);

    const visibleCols = useMemo(() => 
        getVisibleCols(columns, hiddenCols, metadata)
    , [columns, hiddenCols, metadata]);

    const visibleColsFlat = useMemo(() => 
        getVisibleCols(flatCols, hiddenCols, metadata)
    , [flatCols, hiddenCols, metadata]);

    const onExpandRow = (keyValue) => {
        if (rowIsExpanded.some(x => x === keyValue)) {
            setRowIsExpanded(rowIsExpanded.filter(x => x !== keyValue));
            if (expandRow.lazyLoading) {
                setExpandValidation(expandValidation => expandValidation.filter(x => x.rowId !== keyValue));
                setErrors(errors => errors.filter(x => !(x.rowId === keyValue && x.dataField === "expandRow")));
            }
        } else {
            setRowIsExpanded(rowIsExpanded.concat([keyValue]));
        };
    };

    const onExpandAllRow = () => {
        if (rowIsExpanded.length > 0) {
            setRowIsExpanded([]);
            if (expandRow.lazyLoading) {
                setExpandValidation([]);
                setErrors(errors => errors.filter(x => x.dataField !== "expandRow"));
            }
        } else {
            setRowIsExpanded(fullTreatedData?.filter(x => !expandRow.nonExpandable?.includes(x[keyField]))?.map(x => x[keyField]));
        };
    };

    const onSortClick = (dataField) => {
        var nextOrder = sortCol?.dataField === dataField ?
            sortCol?.order?.nextSortOrder() ?? sortOrder.ascending :
            sortOrder.ascending;

        if (nextOrder === sortOrder.none) {
            doSortChange?.(defaultSort?.dataField ?? undefined, defaultSort?.order ?? nextOrder.text);
        } else {
            doSortChange?.(dataField, nextOrder.text);
        }

        setSortCol({
            dataField,
            order: nextOrder
        });
    };

    const onSearch = (value) => {
        setSearch(value);
        doSearchChange?.(value);
        returnToFirstPage();
    };

    const onClear = () => {
        setSearch(undefined);
        doSearchClear?.();
        returnToFirstPage();
    };

    const returnToFirstPage = () => {
        doPageChange?.(1);
        setPage(1);
        setStartIdx(0);
        setEndIdx(pageSize);
    }

    const onPageChange = (page, startIdx, endIdx) => {
        doPageChange?.(page);
        setPage(page);
        setStartIdx(startIdx);
        setEndIdx(endIdx);
    };

    const refreshRunningValsAndOperations = useSelfRefCallback(async (isRunning, rowId, dataField, warmup = false) => {
        await new Promise(resolve => setTimeout(resolve, 1));
        if (isRunning) {
            if (!runningValsAndOperations.some(e => e.rowId === rowId && e.dataField === dataField)) {
                setRunningValsAndOperations(oldValues => [...oldValues, { rowId, dataField, warmup }]);
            }
        }
        else {
            setRunningValsAndOperations(oldValues => oldValues.filter(e => !(e.rowId === rowId && e.dataField === dataField)));
        }
        await new Promise(resolve => setTimeout(resolve, 1));
    }, [runningValsAndOperations]);

    const updateErr = useSelfRefCallback((isError, rowId, dataField, message) => {
        setErrors( errors => {
            if (isError) {
                if (!errors.some(e => e.rowId === rowId && e.dataField === dataField && e.message === message)) {
                    return [...errors, { rowId, dataField, message }];
                }
            }
            else {
                return errors.filter(e => !(e.rowId === rowId && e.dataField === dataField));
            }
        });
    }, []);

    const evalResult = useCallback(async (bruteRes, row, column) => {
        let result = null;

        //Nous vidons les erreurs s'il y en avait pour le champ.
        updateErr(false, row[keyField], column.dataField);
        await new Promise(resolve => setTimeout(resolve, 1));

        if (bruteRes === null || typeof bruteRes === 'undefined') return true;

        if (typeof bruteRes.then === 'function') { //Apparament le seul moyen de savoir si c'est une promise...
            result = await bruteRes ?? true;
        }
        else {
            await new Promise(resolve => setTimeout(resolve, 1));   //Si la validation ne retourne pas un promise, nous forcons un court await pour laisser le temps aux updates de runningVals d'être effectué.
            result = bruteRes;
        }

        if (!(result === true || result?.valid === true)) {
            updateErr(true, row[keyField], column.dataField, result.message);
            await new Promise(resolve => setTimeout(resolve, 1));
        }

        return result;
    }, [keyField, updateErr]);

    const handleValidations = useCallback(async () => {
        let rows = data?.filter(d => validateAllOnSave || d[dirtyField]);
        let promises = [];
        let hasErrors = false;
        try {
            for (let row of rows){
                for (let col of columns){
                    const internVal = internVals[row[keyField]]?.[col.dataField];
                    const currentValue = row[col.dataField];
                    await new Promise(resolve => setTimeout(resolve, 1));
                    promises = [...promises, new Promise(async (resolve) => {
                        let res = true;
                        refreshRunningValsAndOperations(true, row[keyField], col.dataField);
                        try {
                            res = await evalResult(internVal?.(currentValue, row, col, data, extraData), row, col);
                            if (res === true || res?.valid === true) {
                                res = await evalResult(col.validator?.(currentValue, row, col, data, extraData), row, col);
                            }
                        } catch (error) {
                            console.error(error);
                            res = await evalResult({ valid: false, message: "unmanaged exception" }, row, col);
                        } finally {
                            refreshRunningValsAndOperations(false, row[keyField], col.dataField);
                        }
                        resolve(res);
                    })];
                };
                if (expandRow && typeof expandValidation.find(x => x.rowId === row[keyField])?.validation === 'function'){
                    promises = [...promises, new Promise(async (resolve) => {
                        let res = true;
                        refreshRunningValsAndOperations(true, row[keyField], 'expandRow');
                        try {
                            res = await evalResult(await expandValidation.find(x => x.rowId === row[keyField]).validation() ? true : { valid: false, message: "ExpandRow error" }, row, { dataField: 'expandRow' });
                        } catch (error) {
                            console.error(error);
                            res = await evalResult({ valid: false, message: "unmanaged exception" }, row, { dataField: 'expandRow' });
                        } finally {
                            refreshRunningValsAndOperations(false, row[keyField], 'expandRow');
                        }
                        resolve(res);
                    })];
                }
            };    
            const results = await Promise.all(promises);
            setRunningValsAndOperations([]); //On fait un cleanup complet des validations en cours une fois terminé.
            hasErrors = results.some(r => r === false || r?.valid === false);
        } catch (error) {
            console.log(error);
            return false;
        }
        return hasErrors;
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, validateAllOnSave, dirtyField, columns, internVals, keyField, refreshRunningValsAndOperations, evalResult, JSON.stringify(extraData)]);

    const handleSave = useCallback(async () => {
        if (noValidationOnSave) {
            return await onSave();
        }

        if (!(await handleValidations())) {
            return await onSave();
        }
        return false;
    }, [noValidationOnSave, onSave, handleValidations]);

    const handleCancel = (props, propName, component, location) => {
        setErrors([]);
        onCancel(props, propName, component, location)
    };

    const handleRemoveLine = useCallback(async (row) => {
        onRemoveLine(row[keyField], () => {
            setErrors(errors.filter(rvo => rvo.rowId !== row[keyField]));
            setRunningValsAndOperations(oldValues => oldValues.filter(rvo => rvo.rowId !== row[keyField]));
        });
    }, [errors, keyField, onRemoveLine]);

    const onPageSizeChange = (pageSize) => {
        doPageSizeChange?.(pageSize);
        setPageSize(pageSize);
    };

    const doValidateCanAdd = () => {
        const isSuccessResult = onValidateCanAdd?.() ?? true;
        if (!isSuccessResult) {
            console.error(`SxTable.doValidateCanAdd() add button event prevented due to: ${isSuccessResult.message}`);
        }
        return isSuccessResult;
    };

    const visibleData = useCallback(() => {
        if (data === null) return data
        return filteredData ?? data ?? []
    }, [filteredData, data]);

    const isTableValid = useCallback(async () => {
        return !(await handleValidations());
    }, [handleValidations]);

    useEffect(() => {
        validateDelegator?.(isTableValid);
    }, [validateDelegator, isTableValid]);

    useEffect(() => {
        cancelDelegator?.(() => {
            if (typeof tryToLaunchPcModal === 'function') {
                tryToLaunchPcModal(handleCancel);
            } else {
                handleCancel();
            }
        });
    }, [onCancel]);

    useEffect(() => {
        submitDelegator?.(async () => {
            var result = await onSave();
            if (typeof result === 'undefined') {
                console.warn("SxTableEditable props.onSave() returned undefined, a return of true was assumed.");
                result = true;
            }
            if (result) {
                setIsDirtyPanel?.(false);
                onSaveSuccess?.();
            }
            return result;
        });
    }, [onSave]);

    useEffect(() => {
        setHiddenCols(flatCols   //ToDo AG_2022-03-14 : Might be an issue here if we update cols while there are hiddenCols with the column toggler...
            .filter(c => !isColHidden(c))
            .map(c => c.dataField)
            .reduce((a, v) => ({ ...a, [v]: true }), {}));
    }, [flatCols]);

    useUpdate(() => {
        setPageSize(pageSize);
    }, [pageSize]);

    useEffect(() => {
        if (typeof renderFilterBar === 'function') {
            setFilterBarData(data?.map(d => {
                const cols = flatCols;
                var filteredColumns = cols.map(c => {
                    return { field: c.dataField, val: c.filterValue?.(d[c.dataField], d) ?? d[c.dataField] }
                }).reduce((a, v) => ({ ...a, [v.field]: v.val }), {});
                filteredColumns[keyField] = d[keyField];
                return filteredColumns;
            }));
        }
    }, [flatCols, data]);

    useEffect(() => {
        var treatData = visibleData();
        if (treatData === null) setFullTreatedData(null);
        else {
            setFullTreatedData(treatData
                ?.slice()    //Pour éviter que sort ne modifi l'array de data original
                ?.filter(d => remote || typeof search === 'undefined' ?
                    true :
                    searchAllProperties(flatCols.filter(c => !isColHidden(c)), d, newLineField, search))
                ?.sort((a, b) => {
                    // Ne pas trier lorsque la table est en mode 'remote', le tri est géré par le BE.
                    if (remote) return 0;

                    // Cas de tri spécial pour les nouvelles lignes ajoutées.
                    if (a[newLineField] === true) return -1;
                    if (b[newLineField] === true) return 1;

                    const col = flatCols.find(c => c.dataField === sortCol.dataField);
                    return sortCol.order.apply(col?.sortValue?.(a[sortCol.dataField], a) ?? a[sortCol.dataField],
                        col?.sortValue?.(b[sortCol.dataField], b) ?? b[sortCol.dataField]);
                }));
        }
    }, [flatCols, newLineField, remote, sortCol, search, visibleData]);

    useEffect(() => {
        let delegators = {};
        data?.forEach(d => {
            delegators[d[keyField]] = {};
            columns.forEach(c => {
                delegators[d[keyField]][c.dataField] = { delegatorChangeValue: () => { }, delegatorValidations: () => { } }
            });
        });
        setRowDelegators(delegators);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data?.length, _page, columns, keyField]); // Ne pas mettre data ici, on garde data?.length seulement et page pour valider qu'on a pas juste changé de page.  Sinon on va scrapper les validations des autres champs lorsqu'on fait plus d'un changement rapidement.


    // Fonction procédant aux validations liées à une cellule mise à jour.
    const proceedUpdateValue = useCallback(async (_oldValue, newValue, row, column, modifiedData, internVal, isAction) => {
        return new Promise(async (resolve, _reject) => {
            const evalActionResult = async (bruteRes) => {
                let result = null;
                if (bruteRes == null) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                    return null;
                }
                if (typeof bruteRes.then === 'function') { //Apparament le seul moyen de savoir si c'est une promise...
                    result = await bruteRes ?? null;
                }
                else {
                    await new Promise(resolve => setTimeout(resolve, 1));   //Si la validation ne retourne pas un promise, nous forcons un court await pour laisser le temps aux updates de runningVals d'être effectué.
                    result = bruteRes;
                }
                return result;
            }

            let validationResult = true;
            let updatedModifiedData = modifiedData.slice()
            await new Promise(resolve => setTimeout(resolve, 1));
            isAction !== true && refreshRunningValsAndOperations(true, row[keyField], column.dataField);
            if (typeof column.validator === 'function' || typeof internVal === 'function') {
                validationResult = await evalResult(internVal?.(newValue, row, column, modifiedData, extraData), row, column);
                if (validationResult === true || validationResult?.valid === true) {
                    validationResult = await evalResult(column.validator?.(newValue, row, column, modifiedData, extraData), row, column);
                }
            }

            //Effectuer les actions
            var actionsToExecute;
            if (validationResult === true || validationResult?.valid === true) {
                actionsToExecute = await evalActionResult(column.action?.(newValue, row, column, modifiedData, extraData));
            }
            else {
                actionsToExecute = await evalActionResult(column.actionOnFail?.(newValue, row, column, modifiedData, extraData));
            }
            //Execute modify value actions
            for (let k of (Object.keys(actionsToExecute?.actions ?? []))) {
                const colDef = flatCols.find(c => c.dataField === k);
                if (typeof colDef !== "undefined") {
                    updatedModifiedData.find(d => d[keyField] === row[keyField])[k] = actionsToExecute.actions[k];
                    updatedModifiedData = await rowDelegators[row[keyField]][k].delegatorChangeValue(actionsToExecute.actions[k], updatedModifiedData);
                }
                else {
                    console.error(`action for field '${column.dataField}' tried to change value of column '${k}' but it doesn't exist.`);
                }
            }
            //Execute validation actions
            for (let k of (actionsToExecute?.validations ?? [])) {
                const colDef = flatCols.find(c => c.dataField === k);
                if (typeof colDef !== "undefined") {
                    await rowDelegators[row[keyField]][k].delegatorValidations(actionsToExecute.actions[k]);
                }
                else {
                    console.error(`action for field '${column.dataField}' tried to validate value of column '${k}' but it doesn't exist.`);
                }
            }

            // Si la validation nous retourne un ou des champs à revalider, on effectue la revalidation ici.
            if (typeof validationResult.otherFields !== "undefined" && !Array.isArray(validationResult.otherFields)) {
                console.log(`La propriété "otherFields" a été fournie mais est de type "${typeof validationResult.otherFields}" pour la colonne "${column.dataField}".  Le type fourni devrait être "array".`);
            }
            let fieldsToValidate = Array.isArray(validationResult.otherFields) ? validationResult.otherFields : [];
            for (const rC of fieldsToValidate) {
                let rowDataToUse = updatedModifiedData.find(x => x[keyField] === row[keyField]);
                await new Promise(resolve => setTimeout(resolve, 1));
                await refreshRunningValsAndOperations(true, row[keyField], rC);
                await rowDelegators[row[keyField]]?.[rC]?.delegatorValidations?.(rowDataToUse, updatedModifiedData);
                await refreshRunningValsAndOperations(false, row[keyField], rC);
            }

            isAction !== true && await refreshRunningValsAndOperations(false, row[keyField], column.dataField);

            resolve(updatedModifiedData);
        });
    }, [evalResult, extraData, flatCols, keyField, refreshRunningValsAndOperations, rowDelegators]);

    // On ajoute la mise à jour dans la liste si nécessaire.
    const onUpdateValue = useCallback((oldValue, newValue, row, column, modifiedData, internVal, isAction) => {
        onDataChange?.(oldValue, newValue, row, column, modifiedData);

        doUpdateData?.(modifiedData.find(d => d[keyField] === row[keyField]), oldValue, newValue, column.dataField);
        setIsDirtyPanel?.(true);
        if (validationQueue.length > 0) {
            const lastRecord = validationQueue[validationQueue.length - 1];
            if (lastRecord.column === column && lastRecord.oldValue === oldValue && lastRecord.newValue === newValue) {
                return;
            }
        }
        const eventId = Helpers.getNewGuid();
        let newValidationQueue = validationQueue.slice().filter(x => !(x.row[keyField] === row[keyField] && column.dataField === x.column.dataField));
        newValidationQueue.push({ eventId, oldValue, newValue, row, column, modifiedData, internVal, isAction });
        setValidationQueue(newValidationQueue);
    }, [validationQueue]);

    // On lance la validation suivante si aucune est en cours d'exécution.
    useEffect(() => {
        const proceed = async () => {
            if (validationQueue.length > 0) {
                if (processingEventId !== null && (processingEventId === prevProcessingEventId || processingEventId == validationQueue[0].eventId)) {
                    return;
                }
                // Identifier la validation comme en cours d'exécution.
                setProcessingEventId(validationQueue[0].eventId);
                const { eventId, oldValue, newValue, row, column, internVal, isAction, modifiedData } = validationQueue[0];
                try {
                    await proceedUpdateValue(oldValue, newValue, modifiedData?.find(x => x[keyField] === row[keyField]), column, modifiedData, internVal, isAction);
                }
                finally {
                    // Marquer la validation comme complétée.
                    setCompletedEventId(eventId);
                }
            }
        };
        proceed();
    }, [validationQueue, processingEventId, prevProcessingEventId, keyField, proceedUpdateValue])

    // Lorsqu'une validation ext complétée, on retire la validation de la liste et on retire l'état d'exécution de validation.  Ainsi, la prochaine validation pourra être prise en charge.
    useEffect(() => {
        if (completedEventId) {
            setValidationQueue(validationQueue.filter(x => x.eventId !== completedEventId));
            setCompletedEventId();
            setProcessingEventId(null);
        }
    }, [completedEventId, validationQueue]);

    const onExecuteValidations = useCallback(async (currentValue, row, column, internVal, isAction, dataOverride) => {
        return new Promise(async (resolve, _reject) => {
            let result = true;
            if (typeof column.validator === 'function' || typeof internVal === 'function') {
                isAction !== true && refreshRunningValsAndOperations(true, row[keyField], column.dataField);
                result = await evalResult(internVal?.(currentValue, row, column, data, extraData), row, column);
                if (result === true || result?.valid === true) {
                    result = await evalResult(column.validator?.(currentValue, row, column, dataOverride || data, extraData), row, column);
                }
            }
            isAction !== true && refreshRunningValsAndOperations(false, row[keyField], column.dataField);
            resolve(result);
        });
    }, [data, evalResult, extraData, keyField, refreshRunningValsAndOperations]);

    const prevErrors = usePrevious(errors);

    useEffect(() => {
        if ((prevErrors ?? []).length === 0 && errors.length > 0) {
            onValErrorStart?.();
        }
        else if ((prevErrors ?? []).length > 0 && errors.length === 0) {
            onValErrorEnd?.();
        }
    }, [prevErrors, errors]);

    const rowWarmup = useCallback(async (rowId) => {
        if (editable) {
            for (var j = 0; j < columns.length; j++) {
                const column = columns[j];
                await new Promise(resolve => setTimeout(resolve, 1));
                refreshRunningValsAndOperations(true, rowId, column.dataField, true);
            }
            await new Promise(resolve => setTimeout(resolve, 1));
            for (var j = 0; j < columns.length; j++) {
                const column = columns[j];
                await new Promise(resolve => setTimeout(resolve, 1));
                refreshRunningValsAndOperations(false, rowId, column.dataField);
            }
        }
    }, [columns, editable]);

    useEffect(() => {
        //Les nouvelles rows font un chargement sans affichage des components d'édition des cellules afin de charger les validations internes s'il y en a.
        (async () => {
            if (editable && !noValidationOnSave && typeof prevData !== 'undefined' && prevData !== null && data?.length !== prevData?.length) {
                for (var i = 0; i < data?.filter(d => !prevData.some(pd => pd[keyField] === d[keyField] && pd.dataField === d.dataField) && d[newLineField]).length; i++) {
                    if (typeof internVals[data[i][keyField]] === 'undefined') { //Si internVals est déjà remplis pour la ligne le warmup a déjà été fait.
                        await rowWarmup(data[i][keyField]);
                    }
                }
            }
        })();
    }, [data, dirtyField, editable, internVals, keyField, newLineField, noValidationOnSave, prevData, rowWarmup, validateAllOnSave]);

    useEffect(() => {
        //Cleanup des erreurs pour les lignes n'étants plus présente dans la table s'il y en a.
        if (errors.some(e => !data?.some(d => d[keyField] === e.rowId))) {
            setErrors(errors.filter(e => data?.some(d => d[keyField] === e.rowId)));
        }
    }, [data, errors, keyField]);

    useEffect(() => {
        //Cleanup des validation en cour d'exécution pour les lignes n'étants plus présente dans la table s'il y en a.
        if (runningValsAndOperations.some(rvo => !data?.some(d => d[keyField] === rvo.rowId))) {
            setRunningValsAndOperations(oldValues => oldValues.filter(rvo => data?.some(d => d[keyField] === rvo.rowId)));
        }
    }, [data, runningValsAndOperations, keyField]);

    useEffect(() => {
        //Nous devons garder synchroniser les status de la table avec celui des lignes pour les cas où la ligne serait modifié à l'extérieur.
        if (prevData?.length !== data?.length) {
            if (data?.some(d => d[dirtyField])) {
                setIsDirtyPanel?.(true);
            }
        }
    }, [data, dirtyField]);

    const handleReloadData = () => {
        if (typeof tryToLaunchPcModal === 'function') {
            tryToLaunchPcModal(reloadData);
        } else {
            reloadData();
        }
    }

    const startExpandError = useCallback((row) => {
        // On filtre dabord pour ne pas créer de doublons
        setErrors(errors => 
            errors.filter(x => !(x.rowId === row[keyField] && x.dataField === "expandRow"))
                .concat({ rowId: row[keyField], dataField: "expandRow" }));
    }, [keyField]);

    const endExpandError = useCallback((row) => {
        setErrors(errors => errors.filter(x => !(x.rowId === row[keyField] && x.dataField === "expandRow")));
    }, [keyField]);

    const addExpandValidation = (rowId, delegate) => {
        setExpandValidation(expandValidation => {
            let tmp = expandValidation.find(x => x.rowId === rowId) ? expandValidation : expandValidation.concat({ rowId: rowId });
            tmp[tmp.findIndex(x => x.rowId === rowId)].validation = delegate;
            return tmp;
        });
    }

    const needContainerClassName = (typeof actionsList !== 'undefined' || (typeof customTableControls !== 'undefined' && Array.isArray(customTableControls))
        || typeof renderFilterOpenBtn === 'function' || canSearch || typeof doImport === 'function' || canExport || canAdd
        || (typeof columnToggler !== 'undefined' && typeof hiddenCols !== 'undefined'));
    return <div className={(needContainerClassName) ? `border ${containerClassName}` : ""} aria-label={title ?? name}>
        <div className="row no-gutters">
            <div className="col-6 my-auto font-weight-bold">
                {
                    title &&
                    title
                }
            </div>
            <div className="col-6 d-flex justify-content-end">
                <SxTableControls
                    tableId={id}
                    title={title ?? name}
                    fullTreatedData={fullTreatedData}
                    actionsId={actionsId}
                    actionsList={actionsList}
                    customTableControls={customTableControls}
                    renderFilterOpenBtn={renderFilterOpenBtn}
                    canSearch={canSearch}
                    onSearch={onSearch}
                    onClear={onClear}
                    canExport={canExport}
                    canReload={canReload}
                    reloadData={handleReloadData}
                    columnToggler={columnToggler}
                    onColumnToggle={(col) => { setHiddenCols(hiddenCols => { return { ...hiddenCols, [col]: !hiddenCols?.[col] }}) }}
                    hiddenCols={hiddenCols}
                    togglerExcludedColDataFields={(togglerExcludedColDataFields || []).concat(columns?.filter(x => x.isLinkKey).map(x => x.dataField))}
                    flatCols={flatCols}
                    canAdd={canAdd && !editable}    //Si la table est editable, cela n'a pas de sense de permettre l'ajout ici puisqu'il le sera dans SxTablEditControls.
                    doValidateCanAdd={doValidateCanAdd}
                    openForm={openForm}
                    msg={msg}
                    remote={remote}
                    getDataExportCsv={getDataExportCsv}
                    doImport={doImport}
                    allowedFormats={allowedFormats}
                    metadata={metadata}
                />
                {editable &&
                    <SxTableEditControls
                        canAddLine={canAddLine}
                        handleAddRow={() => {
                            if (typeof onAddLine === 'function') {
                                returnToFirstPage();
                                onAddLine?.();
                                setIsDirtyPanel?.(true);
                            }
                            else { //Si onAddLine n'est pas fournit, nous affichons le formulaire d'ajout de la manière standard d'une table non editable.
                                if (doValidateCanAdd?.() ?? true) {
                                    openForm?.();
                                }
                            }
                        }}
                        doValidateCanAdd={doValidateCanAdd}
                        openForm={openForm}
                        canSave={canSave}
                        onSave={handleSave}
                        onSaveSuccess={onSaveSuccess}
                        isDirty={fullTreatedData?.some(d => d[dirtyField])}
                        addLineEnabled={runningValsAndOperations.length === 0}      //Pour garder les status de ligne à jour, nous ne pouvons pas ajouter de lignes alors que d'autres lignes sont en cours de traitement.
                        saveEnabled={!(errors.length > 0 || runningValsAndOperations.length > 0) && fullTreatedData?.some(d => d[dirtyField])}
                        onCancel={handleCancel}
                        tryToLaunchPcModal={tryToLaunchPcModal}
                        setIsDirtyPanel={setIsDirtyPanel}
                        msg={msg}
                    />
                }
            </div>
        </div>
        {renderFilterBar &&
            renderFilterBar(filterBarData)
        }
        <table
            tabIndex={0}
            ref={tblRef}
            className={`${bordered ? 'table-bordered' : ''} sxTable ${striped ? 'striped' : ''}`}
            onBlur={(e) => {
                if (!focusInCurrentTarget(e)) {
                    setTimeout(() => setSelectedRow(), 5);      //Nous utilisons un court timeout pour laisser le temps au status de la cellule en édition de ce mettre à jour pour éviter de la détruire avant qu'elle ne soit prette.
                }
            }}
            onKeyUp={(event) => {
                if (event.key === 'Escape') {
                    setTimeout(() => setSelectedRow(), 5);      //Nous utilisons un court timeout pour laisser le temps au status de la cellule en édition de ce mettre à jour pour éviter de la détruire avant qu'elle ne soit prette.
                }
            }}
        >
            <thead>
                <SxTableColHeaders
                    canRemoveLine={canRemoveLine && typeof onRemoveLine === "function"}
                    canSelectAll={canSelectAll}
                    clonableLines={clonableLines}
                    colDefs={visibleCols}
                    icons={icons}
                    id={id}
                    expandHeader={typeof expandRow !== 'undefined'}
                    msg={msg}
                    onExpand={onExpandAllRow}
                    onSortClick={onSortClick}
                    rowsExpand={rowIsExpanded}
                    selectRow={selectRow}
                    sortCol={sortCol}
                    data={data}
                />
            </thead>
            <tbody>
                {
                    !loading && fullTreatedData !== null && fullTreatedData?.length > 0 ?
                        <>
                            {fullTreatedData
                                .slice(!remote ? startIdx : undefined, !remote ? endIdx : undefined)    //Le slice du paging doit être fait après le sort
                                .map((d, i) =>
                                    <React.Fragment key={`table-${title ?? name}-row-fragment-${d[keyField]}`} >
                                        <tr
                                            tabIndex={0}
                                            key={`table-${title ?? name}-row-${d[keyField]}`}
                                            onClick={(e) => {
                                                if (selectRow?.mode === 'radio') {
                                                    setSelectedRow(d[keyField]);
                                                    selectRow?.onSelect(d, true, i, e);
                                                } else if (editable) {
                                                    setSelectedRow(d[keyField]);
                                                }
                                            }}
                                            style={d[keyField] === selectedRow ? { backgroundColor: selectRow?.bgColor } : {}} /**ToDo AG_2022-03-14 : Could improve this by removing the damned inline style... */
                                            className={d[dirtyField] ? "row-dirty" : "" + (rowIsExpanded.includes(d[keyField]) ? expandRow?.parentClassName || "" : "")}
                                        >
                                            {
                                                selectRow?.mode === "checkbox" ?
                                                    <td>
                                                        <div className="d-flex justify-content-center align-items-center w-100">
                                                            <Input
                                                                type="checkbox"
                                                                className="m-0"
                                                                checked={selectRow.selected?.includes(d[keyField]) ?? false}
                                                                onChange={(e) => {
                                                                    selectRow.onSelect?.(d, e.target.checked, i, e);
                                                                }}
                                                            />
                                                        </div>
                                                    </td> :
                                                    null
                                            }
                                            {
                                                expandRow ?
                                                    expandRow.nonExpandable?.includes(d[keyField]) ?
                                                        <td></td> :
                                                        <td onClick={() => onExpandRow(d[keyField])}>
                                                            <div className="d-flex justify-content-center align-items-center w-100">
                                                            {
                                                                errors.some(x => x.rowId === d[keyField] && x.dataField === 'expandRow') ?
                                                                    <span className="cis-warning AlertIconActiveStyle"/> :
                                                                    runningValsAndOperations.some(x => x.rowId === d[keyField] && x.dataField === "expandRow") ?
                                                                        <SxLoading isLarge={false} /> :
                                                                        <SxExpandIcon isExpanded={rowIsExpanded.includes(d[keyField])} />
                                                            }
                                                            </div>
                                                        </td> :
                                                    null
                                            }
                                            {
                                                visibleColsFlat.map((c, i2) =>
                                                    <td
                                                        key={`table-${title ?? name}-row-${d[keyField]}-cell-${c.dataField}-${i2}`}
                                                        className={c.centerCellVertical === false ? "align-top" : "align-middle"} // La cellule sera centrée verticalement par défaut
                                                        aria-label={c.dataField}
                                                        style={c.isCentered === true ? { textAlign: 'center' } : {}}
                                                    >
                                                        {
                                                            editable &&     //La table est editable
                                                                ((selectedRow === d[keyField] || //La row sélectionner est celle rendered
                                                                    runningValsAndOperations.some(v => v.rowId === d[keyField] && v.warmup)) ||  //Durant qu'une validation roule pour une ligne, elle doit rester en mode édition
                                                                    c.editOnly) &&  //Si je n'ai pas de formatter mais que j'ai un editorRenderer la cellule est toujours en edit
                                                                getItemRight(c, metadata).canWrite && // Si les droits d'écritures sont refusé par la gestion granulaire pour cette colonne
                                                                (c.editable ?? true) ?   //La colonne est editable
                                                                <SxTableCellEdit
                                                                    id={`table-${id}-row-${i}-cell-${c.id}`}
                                                                    keyField={keyField}
                                                                    dirtyField={dirtyField}
                                                                    className={runningValsAndOperations?.find(v => v.rowId === d[keyField])?.warmup ? 'd-none' : ''}
                                                                    colDef={c}
                                                                    data={data}
                                                                    row={d}
                                                                    rowIndex={i}
                                                                    colIndex={i2}
                                                                    extraData={extraData}
                                                                    onDataChange={onUpdateValue}
                                                                    onValidate={onExecuteValidations}
                                                                    dataChangeDelegator={delegate => {
                                                                        if (!rowDelegators[d[keyField]][c.dataField].dcvInitialized) {
                                                                            setRowDelegators(rowDelegators => {
                                                                                rowDelegators[d[keyField]][c.dataField].delegatorChangeValue = delegate;
                                                                                rowDelegators[d[keyField]][c.dataField].dcvInitialized = true;
                                                                                return rowDelegators;
                                                                            });
                                                                        }
                                                                    }}
                                                                    validationDelegator={delegate => {
                                                                        if (!rowDelegators[d[keyField]][c.dataField].vInitialized) {
                                                                            setRowDelegators(rowDelegators => {
                                                                                rowDelegators[d[keyField]][c.dataField].delegatorValidations = delegate;
                                                                                rowDelegators[d[keyField]][c.dataField].vInitialized = true;
                                                                                return rowDelegators;
                                                                            });
                                                                        }
                                                                    }}
                                                                    onSetInternVal={internVal =>
                                                                        setInternVals({
                                                                            ...internVals, [d[keyField]]: { ...d[keyField], [c.dataField]: internVal }
                                                                        })}
                                                                /> :
                                                                <SxTableCellWrapper
                                                                    text={c.tooltip?.(renderValue(d[c.dataField]), d, i, { ...extraData, ...c.formatExtraData }) ?? renderValue(d[c.dataField], c)}
                                                                    truncate={c.truncateCell}
                                                                    noTooltip={c.noTooltip}
                                                                    collapseWhiteSpace={c.collapseWhiteSpace}
                                                                    cellClasses={c.cellClasses}
                                                                    cellIsTextOnly={(typeof c.formatter === 'undefined') || c.isOnlyText}
                                                                    centered={c.isCentered || (c.type === sxTableColumnTypes.Checkbox && c.isCentered !== false)}
                                                                >
                                                                    {
                                                                        c.isLinkKey === true || (typeof c.isLinkKey === 'function' && c.isLinkKey(d[c.dataField], d)) ?
                                                                            renderFormLink?.(renderValue(d[c.dataField]), d) ?? renderValue(d[c.dataField]) :
                                                                            c.formatter?.(d[c.dataField], d, i, { ...extraData, ...c.formatExtraData }) ?? <SxTableCellFormatter tableId={id} column={c} value={d[c.dataField]} row={d} rows={data} />
                                                                    }
                                                                </SxTableCellWrapper>
                                                        }
                                                        {
                                                            errors.some(err => err.rowId === d[keyField] && err.dataField === c.dataField) &&
                                                            <Alert color="danger">{errors.filter(err => err.rowId === d[keyField] && err.dataField === c.dataField)[0].message}</Alert>
                                                        }
                                                        {
                                                            runningValsAndOperations.some(val => val.rowId === d[keyField] && val.dataField === c.dataField) &&
                                                            <SxLoading isLarge={false} />
                                                        }
                                                    </td>)
                                            }
                                            {
                                                clonableLines && typeof onAddLine === 'function' ?
                                                    <td>
                                                        <SxTableCellWrapper
                                                            text={msg.tooltip.clone}
                                                        >
                                                            <SxButtonIcon
                                                                icon={icons.clone}
                                                                handleClick={() => {
                                                                    returnToFirstPage();
                                                                    onAddLine?.({ ...d, ...{ [idField]: undefined, key: undefined } });
                                                                    setIsDirtyPanel?.(true);
                                                                }}
                                                                title={msg.tooltip.clone}
                                                                sizeClass={""}
                                                                className={"w-100 h-100"}
                                                                btnClass={"w-100 h-100"}
                                                                disabled={runningValsAndOperations.length > 0} //La duplication des lignes est bloquer durant que la table travail.
                                                            />
                                                        </SxTableCellWrapper>
                                                    </td> :
                                                    null
                                            }
                                            {
                                                canRemoveLine && typeof onRemoveLine === "function" ?
                                                    <td>
                                                        <SxTableCellWrapper
                                                            text={msg.tooltip.removeRow}
                                                        >
                                                            <SxButtonIcon
                                                                icon={icons.delete}
                                                                handleClick={() => handleRemoveLine(d)}
                                                                title={msg.tooltip.removeRow}
                                                                sizeClass={""}
                                                                className={"w-100 h-100"}
                                                                btnClass={"w-100 h-100"}
                                                                disabled={runningValsAndOperations.length > 0 ||
                                                                    !(typeof isLineDeletable !== "function" || isLineDeletable(d, extraData))} //La suppression des lignes est bloquer durant que la table travail.
                                                            />
                                                        </SxTableCellWrapper>
                                                    </td> :
                                                    null
                                            }
                                        </tr>
                                        {
                                            expandRow && !expandRow.nonExpandable?.includes(d[keyField]) && (expandRow.lazyLoading === false || rowIsExpanded.some(x => x === d[keyField])) ?
                                                <tr className={rowIsExpanded.some(x => x === d[keyField]) ? "" : "d-none"}>
                                                    <td colSpan={visibleColsFlat.length + 1}>
                                                        {expandRow.renderer(d, i, delegate => addExpandValidation(d[keyField], delegate), () => endExpandError(d), () => startExpandError(d))}
                                                    </td>
                                                </tr> :
                                                null
                                        }
                                    </React.Fragment>
                                )}
                            {visibleCols?.some(x => x.summary) && <SxTableSummary data={data} colDefs={visibleCols?.filter(x => x.summary)} />}
                        </> :
                        null
                }
            </tbody>
        </table>
        {
            loading ?
                <SxLoading /> :
                fullTreatedData === null ?
                    <div colSpan={visibleColsFlat.length}><SxDataErrorIndicator /></div> :
                    fullTreatedData?.length === 0 &&
                    <div colSpan={visibleColsFlat.length}><SxNoDataIndicator /></div>
        }
        {usePagination &&
            <SxTablePaging
                nbPerPage={_pageSize}
                nbElem={!remote ? fullTreatedData?.length : totalNbElements}
                currPage={!remote ? _page : page}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                fixedPageSize={fixedPageSize}
            />
        }

        {!usePagination &&
            <div className="d-flex">
                <span className="mt-1 mr-2">
                    {`${vsprintf(msg.label.numberOfItem0, [(!remote ? fullTreatedData?.length : totalNbElements)?.toString?.()])}`}
                </span>
            </div>
        }
    </div>;
};


SxTable.propTypes = {
    actionsList: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
            ]).isRequired,
            isActive: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
            label: PropTypes.string.isRequired,
            onClick: PropTypes.func,
        }),
    ),
    bordered: PropTypes.bool,
    canAdd: PropTypes.bool,
    canAddLine: PropTypes.bool,
    canExport: PropTypes.bool,
    canRemoveLine: PropTypes.bool,
    canSave: PropTypes.bool,
    canSearch: PropTypes.bool,
    canSelectAll: PropTypes.bool,
    columns: PropTypes.arrayOf(
        PropTypes.shape(
            sxTableColumnPropTypes
        )),
    columnToggler: PropTypes.bool,
    customTableControls: PropTypes.array,
    data: PropTypes.array,
    filteredData: PropTypes.array,
    dirtyField: PropTypes.string,
    doPageChange: PropTypes.func,
    doPageSizeChange: PropTypes.func,
    doSearchChange: PropTypes.func,
    doSearchClear: PropTypes.func,
    doSortChange: PropTypes.func,
    doUpdateData: PropTypes.func,
    doImport: PropTypes.func,
    allowedFormats: PropTypes.array,
    editable: PropTypes.bool,
    validateAllOnSave: PropTypes.bool,
    noValidationOnSave: PropTypes.bool,
    expandRow: PropTypes.shape({
        lazyLoading: PropTypes.bool,
        nonExpandable: PropTypes.array,
        parentClassName: PropTypes.string,
        renderer: PropTypes.func.isRequired,
        validation: PropTypes.func
    }),
    fixedPageSize: PropTypes.bool,
    extraData: PropTypes.object,
    getDataExportCsv: PropTypes.func,
    icons: PropTypes.shape({
        filter: PropTypes.string,
        clear: PropTypes.string,
        delete: PropTypes.string,
        sort: PropTypes.shape({
            none: PropTypes.string,
            ascending: PropTypes.string,
            descending: PropTypes.string,
        }),
    }),
    isLineDeletable: PropTypes.func,
    keyField: PropTypes.string,
    loading: PropTypes.bool,
    msg: PropTypes.shape({
        ariaLabel: PropTypes.shape({
            sortColumn: PropTypes.string,
        }),
        button: PropTypes.shape({
            cancel: PropTypes.string,
            save: PropTypes.string,
        }),
        label: PropTypes.shape({
            numberOfItem0: PropTypes.string,
        }),
        tooltip: PropTypes.shape({
            exportCsv: PropTypes.string,
            removeRow: PropTypes.string,
            toggleCols: PropTypes.string,
        }),
    }),
    name: PropTypes.string,
    onAddLine: PropTypes.func,
    onCancel: (props, _propName, _component, _location) => {
        if (props.canSave && typeof props.onCancel !== 'function') {
            return new Error("Error validating props for SxTable.  When property canSave is true, onCancel must be a function.");
        }
    },
    onDataChange: PropTypes.func,
    onRemoveLine: PropTypes.func,
    onSave: (props, _propName, _component, _location) => {
        if (props.canSave && typeof props.onSave !== 'function') {
            return new Error("Error validating props for SxTable.  When property canSave is true, onSave must be a function.");
        }
    },
    onSaveSuccess: (props, _propName, _component, _location) => {
        if (props.canSave && props.onSave && typeof props.onSave !== 'function') {
            return new Error("Error validating props for SxTable.  When property canSave is true, onSave must be a function if defined.");
        }
    },
    onValErrorEnd: PropTypes.func,
    onValErrorStart: PropTypes.func,
    onValidateCanAdd: PropTypes.func,
    openForm: PropTypes.func,
    orderByDragOnAfterUpdate: orderByDragOnAfterUpdatePropTypesValidator,    //Fonction de callback appelée après avoir ordonné les lignes via le glisser-déposer.
    orderByDragValueDataField: orderByDragValueDataFieldPropTypesValidator,  //Champs sur lequel se baser pour ordonner les lignes via le glisser-déposer.
    page: PropTypes.number,
    pageSize: PropTypes.number,
    remote: PropTypes.bool,
    renderFilterBar: PropTypes.func,
    renderFilterOpenBtn: PropTypes.func,
    renderFormLink: PropTypes.func,
    selectRow: PropTypes.shape({
        bgColor: PropTypes.string,
        mode: PropTypes.string.isRequired,
        onSelectAll: PropTypes.func,
        selected: PropTypes.array,
    }),
    setIsDirtyPanel: PropTypes.func,
    striped: PropTypes.bool,
    submitDelegator: PropTypes.func,
    cancelDelegator: PropTypes.func,
    title: PropTypes.string,
    togglerExcludedColDataFields: PropTypes.array,
    totalNbElements: PropTypes.number,
    tryToLaunchPcModal: PropTypes.func,
    usePagination: PropTypes.bool,
    validateDelegator: PropTypes.func,
    idField: PropTypes.string
};

SxTable.defaultProps = {
    canAdd: false,          // Par défaut, le bouton "+"  n'est pas disponible dans une table standard, dans le cas contraire forcer la props à true.
    canExport: true,        // Par défaut, le bouton "Exporter CSV" est disponible dans une table standard, dans le cas contraire forcer la props à false.
    canSearch: true,        // Par défaut, le bouton "Loupe" de recherche est disponible dans une table standard, dans le cas contraire forcer la props à false.
    canSelectAll: true,     // Par défaut, la case à cocher "Sélectionner tout" est visible pour une table standard avec des lignes sélectionnables, dans le cas contraire forcer la props à false.
    usePagination: true,
    fixedPageSize: false,
    bordered: true,
    canRemoveLine: false,
    page: 1,
    pageSize: 10,

    striped: false,
    icons: icons,

    keyField: "id",
    dirtyField: "isDirty",
    newLineField: "isNewLine",
    idField: "id",

    validateAllOnSave: false,
    noValidationOnSave: false,

    msg: sxTableDefaultMsg,
};

SxTable.displayName = "SxTable";

export { sxTableDefaultMsg };
const SxTableBase = withConfigs(SxTable);
export { SxTableBase, SxTable as SxTableNoConfig };
export default withModalFormLink(withSxMetadataInspectorContainer(withTableColumnAccessors(withConfigs(SxTable))));