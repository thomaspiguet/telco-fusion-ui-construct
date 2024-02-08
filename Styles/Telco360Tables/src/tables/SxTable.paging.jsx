import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { Input } from 'reactstrap';

import { SxSelect, SxButton, withConfigs } from '@telco360/components';

import { useUpdate } from '@telco360/commonjs';

const changePage = (page, nbPerPage, onPageChange) => {
    var startIdx = (page - 1) * nbPerPage;
    var endIdx = startIdx + (nbPerPage || 1);

    onPageChange(page, startIdx, endIdx);
};

const generateNavBtn = (nbPages, maxNbButtons, currPage, nbPerPage, onPageChange) => {
    let toReturn = [];

    if (nbPages > 1) {
        let minPage = 1;
        let maxPage = nbPages;

        if (nbPages > maxNbButtons) {
            minPage = currPage - Math.trunc(maxNbButtons / 2);
            minPage = minPage >= 1 ? minPage : 1;
            maxPage = maxNbButtons ? minPage + maxNbButtons - 1 : nbPages;
            maxPage = maxPage > nbPages ? nbPages : maxPage;

            if (minPage > 1) {
                toReturn.push(<SxButton key="btn-page-first" className="mr-1" onClick={() => changePage(1, nbPerPage, onPageChange)}>
                    {'<<'}
                </SxButton>);
            }
        }

        let ctr = minPage;

        if (currPage !== 1) {
            toReturn.push(<SxButton key="btn-page-prev" className="mr-1" onClick={() => changePage(currPage - 1, nbPerPage, onPageChange)}>
                {'<'}
            </SxButton>);
        }

        while (ctr <= maxPage) {
            toReturn.push(<SxButton key={`btn-page-${ctr}`} className={ctr === currPage ? 'btn-primary mr-1' : 'mr-1'}
                value={ctr}
                onClick={(e) => changePage(parseInt(e.target.value), nbPerPage, onPageChange)}>
                {ctr}
            </SxButton>);
            ctr++;
        }

        if (currPage !== nbPages) {
            toReturn.push(<SxButton key="btn-page-next" className="mr-1" onClick={() => changePage(currPage + 1, nbPerPage, onPageChange)}>
                {'>'}
            </SxButton>);
        }

        if (nbPages > maxNbButtons) {
            if (maxPage !== nbPages) {
                toReturn.push(<SxButton key="btn-page-last" className="mr-1" onClick={() => changePage(nbPages, nbPerPage, onPageChange)}>
                    {'>>'}
                </SxButton>);
            }
        }
    }
    return toReturn;
};


const SxTablePaging = ({ nbPerPage, fixedPageSize, nbElem, onPageChange, onPageSizeChange, currPage, maxNbButtons, msg }) => {
    const [value, setValue] = useState(); //value est conservé dans le state uniquement afin de permettre la modification de la valeur et d'effectuer un event onPAgeChange lorsque le focus est retiré du champs d'Input.

    const [options, setOptions] = useState([
        { value: 10, label: '10' + msg.sizePerPageLbl },
        { value: 25, label: '25' + msg.sizePerPageLbl },
        { value: 50, label: '50' + msg.sizePerPageLbl },
        { value: 100, label: '100' + msg.sizePerPageLbl },
        { value: 250, label: '250' + msg.sizePerPageLbl }
    ]);

    useEffect(() => {
        if (!options.some(o => o.value === nbPerPage)) {
            setOptions([...options, { value: nbPerPage, label: `${nbPerPage.toString()} ${msg.sizePerPageLbl}` }]
                .sort((a, b) => a.value < b.value ? -1 : a.value > b.value ? 1 : 0));
        }
    }, [nbPerPage]);

    const valueUpdated = (e) => {
        let tmpVal = parseInt(e.target.value);
        if (tmpVal !== currPage &&
            tmpVal !== value &&
            Number.isInteger(tmpVal)) {
            if (tmpVal > parseInt(e.target.max)) {
                e.target.value = e.target.max
            } else if (tmpVal < parseInt(e.target.min)) {
                e.target.value = e.target.min;
            }
            let resultVal = parseInt(e.target.value);
            changePage(resultVal, nbPerPage, onPageChange);
        }
        setValue(); //Nous remettons le value du state à undefined afin de permettre de géré la page actuelle via le props
    }

    useEffect(() => {
        if (typeof currPage === 'undefined') {
            changePage(1, nbPerPage, onPageChange); //Nous effectuons une sélection automatique de la première page lorsque aucune n'est sélectionné.
        }
    }, [currPage]);

    useUpdate(() => {
        if (typeof nbPerPage !== 'undefined' &&
            currPage !== 1) {   //Nous effectuons le changement de page uniquement si nous ne sommes pas déjà sur la première page.
            changePage(1, nbPerPage, onPageChange);
        }
    }, [nbPerPage]);

    const totalPage = useCallback(() =>
        Math.ceil(nbElem / nbPerPage), [nbElem, nbPerPage]);

    useEffect(() => {
        let totalPages = totalPage();
        if (totalPages > 0 && currPage > totalPages) {
            changePage(totalPages, nbPerPage, onPageChange)
        }
    }, [totalPage, currPage, nbPerPage, onPageChange]);

    return <div className={`d-flex flex-wrap${totalPage() > 1 ? ' mt-1' : ''}`} aria-label="Pagination"> {/*ToDo AG_2022-03-14 : Use language */}
        {totalPage() > 1 &&
            <>
                {generateNavBtn(totalPage(), maxNbButtons, currPage, nbPerPage, onPageChange)}
                <Input
                    className="ml-1"
                    style={{ width: "80px" }}
                    placeholder={msg.goPage}
                    value={typeof value !== 'undefined' ? value : currPage}
                    type="number"
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={valueUpdated}
                    onKeyDown={(e) => { if (e.key === "Enter") valueUpdated(e) }}
                    min={1}
                    max={totalPage()}
                />
                <span className="ml-1 mt-1 mr-5">
                    {` / ${totalPage()} ${msg.totalPage}`}
                </span>
            </>
        }
        {!fixedPageSize && (options || [])[0].value < nbElem &&
            <div className="d-flex">
                <span className="mt-1 mr-2">
                    {msg.pageSizeList}
                </span>
                <SxSelect
                    options={options}
                    sort={false}
                    value={nbPerPage}
                    clearable={false}
                    onChange={(newValue, _lbl) => {
                        changePage(1, newValue, onPageChange); //Nous devons faire le changement de page avant de faire le resize.
                        onPageSizeChange(newValue);
                    }}
                />
            </div>
        }
    </div>
};

SxTablePaging.propTypes = {
    currPage: PropTypes.number,
    fixedPageSize: PropTypes.bool,
    maxNbButtons: PropTypes.number,
    msg: PropTypes.object,
    nbElem: PropTypes.number.isRequired,
    nbPerPage: PropTypes.number,
    onPageChange: PropTypes.func.isRequired,
    onPageSizeChange: PropTypes.func.isRequired,
};

SxTablePaging.defaultProps = {
    nbPerPage: 10,
    maxNbButtons: 5,
    fixedPageSize: false,
    msg: {
        goPage: "Aller à",
        totalPage: "pages totales",
        pageSizeList: "Items par page",
        sizePerPageLbl: " / page"
    }
};

SxTablePaging.displayName = "SxTablePaging";

export default withConfigs(SxTablePaging);