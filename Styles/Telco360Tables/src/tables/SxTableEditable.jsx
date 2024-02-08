import React from 'react';

import SxTable from './SxTable';

import { withSxEditablePanel, withConfigs } from '@telco360/components';


const SxTableEditable = (props) =>
    <SxTable
        {...props}
        editable={true}
    />;

SxTableEditable.displayName = "SxTableEditable";

export const SxTableEditableNoPending = SxTableEditable;
export default withSxEditablePanel(withConfigs(SxTableEditable));