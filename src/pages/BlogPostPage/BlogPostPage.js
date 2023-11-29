import './BlogPostPage.scss';

import React from 'react';

import {BlogPostContainer, BlogPostMetaContainer} from 'bat-core/blog';

type Props = {
    entityId: number
};

export function BlogPostPage(props: Props) {
    const {entityId} = props;

    return (
        <div className="blog-post-page">
            <BlogPostMetaContainer blogId={entityId}/>
            <BlogPostContainer blogId={entityId}
                               blogMarketTitle="glo"/>
        </div>
    );
}
