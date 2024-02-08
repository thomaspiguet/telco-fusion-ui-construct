import React from 'react';
import PropTypes from 'prop-types';
import sxTableColumnPropTypes from './SxTable.columnPropTypes';
import SxTableCellWrapper from './SxTable.cellWrapper';


const getSum = (data, col) => {
    return data.reduce((acc, current) => acc + current[col.dataField], 0);
};

const SxTableSummary = ({ data, colDefs }) => {
    return <tr className={'sxTable-summary'}>
        {colDefs?.map(c =>
            <td
                key={`colSummary-${c.dataField}`}
                colSpan={c.summary.colSpan || 1}
            >
                <SxTableCellWrapper
                    text={c.summary.value || c.summary.calc?.(data) || getSum(data, c)}
                    cellIsTextOnly={true}
                    centered={c.summary.isCentered}
                    collapseWhiteSpace={c.collapseWhiteSpace}
                >
                    {c.summary.value || c.summary.calc?.(data) || getSum(data, c)}
                </SxTableCellWrapper>
            </td>

        )}
    </tr>
};

SxTableSummary.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.arrayOf(
        PropTypes.shape(
            sxTableColumnPropTypes
        )),
};

export default SxTableSummary;