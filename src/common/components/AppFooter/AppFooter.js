import './AppFooter.scss';

import React from 'react';
import {useRouteMatch} from 'react-router';

import {CmsBlockContainer} from '@luft/cms';
import {AddToHomeScreenComponent} from '@luft/add-to-homescreen';
import {NewsletterContainer} from '@luft/newsletter';

export function AppFooter() {
    const shouldRenderNewsletter = !useRouteMatch(['/cart', '/checkout']);

    return (
        <div className="app-footer">
            <div className="app-footer-top">
                <div className="app-footer-top-right">
                    {shouldRenderNewsletter && <NewsletterContainer/>}
                    <CmsBlockContainer cmsBlockId="footer-follow-us"
                                       group="footer"/>
                </div>

                <CmsBlockContainer className="app-footer-links"
                                   cmsBlockId="footer-links"
                                   group="footer"/>
            </div>

            <div className="app-footer-bottom-wrapper">
                <div className="app-footer-bottom">
                    <div className="app-footer-bottom-logo"/>

                    <div className="app-footer-bottom-content">
                        <CmsBlockContainer cmsBlockId="footer-copyright"
                                           group="footer"/>
                        <AddToHomeScreenComponent/>
                    </div>
                </div>
            </div>
        </div>
    );
}
