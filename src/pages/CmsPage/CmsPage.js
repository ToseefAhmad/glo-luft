import './CmsPage.scss';

import React from 'react';
import {CmsPageContainer, CmsBlockContainer} from '@luft/cms';
import type {EntityUrl} from '@luft/types';

import {HreflangsComponent} from 'bat-core/common';
import {CmsMenuSetContainer} from 'bat-core/cms';

type Props = {
    entityId: string,
    entityUrl: EntityUrl
};

export const CmsPage = (props: Props) => {
    const {entityId, entityUrl, ...other} = props;

    return (
        <div className="cms-page">
            <CmsBlockContainer cmsBlockId="cms-page-top"
                               group="cms-page"/>
            <HreflangsComponent hreflangs={entityUrl?.hreflangs}/>
            <div className="cms-page-body">
                <CmsMenuSetContainer entityUrl={entityUrl.url}/>
                <CmsPageContainer cmsPageId={entityId}
                                  {...other}/>
            </div>
            <CmsBlockContainer cmsBlockId="cms-page-bottom"
                               group="cms-page"/>
        </div>
    );
};
