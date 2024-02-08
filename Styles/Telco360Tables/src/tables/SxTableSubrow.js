import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { SxLoading } from '@telco360/components';

const withSxTableSubrow = (WrappedComponent) => {
    const SxTableSubrow = ({ getData, groupData, parentIdValue, parentRow, getSubData, keyColumn, ...props}) => {
        let [data, setData] = useState([]);
        let [isLoading, setIsLoading] = useState(true);
        let [groupIdList, setGroupId] = useState(parentIdValue);
        useEffect(() => {
            async function fetchData() {
                let tmp = await getData();
                let groupIdTemp = [];
                if (tmp.length > 0 && groupData) {
                    ({ tmp, groupIdTemp } = await groupData(tmp, parentRow));
                    setGroupId(groupIdTemp);
                    setData(tmp);
                }
                setIsLoading(false);
            }
            fetchData();
        }, [getData, groupData, parentIdValue, parentRow]);

        const getSubComponent = (hasNoChildList) => {
            const expandRow =
            {
                renderer: (row, _rowIndex) => {
                    return <SxTableSubrow
                        {...props.overrideProps}
                        title={props.title}
                        paramIsInitHidden={false}
                        keyColumn={keyColumn}
                        getData={() => getSubData(row[keyColumn.fieldName])}
                        getSubData={(parentId) => getSubData(parentId)}
                        checkIfSubData={props.checkIfSubData}
                        name={`table-${row[keyColumn]}`}
                        parentRow={row}
                        groupData={groupData}
                        canWrite={props.canWrite}
                    />
                },
                nonExpandable: hasNoChildList,
                parentClassName: 'sxtable-row-expended',
            };
            return expandRow;
        }
        return isLoading ?
            <SxLoading /> : 
            data.map((dt, index) => {
                return <WrappedComponent
                    {...props}
                    {...groupIdList[index].wrappedComponentProps}
                    getData={getData}
                    groupData={groupData} 
                    parentIdValue={parentIdValue}
                    parentRow={parentRow} 
                    getSubData={getSubData}
                    keyColumn={keyColumn}
                    data={dt}
                    expandRow={getSubComponent(groupIdList[index].hasNoChildList)}
                />
            });
    };

    SxTableSubrow.displayName =  `SxTableSubrow(${(WrappedComponent?.displayName || WrappedComponent?.name || 'Component')})`;

    SxTableSubrow.propTypes = {
        keyColumn: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
        title: PropTypes.string,
        getData: PropTypes.func.isRequired,
        getSubData: PropTypes.func.isRequired,
        checkIfSubData: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.bool,
        ]),
        groupData: PropTypes.func.isRequired,
        canWrite: PropTypes.bool,
    };

    return SxTableSubrow;
};

export default withSxTableSubrow;